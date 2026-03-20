# ontology — Global Ontology Engine (Full-stack, DB-backed)

This project now runs with **real database-backed ingestion** and a functional UI integrated from India-innovators.

## ✅ What is now implemented

### Backend (FastAPI)
- Persistent relational storage via **SQLAlchemy async**
- Works with:
  - `PostgreSQL` (production recommended)
  - `SQLite` fallback (local quick start)
- Optional **Neo4j** integration for graph persistence
- Realtime ingestion simulator writes to DB continuously
- WebSocket live updates for UI

### Frontend (India-innovators UI integrated)
- Imported UI preserved with minimal visual change
- Wired to live backend APIs
- Live health badge in top bar (DB/graph status)
- Feed monitor now reads realtime feed from backend

---

## Architecture (current)
- `app/main.py` → API + ingestion + DB + graph logic
- `ui/` → Full React UI (from India-innovators, connected to live APIs)
- `docker-compose.yml` → PostgreSQL + Neo4j + Redis services
- `.env.example` → DB/graph environment settings

---

## 1) Start databases (recommended)

```powershell
cd "C:\Users\DEBANJAN MONDAL\.openclaw\workspace\ontology"
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Neo4j on `localhost:7687` + browser `http://localhost:7474`
- Redis on `localhost:6379`

---

## 2) Configure environment

Create `.env` from `.env.example` and set:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ontology
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme
```

If Postgres is not available, fallback works with:
```env
DATABASE_URL=sqlite+aiosqlite:///./ontology.db
```

---

## 3) Run backend

```powershell
cd "C:\Users\DEBANJAN MONDAL\.openclaw\workspace\ontology"
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health:
- `http://localhost:8000/api/health`

---

## 4) Run full UI

```powershell
cd "C:\Users\DEBANJAN MONDAL\.openclaw\workspace\ontology\ui"
npm install
npm run dev
```

Open:
- UI: `http://localhost:5173`
- API: `http://localhost:8000`

Optional:
```powershell
$env:VITE_API_BASE="http://localhost:8000"
npm run dev
```

---

## API endpoints
- `GET /api/graph` → graph nodes/edges + NVI
- `GET /api/risk` → domain risk dashboard + NVI
- `GET /api/feed` → DB-backed feed stream
- `GET /api/source-latency` → source freshness table
- `POST /api/query` → NL query intent over graph
- `POST /api/cascade` → risk propagation results
- `GET /api/health` → backend/db/graph status
- `WS /ws/live` → live feed push

---

## Notes on realtime
- Source updates are simulated continuously (12s cycle) to validate real-time architecture end-to-end.
- To go fully real-world: replace simulator with GDELT/ACLED/WorldBank/NASA/arXiv connectors.
- Data model and APIs are already structured for this swap.
