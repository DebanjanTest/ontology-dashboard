from __future__ import annotations

import asyncio
import os
import random
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Dict, List, Literal, Optional

import networkx as nx
from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import Float, Integer, String, DateTime, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

try:
    from neo4j import AsyncGraphDatabase
except Exception:
    AsyncGraphDatabase = None

load_dotenv()

# Vercel filesystem is read-only, except for /tmp. If no Postgres DB is set, put SQLite in /tmp.
is_vercel = os.getenv("VERCEL") == "1"
default_db = "sqlite+aiosqlite:////tmp/ontology.db" if is_vercel else "sqlite+aiosqlite:///./ontology.db"
raw_db_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL", default_db)

# Force the asyncpg driver for PostgreSQL to ensure SQLAlchemy async compatibility
if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_db_url.startswith("postgresql://"):
    DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = raw_db_url
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")


class Base(DeclarativeBase):
    pass


class FeedEventDB(Base):
    __tablename__ = "feed_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source: Mapped[str] = mapped_column(String(64), index=True)
    domain: Mapped[str] = mapped_column(String(64), index=True)
    headline: Mapped[str] = mapped_column(String(500))
    sentiment: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[int] = mapped_column(Integer, index=True)
    url: Mapped[str] = mapped_column(String(500))


class SourceStatusDB(Base):
    __tablename__ = "source_status"

    source: Mapped[str] = mapped_column(String(64), primary_key=True)
    latency: Mapped[str] = mapped_column(String(64))
    last_updated: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


engine = create_async_engine(DATABASE_URL, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Neo4jRepo:
    def __init__(self):
        self.driver = None
        self.available = False

    async def connect(self):
        if not (NEO4J_URI and AsyncGraphDatabase):
            return
        try:
            self.driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
            async with self.driver.session() as s:
                await s.run("RETURN 1")
            self.available = True
        except Exception:
            self.available = False

    async def close(self):
        if self.driver:
            await self.driver.close()

    async def upsert_node(self, node_id: str, label: str, node_type: str, domain: str, risk: float, metadata: Dict):
        if not self.available:
            return
        q = """
        MERGE (n:Entity {id: $id})
        SET n.label=$label, n.type=$type, n.domain=$domain, n.risk_score=$risk, n.metadata=$metadata
        """
        async with self.driver.session() as s:
            await s.run(q, id=node_id, label=label, type=node_type, domain=domain, risk=risk, metadata=metadata)

    async def upsert_edge(self, src: str, dst: str, predicate: str, confidence: float, impact: float):
        if not self.available:
            return
        q = """
        MATCH (a:Entity {id:$src}), (b:Entity {id:$dst})
        MERGE (a)-[r:REL {predicate:$predicate}]->(b)
        SET r.confidence=$confidence, r.impact_score=$impact
        """
        async with self.driver.session() as s:
            await s.run(q, src=src, dst=dst, predicate=predicate, confidence=confidence, impact=impact)


neo4j_repo = Neo4jRepo()

app = FastAPI(title="Global Ontology Engine", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

BASE_DIR = Path(__file__).resolve().parents[1]
UI_DIST_DIR = BASE_DIR / "ui" / "dist"
UI_ASSETS_DIR = UI_DIST_DIR / "assets"
if UI_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(UI_ASSETS_DIR)), name="ui-assets")


class Entity(BaseModel):
    id: str
    label: str
    type: Literal["Country", "Organization", "Event", "Person", "EconomicIndicator", "ClimateSignal", "DataSource"]
    domain: Literal["Geopolitics", "Economics", "Defense", "Climate", "Technology", "Society"]
    risk_score: float = 0.0
    metadata: Dict = {}


class Relation(BaseModel):
    source: str
    target: str
    predicate: str
    confidence: float = 0.8
    impact_score: float = 0.5


class FeedItem(BaseModel):
    timestamp: str
    source: str
    domain: str
    headline: str
    sentiment: float
    risk_score: float
    url: str


class NLQuery(BaseModel):
    query: str


class CascadeRequest(BaseModel):
    start_node: str
    max_hops: int = 3


G = nx.DiGraph()
CONNECTIONS: List[WebSocket] = []
SIM_TASK: Optional[asyncio.Task] = None

