import { useEffect, useMemo, useState } from 'react';
import entityGraph from '../data/entityGraph.json';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const MAX_NODES = 140;
const EDGE_CONFIDENCE_MIN = 0.55;
const EDGE_IMPACT_MIN = 0.2;

const domainToCategory = {
  geopolitics: 'political',
  defense: 'security',
  economics: 'economy',
  climate: 'climate',
  society: 'social',
  technology: 'economy',
};

const domainAngles = {
  Geopolitics: -140,
  Defense: -80,
  Economics: -10,
  Climate: 55,
  Society: 120,
  Technology: 175,
};

const toRad = (deg) => (deg * Math.PI) / 180;

function shortLabel(v, max = 24) {
  const s = (v || '').toString().trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function riskBand(r) {
  if (r >= 85) return 'Critical';
  if (r >= 70) return 'High';
  if (r >= 55) return 'Elevated';
  if (r >= 35) return 'Guarded';
  return 'Low';
}

function buildAnchors(nodes, centralityMap) {
  // Primary rule: distance from center is driven by risk rating.
  // Higher risk => closer to center.
  const riskRingByBand = {
    Critical: 80,
    High: 130,
    Elevated: 190,
    Guarded: 255,
    Low: 325,
  };

  // Secondary rule: centrality only creates small local spread inside same risk ring.
  const centVals = nodes.map((n) => centralityMap.get(n.originalId) || 0);
  const cmax = Math.max(1, ...centVals);

  return nodes.map((n, idx) => {
    const band = riskBand(n.risk);
    const baseRing = riskRingByBand[band] ?? 255;

    const c = (centralityMap.get(n.originalId) || 0) / cmax; // 0..1
    const centOffset = Math.round((0.5 - c) * 18); // small +/- jitter only
    const ring = Math.max(70, baseRing + centOffset);

    const angleBase = domainAngles[n.domain] ?? 0;
    // deterministic spread inside a sector to avoid overlap
    const jitterDeg = ((idx * 41) % 28) - 14;
    const angle = toRad(angleBase + jitterDeg);

    return {
      ...n,
      anchorRing: ring,
      anchorX: Math.cos(angle) * ring,
      anchorY: Math.sin(angle) * ring,
    };
  });
}

export function useEntityGraph() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/api/graph?limit=260`)
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setLive(json);
      })
      .catch(() => {
        // fallback static
      });

    return () => {
      mounted = false;
    };
  }, []);

  const transformed = useMemo(() => {
    if (!live?.nodes?.length) {
      return {
        nodes: entityGraph.nodes,
        edges: entityGraph.edges,
        details: entityGraph.entityDetails || {},
        riskSummary: { critical: 0, high: 0, elevated: 0, guarded: 0, low: 0 },
      };
    }

    const sorted = [...live.nodes]
      .sort((a, b) => Number(b.risk || 0) - Number(a.risk || 0))
      .slice(0, MAX_NODES);

    const keepOriginalIds = new Set(sorted.map((n) => n.id));
    const idMap = new Map();

    const baseNodes = sorted.map((n) => {
      const displayId = shortLabel((n.label || n.id || '').toString().toUpperCase().replace(/\s+/g, '_'), 26);
      idMap.set(n.id, displayId);
      const domain = (n.group || 'Geopolitics').toString();
      const category = domainToCategory[domain.toLowerCase()] || 'social';

      return {
        id: displayId,
        originalId: n.id,
        label: shortLabel(n.label || n.id, 30),
        risk: Number(n.risk || 0),
        size: Math.max(16, Math.min(44, 16 + Number(n.risk || 0) / 3.0)),
        type: n.type === 'Event' ? 'event' : Number(n.risk || 0) >= 70 ? 'threat' : 'entity',
        categories: [category],
        profile: n.type,
        domain,
      };
    });

    const rawEdges = (live.edges || [])
      .filter((e) => keepOriginalIds.has(e.from) && keepOriginalIds.has(e.to))
      .map((e) => {
        const predicate = (e.label || '').toUpperCase();
        let type = 'trade';
        if (predicate.includes('AFFECTS') || predicate.includes('TRIGGERS') || predicate.includes('CAUSES') || predicate.includes('LEADS')) type = 'conflict';
        if (predicate.includes('MEMBER') || predicate.includes('ALLY') || predicate.includes('BORDER') || predicate.includes('INVOLVED') || predicate.includes('COOPER')) type = 'diplomatic';

        return {
          source: idMap.get(e.from) || e.from,
          target: idMap.get(e.to) || e.to,
          type,
          predicate: e.label || 'REL',
          confidence: Number(e.confidence ?? 0.75),
          impact: Number(e.impact ?? 0.5),
        };
      });

    const nodeDisplayIds = new Set(baseNodes.map((n) => n.id));
    const nodeByDisplayId = Object.fromEntries(baseNodes.map((n) => [n.id, n]));

    const edges = rawEdges
      .filter((e) => nodeDisplayIds.has(e.source) && nodeDisplayIds.has(e.target))
      .filter((e) => e.confidence >= EDGE_CONFIDENCE_MIN && e.impact >= EDGE_IMPACT_MIN)
      .map((e) => {
        const srcRisk = Number(nodeByDisplayId[e.source]?.risk || 0);
        const dstRisk = Number(nodeByDisplayId[e.target]?.risk || 0);
        const relationRisk = Math.min(
          100,
          Math.round(((srcRisk + dstRisk) / 2) * (0.55 + e.impact * 0.45) * (0.65 + e.confidence * 0.35))
        );
        return { ...e, relationRisk };
      });

    // centrality proxy: weighted degree from filtered edges
    const centralityMap = new Map();
    baseNodes.forEach((n) => centralityMap.set(n.originalId, 0));

    const reverseMap = new Map();
    idMap.forEach((display, orig) => reverseMap.set(display, orig));

    edges.forEach((e) => {
      const sOrig = reverseMap.get(e.source);
      const tOrig = reverseMap.get(e.target);
      const w = (e.confidence + e.impact) / 2;
      if (sOrig) centralityMap.set(sOrig, (centralityMap.get(sOrig) || 0) + w);
      if (tOrig) centralityMap.set(tOrig, (centralityMap.get(tOrig) || 0) + w);
    });

    const nodes = buildAnchors(baseNodes, centralityMap);

    const details = {};
    nodes.forEach((n) => {
      details[n.id] = {
        riskRating: riskBand(n.risk),
        riskScore: n.risk,
        scorecard: [
          { label: 'Geopolitical Exposure', score: Math.min(100, n.risk + 8), level: 'Weighted', color: '#e63946' },
          { label: 'Economic Sensitivity', score: Math.max(10, n.risk - 6), level: 'Weighted', color: '#f4a261' },
          { label: 'Stability Index', score: Math.max(10, 100 - n.risk), level: 'Inverse', color: '#2a9d8f' },
        ],
        activities: [
          { label: `Domain: ${n.domain}`, icon: 'signal' },
          { label: 'Risk Recomputed', icon: 'pin' },
          { label: 'Edge Confidence Filtered', icon: 'lock' },
        ],
      };
    });

    const riskSummary = {
      critical: nodes.filter((n) => n.risk >= 85).length,
      high: nodes.filter((n) => n.risk >= 70 && n.risk < 85).length,
      elevated: nodes.filter((n) => n.risk >= 55 && n.risk < 70).length,
      guarded: nodes.filter((n) => n.risk >= 35 && n.risk < 55).length,
      low: nodes.filter((n) => n.risk < 35).length,
    };

    return { nodes, edges, details, riskSummary };
  }, [live]);

  return {
    nodes: transformed.nodes,
    edges: transformed.edges,
    riskSummary: transformed.riskSummary,
    getDetail: (nodeId) => transformed.details[nodeId] || entityGraph.entityDetails?.[nodeId] || null,
  };
}