SOURCE_LATENCY = {
    "GDELT": "15 min",
    "ACLED": "24 hr",
    "WorldBank": "24 hr+",
    "NASA_POWER": "48 hr",
    "arXiv": "12 hr",
    "NewsAPI": "near-live (quota bound)",
}

SOURCE_RELIABILITY = {
    "ACLED": 0.92,
    "WorldBank": 0.95,
    "GDELT": 0.82,
    "NASA_POWER": 0.88,
    "arXiv": 0.80,
    "NewsAPI": 0.72,
}

DOMAIN_BASELINE = {
    "Defense": 62,
    "Geopolitics": 58,
    "Economics": 52,
    "Climate": 50,
    "Technology": 47,
    "Society": 42,
}

DOMAIN_WEIGHTS = {
    "Defense": 0.25,
    "Geopolitics": 0.25,
    "Economics": 0.20,
    "Climate": 0.15,
    "Technology": 0.10,
    "Society": 0.05,
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


async def db_init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        for source, latency in SOURCE_LATENCY.items():
            row = await db.get(SourceStatusDB, source)
            if not row:
                db.add(SourceStatusDB(source=source, latency=latency, last_updated=None))
        await db.commit()


def upsert_entity_local(e: Entity):
    G.add_node(
        e.id,
        id=e.id,
        label=e.label,
        type=e.type,
        domain=e.domain,
        risk_score=e.risk_score,
        metadata=e.metadata,
    )


async def upsert_entity(e: Entity):
    upsert_entity_local(e)
    await neo4j_repo.upsert_node(e.id, e.label, e.type, e.domain, e.risk_score, e.metadata)


def upsert_relation_local(r: Relation):
    G.add_edge(r.source, r.target, predicate=r.predicate, confidence=r.confidence, impact_score=r.impact_score)


async def upsert_relation(r: Relation):
    upsert_relation_local(r)
    await neo4j_repo.upsert_edge(r.source, r.target, r.predicate, r.confidence, r.impact_score)


async def seed_graph():
    seed_nodes = [
        Entity(id="country_india", label="India", type="Country", domain="Geopolitics", risk_score=62),
        Entity(id="country_china", label="China", type="Country", domain="Geopolitics", risk_score=68),
        Entity(id="event_lac", label="LAC Tension", type="Event", domain="Defense", risk_score=78),
        Entity(id="econ_rupee", label="INR Volatility", type="EconomicIndicator", domain="Economics", risk_score=66),
        Entity(id="climate_monsoon", label="Monsoon Deficit", type="ClimateSignal", domain="Climate", risk_score=71),
        Entity(id="org_brics", label="BRICS", type="Organization", domain="Geopolitics", risk_score=42),
        Entity(id="tech_semicon", label="Semiconductor Access", type="Event", domain="Technology", risk_score=64),
    ]
    for n in seed_nodes:
        await upsert_entity(n)

    seed_edges = [
        Relation(source="country_china", target="event_lac", predicate="INVOLVED_IN", confidence=0.92, impact_score=0.8),
        Relation(source="country_india", target="event_lac", predicate="INVOLVED_IN", confidence=0.95, impact_score=0.9),
        Relation(source="event_lac", target="econ_rupee", predicate="AFFECTS", confidence=0.86, impact_score=0.74),
        Relation(source="climate_monsoon", target="econ_rupee", predicate="AFFECTS", confidence=0.81, impact_score=0.61),
        Relation(source="event_lac", target="tech_semicon", predicate="TRIGGERS", confidence=0.77, impact_score=0.58),
        Relation(source="country_india", target="org_brics", predicate="MEMBER_OF", confidence=0.99, impact_score=0.3),
        Relation(source="country_china", target="org_brics", predicate="MEMBER_OF", confidence=0.99, impact_score=0.3),
    ]
    for e in seed_edges:
        await upsert_relation(e)


async def save_feed_item(item: FeedItem):
    async with SessionLocal() as db:
        db.add(
            FeedEventDB(
                timestamp=datetime.fromisoformat(item.timestamp),
                source=item.source,
                domain=item.domain,
                headline=item.headline,
                sentiment=item.sentiment,
                risk_score=int(item.risk_score),
                url=item.url,
            )
        )
        status = await db.get(SourceStatusDB, item.source)
        if status:
            status.last_updated = datetime.fromisoformat(item.timestamp)
        await db.commit()


async def get_feed_items(limit: int = 25) -> List[FeedItem]:
    async with SessionLocal() as db:
        rs = await db.execute(select(FeedEventDB).order_by(FeedEventDB.timestamp.desc()).limit(limit))
        rows = rs.scalars().all()
        items: List[FeedItem] = []
        for r in rows:
            ts = r.timestamp
            # SQLite may drop tzinfo; treat naive timestamps as UTC.
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            ts = ts.astimezone(timezone.utc)
            items.append(
                FeedItem(
                    timestamp=ts.isoformat(),
                    source=r.source,
                    domain=r.domain,
                    headline=r.headline,
                    sentiment=r.sentiment,
                    risk_score=r.risk_score,
                    url=r.url,
                )
            )
        return items


async def get_source_status() -> Dict:
    async with SessionLocal() as db:
        rs = await db.execute(select(SourceStatusDB))
        rows = rs.scalars().all()
        out = {}
        for r in rows:
            lu = r.last_updated
            if lu and lu.tzinfo is None:
                lu = lu.replace(tzinfo=timezone.utc)
            out[r.source] = {"latency": r.latency, "last_updated": lu.isoformat() if lu else None}
        return out


def compute_domain_scores() -> Dict[str, float]:
    domain_vals: Dict[str, List[float]] = {d: [] for d in DOMAIN_WEIGHTS.keys()}
    for _, data in G.nodes(data=True):
        d = data.get("domain")
        if d in domain_vals:
            domain_vals[d].append(float(data.get("risk_score", 0)))
    return {d: (round(sum(vals) / len(vals), 2) if vals else 0.0) for d, vals in domain_vals.items()}


def compute_nvi() -> float:
    ds = compute_domain_scores()
    return round(sum(ds[d] * w for d, w in DOMAIN_WEIGHTS.items()), 2)


def classify_risk(v: float) -> str:
    # Standardized 5-band risk scale
    if v >= 85:
        return "CRITICAL"
    if v >= 70:
        return "HIGH"
    if v >= 55:
        return "ELEVATED"
    if v >= 35:
        return "GUARDED"
    return "LOW"


def compute_risk_score(domain: str, source: str, sentiment: float, conflict_terms: int, urgency: int) -> int:
    """
    Risk scoring model (0-100):
    - domain baseline
    - sentiment negativity boost
    - conflict signal boost
    - source reliability weighting
    - urgency indicator
    """
    base = DOMAIN_BASELINE.get(domain, 50)
    reliability = SOURCE_RELIABILITY.get(source, 0.75)

    # Sentiment in [-1, +1], only negative contributes to risk strongly.
    negativity = max(0.0, -float(sentiment))

    score = (
        base
        + (negativity * 28.0)
        + (float(conflict_terms) * 4.2)
        + ((reliability - 0.5) * 22.0)
        + (float(urgency) * 2.8)
    )

    return int(max(0, min(100, round(score))))


def nl_to_graph_answer(q: str) -> Dict:
    ql = q.lower()
    if "india" in ql and "china" in ql:
        paths = []
        try:
            for path in nx.all_simple_paths(G, "country_india", "country_china", cutoff=3):
                paths.append(path)
        except nx.NetworkXNoPath:
            pass
        return {"intent": "path_query", "question": q, "answer": "Top relationship paths between India and China.", "paths": paths[:5]}

    if "top" in ql and "risk" in ql:
        ranked = sorted(G.nodes(data=True), key=lambda x: x[1].get("risk_score", 0), reverse=True)
        return {
            "intent": "ranked_risk",
            "question": q,
            "answer": "Top high-risk nodes.",
            "nodes": [{"id": n, "label": d.get("label"), "risk": d.get("risk_score"), "domain": d.get("domain")} for n, d in ranked[:8]],
        }
    return {"intent": "fallback", "question": q, "answer": "Use examples: 'top 5 risks India' or 'events connecting India and China'."}


def cascade(start_node: str, max_hops: int = 3):
    if start_node not in G:
        return []
    base = float(G.nodes[start_node].get("risk_score", 50))
    scores = {start_node: base}

    for target in G.nodes:
        if target == start_node:
            continue
        try:
            sp = nx.shortest_path(G, start_node, target)
            hops = len(sp) - 1
            if hops <= 0 or hops > max_hops:
                continue
            impact_prod = 1.0
            for i in range(len(sp) - 1):
                edge = G.get_edge_data(sp[i], sp[i + 1])
                impact_prod *= float(edge.get("impact_score", 0.5))
            scores[target] = round(min(100, base * impact_prod * (1 / hops)), 2)
        except nx.NetworkXNoPath:
            continue

    return sorted(
        [{"id": n, "label": G.nodes[n].get("label"), "risk_propagation": s, "domain": G.nodes[n].get("domain")} for n, s in scores.items()],
        key=lambda x: x["risk_propagation"],
        reverse=True,
    )


async def broadcast(item: Dict):
    dead = []
    for ws in CONNECTIONS:
        try:
            await ws.send_json(item)
        except Exception:
            dead.append(ws)
    for d in dead:
        if d in CONNECTIONS:
            CONNECTIONS.remove(d)


async def ingestion_simulator():
    domains = ["Geopolitics", "Defense", "Economics", "Climate", "Technology", "Society"]
    sources = list(SOURCE_LATENCY.keys())
    headlines = [
        "Border logistics activity rises near high-altitude zone",
        "Commodity pressure seen after supply chain disruption",
        "Climate stress warning issued for monsoon variability",
        "Strategic technology export controls discussed by bloc",
        "Defense posture review triggers budget speculation",
        "Regional cooperation meeting discusses security protocol",
    ]

    while True:
        source = random.choice(sources)
        domain = random.choice(domains)
        h = random.choice(headlines)
        sentiment = round(random.uniform(-0.85, 0.35), 2)
        conflict_terms = random.randint(0, 5)
        urgency = random.randint(0, 4)
        risk = compute_risk_score(domain=domain, source=source, sentiment=sentiment, conflict_terms=conflict_terms, urgency=urgency)

        fi = FeedItem(timestamp=now_iso(), source=source, domain=domain, headline=h, sentiment=sentiment, risk_score=risk, url="https://example.org/source-event")
        await save_feed_item(fi)

        node_id = f"event_{int(datetime.now().timestamp())}_{random.randint(100,999)}"
        await upsert_entity(
            Entity(id=node_id, label=h[:40], type="Event", domain=domain, risk_score=risk, metadata={"source": source, "time": fi.timestamp})
        )
        await upsert_relation(Relation(source="country_india", target=node_id, predicate="INVOLVED_IN", confidence=0.72, impact_score=0.6))
        await upsert_relation(
            Relation(source=node_id, target=random.choice(["event_lac", "econ_rupee", "climate_monsoon", "tech_semicon"]), predicate="AFFECTS", confidence=0.68, impact_score=0.55)
        )

        await broadcast({"type": "feed_update", "item": fi.model_dump()})
        await asyncio.sleep(12)


@app.on_event("startup")
async def startup():
    await db_init()
    await neo4j_repo.connect()
    await seed_graph()
    global SIM_TASK
    SIM_TASK = asyncio.create_task(ingestion_simulator())


@app.on_event("shutdown")
async def shutdown():
    if SIM_TASK:
        SIM_TASK.cancel()
    await neo4j_repo.close()
    await engine.dispose()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    ui_index = UI_DIST_DIR / "index.html"
    if ui_index.exists():
        return FileResponse(str(ui_index))
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/graph")
async def get_graph(limit: int = Query(400, ge=50, le=5000)):
    nodes, edges = [], []
    for i, (nid, d) in enumerate(G.nodes(data=True)):
        if i >= limit:
            break
        nodes.append({"id": nid, "label": d.get("label"), "group": d.get("domain"), "risk": d.get("risk_score", 0), "type": d.get("type")})

    keep = {n["id"] for n in nodes}
    for s, t, d in G.edges(data=True):
        if s in keep and t in keep:
            edges.append({"from": s, "to": t, "label": d.get("predicate", "LINK"), "confidence": d.get("confidence", 0.8), "impact": d.get("impact_score", 0.5)})

    return {"nodes": nodes, "edges": edges, "nvi": compute_nvi()}


@app.get("/api/risk")
async def get_risk_dashboard():
    # Build domain risk directly from recent feed events (not only graph node averages)
    trend_by_domain: Dict[str, str] = {}
    async with SessionLocal() as db:
        rs = await db.execute(select(FeedEventDB).order_by(FeedEventDB.timestamp.desc()).limit(180))
        rows = rs.scalars().all()

    by_domain: Dict[str, List[int]] = {k: [] for k in DOMAIN_WEIGHTS.keys()}
    for r in rows:
        if r.domain in by_domain:
            by_domain[r.domain].append(int(r.risk_score))

    ds: Dict[str, float] = {}
    for d in DOMAIN_WEIGHTS.keys():
        vals = by_domain.get(d, [])
        baseline = DOMAIN_BASELINE.get(d, 50)
        if not vals:
            ds[d] = float(baseline)
            trend_by_domain[d] = "flat"
            continue

        # weighted recent average (more weight on newest records)
        wsum = 0.0
        vsum = 0.0
        for i, v in enumerate(vals):
            w = max(0.2, 1.0 - (i * 0.015))
            wsum += w
            vsum += v * w
        recent_avg = vsum / max(1e-9, wsum)

        # blend with baseline to avoid over-noise
        score = (0.78 * recent_avg) + (0.22 * baseline)
        ds[d] = round(max(0, min(100, score)), 2)

        if len(vals) < 10:
            trend_by_domain[d] = "flat"
        else:
            mid = len(vals) // 2
            newer = sum(vals[:mid]) / max(1, len(vals[:mid]))
            older = sum(vals[mid:]) / max(1, len(vals[mid:]))
            delta = newer - older
            if delta > 2.0:
                trend_by_domain[d] = "up"
            elif delta < -2.0:
                trend_by_domain[d] = "down"
            else:
                trend_by_domain[d] = "flat"

    nvi = round(sum(ds[d] * DOMAIN_WEIGHTS[d] for d in DOMAIN_WEIGHTS.keys()), 2)

    cards = [
        {
            "domain": d,
            "score": ds[d],
            "level": classify_risk(ds[d]),
            "trend": trend_by_domain.get(d, "flat"),
        }
        for d in ds.keys()
    ]

    return {
        "nvi": nvi,
        "nvi_label": classify_risk(nvi),
        "cards": sorted(cards, key=lambda x: x["score"], reverse=True),
        "weights": DOMAIN_WEIGHTS,
    }


@app.get("/api/feed")
async def get_feed(limit: int = Query(25, ge=5, le=200)):
    return {"items": [x.model_dump() for x in await get_feed_items(limit)], "source_latency": await get_source_status()}


@app.get("/api/source-latency")
async def source_latency():
    return await get_source_status()


@app.post("/api/query")
async def query_nl(payload: NLQuery):
    return nl_to_graph_answer(payload.query)


@app.post("/api/cascade")
async def run_cascade(payload: CascadeRequest):
    return {"start_node": payload.start_node, "results": cascade(payload.start_node, payload.max_hops)}


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "database_url": DATABASE_URL,
        "db": "connected",
        "graph_mode": "neo4j+networkx" if neo4j_repo.available else "networkx",
        "neo4j_connected": neo4j_repo.available,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "nvi": compute_nvi(),
        "timestamp": now_iso(),
    }


@app.get("/{full_path:path}")
async def ui_fallback(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("ws/") or full_path.startswith("static/") or full_path.startswith("assets/"):
        return {"detail": "Not Found"}
    ui_index = UI_DIST_DIR / "index.html"
    if ui_index.exists():
        return FileResponse(str(ui_index))
    return {"detail": "UI not built. Run frontend build."}


@app.websocket("/ws/live")
async def ws_live(ws: WebSocket):
    await ws.accept()
    CONNECTIONS.append(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in CONNECTIONS:
            CONNECTIONS.remove(ws)
