import { useEffect, useMemo, useState } from 'react';
import mockMapEvents from '../data/mapEvents.json';
import mockTradeArcs from '../data/tradeArcs.json';
import mockAlerts from '../data/alerts.json';
import mockTrends from '../data/trendData.json';
import mockRegions from '../data/regions.json';
import ALL_COUNTRIES from '../data/countries';
import countryCoordsFull from '../data/countryCoordsFull.json';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function useLiveJson(url, fallback, intervalMs = 12000) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    let timer;

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        // keep last data/fallback
      }
    };

    if (url) {
      load();
      timer = setInterval(load, intervalMs);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [url, intervalMs]);

  return data;
}

function classifyLevel(risk) {
  if (risk >= 85) return 'Critical';
  if (risk >= 70) return 'High';
  if (risk >= 55) return 'Elevated';
  if (risk >= 35) return 'Guarded';
  return 'Low';
}

const domainCoords = {
  Geopolitics: [[34, 78], [31, 35], [39, 116], [55, 37], [25, 55]],
  Defense: [[31, 72], [33, 44], [30, 31], [48, 2], [36, 138]],
  Economics: [[1, 104], [22, 114], [40, -74], [51, -0.1], [35, 139]],
  Climate: [[0, 20], [-23, -46], [13, 80], [52, 13], [-34, 18]],
  Technology: [[37, -122], [28, 77], [1, 103], [52, -1], [35, 126]],
  Society: [[51, 10], [19, 72], [-1, 36], [14, 121], [-33, -70]],
};

const countryCoords = countryCoordsFull;

function fallbackCoord(country) {
  // deterministic pseudo-coordinate for countries without a curated coordinate
  let h = 0;
  for (let i = 0; i < country.length; i++) h = (h * 33 + country.charCodeAt(i)) >>> 0;
  const lat = ((h % 12000) / 100) - 60;      // -60..60
  const lng = ((((h >> 8) % 34000) / 100) - 170); // -170..170
  return [lat, lng];
}

export const useMapEvents = () => {
  const feed = useLiveJson(`${API_BASE}/api/feed?limit=40`, { items: [] }, 8000);

  return useMemo(() => {
    const items = feed?.items || [];
    if (!items.length) return mockMapEvents;

    const used = [];
    const minDist = 3.2; // degrees; spacing threshold to avoid overlap

    const ringOffsets = [
      [0, 0],
      [1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6],
      [1.2, 1.2], [1.2, -1.2], [-1.2, 1.2], [-1.2, -1.2],
      [2.4, 0.8], [-2.4, 0.8], [2.4, -0.8], [-2.4, -0.8],
    ];

    const tooClose = (aLat, aLng) => {
      for (const p of used) {
        const dLat = aLat - p.lat;
        const dLng = aLng - p.lng;
        const d = Math.sqrt((dLat * dLat) + (dLng * dLng));
        if (d < minDist) return true;
      }
      return false;
    };

    const out = items.map((x, i) => {
      const hubs = domainCoords[x.domain] || [[20, 0]];
      const hub = hubs[i % hubs.length];
      const [baseLat, baseLng] = hub;

      let placedLat = baseLat;
      let placedLng = baseLng;

      // deterministic radial search around hub to avoid overlap
      const shift = (i * 3) % ringOffsets.length;
      for (let k = 0; k < ringOffsets.length; k++) {
        const idx = (k + shift) % ringOffsets.length;
        const [oLat, oLng] = ringOffsets[idx];
        const candLat = baseLat + oLat;
        const candLng = baseLng + oLng;
        if (!tooClose(candLat, candLng)) {
          placedLat = candLat;
          placedLng = candLng;
          break;
        }
      }

      used.push({ lat: placedLat, lng: placedLng });

      const risk = Number(x.risk_score || 0);
      const type = risk >= 70 ? 'conflict' : x.domain === 'Geopolitics' ? 'diplomatic' : 'disaster';

      return {
        id: `${x.source}-${i}`,
        lat: placedLat,
        lng: placedLng,
        type,
        risk,
        label: `[${x.domain}] ${classifyLevel(risk)}`,
        desc: x.headline,
      };
    });

    return out;
  }, [feed]);
};

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function useTradeDataset(limit = 900) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/data/current_trade_relations_dataset.csv');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        const lines = txt.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return;
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const c = parseCsvLine(lines[i]);
          if (c.length < 5) continue;
          parsed.push({
            from: c[0],
            to: c[1],
            score: Number(c[3] || 0),
            confidence: Number(c[4] || 0),
          });
        }
        parsed.sort((a, b) => b.score - a.score);
        if (mounted) setRows(parsed.slice(0, limit));
      } catch {
        // fallback remains active in useTradeArcs
      }
    };
    load();
  }, [limit]);

  return rows;
}

export const useTradeArcs = () => {
  const risk = useLiveJson(`${API_BASE}/api/risk`, null, 12000);
  const tradeRows = useTradeDataset(1000);

  return useMemo(() => {
    const cards = risk?.cards || [];
    const economics = Number(cards.find(c => c.domain === 'Economics')?.score ?? 55);

    if (tradeRows.length) {
      return tradeRows.map((r) => {
        const from = countryCoords[r.from] || fallbackCoord(r.from);
        const to = countryCoords[r.to] || fallbackCoord(r.to);
        const opacity = Math.max(0.18, Math.min(0.92, 0.15 + (r.confidence * 0.65)));
        const weight = Math.max(0.6, Math.min(3.2, 0.7 + (r.score / 45)));
        return {
          from,
          to,
          color: '#2563eb',
          opacity,
          weight,
        };
      });
    }

    // fallback when CSV not found
    const baseOpacity = Math.max(0.25, Math.min(0.85, economics / 100));
    const home = countryCoords.India || [22.57, 88.36];
    const links = ALL_COUNTRIES
      .filter((c) => c !== 'India')
      .map((country, i) => {
        const to = countryCoords[country] || fallbackCoord(country);
        const mod = ((i % 5) - 2) * 0.08;
        const opacity = Math.max(0.2, Math.min(0.9, baseOpacity + mod));
        return {
          from: home,
          to,
          color: '#2563eb',
          opacity,
          weight: 1.0 + ((i % 3) * 0.35),
        };
      });

    return links.length ? links : mockTradeArcs;
  }, [risk, tradeRows]);
};

export const useAlerts = () => {
  const feed = useLiveJson(`${API_BASE}/api/feed?limit=14`, { items: [] }, 8000);

  return useMemo(() => {
    if (!feed?.items?.length) return mockAlerts;
    return feed.items.map((x, i) => ({
      id: i + 1,
      level: classifyLevel(Number(x.risk_score || 0)),
      text: `[${x.domain}] ${x.headline}`,
    }));
  }, [feed]);
};

export const useTrendData = () => {
  const risk = useLiveJson(`${API_BASE}/api/risk`, null, 10000);

  return useMemo(() => {
    if (!risk?.cards?.length) return mockTrends;
    const card = Object.fromEntries(risk.cards.map((c) => [c.domain, Number(c.score || 0)]));

    const now = new Date();
    const labels = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now);
      d.setMinutes(d.getMinutes() - (5 - k) * 10);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    });

    return labels.map((label, idx) => {
      const drift = idx - 2.5;
      return {
        month: label,
        conflict: Math.max(0, Math.min(100, Math.round((card.Geopolitics ?? 58) + drift * 0.9))),
        diplomacy: Math.max(0, Math.min(100, Math.round((100 - (card.Defense ?? 60)) + drift * 0.5))),
        disaster: Math.max(0, Math.min(100, Math.round((card.Climate ?? 52) + drift * 0.8))),
      };
    });
  }, [risk]);
};

export const useRegions = () => {
  const risk = useLiveJson(`${API_BASE}/api/risk`, null, 12000);

  return useMemo(() => {
    if (!risk?.cards?.length) return mockRegions;
    const m = Object.fromEntries(risk.cards.map((c) => [c.domain, Number(c.score || 0)]));

    const rows = [
      { name: 'Asia-Pacific', pct: Math.round((m.Geopolitics ?? 55)), color: '#e63946', status: classifyLevel(m.Geopolitics ?? 55) },
      { name: 'Europe', pct: Math.round((m.Technology ?? 45)), color: '#2a9d8f', status: classifyLevel(m.Technology ?? 45) },
      { name: 'Middle East', pct: Math.round((m.Defense ?? 60)), color: '#f4a261', status: classifyLevel(m.Defense ?? 60) },
      { name: 'Americas', pct: Math.round((m.Economics ?? 50)), color: '#3b82f6', status: classifyLevel(m.Economics ?? 50) },
    ];

    return rows;
  }, [risk]);
};

export const useDetailPanel = () => {
  const risk = useLiveJson(`${API_BASE}/api/risk`, null, 8000);

  const nvi = Number(risk?.nvi ?? 67);
  const cards = risk?.cards || [];

  return {
    stabilityScore: `${Math.max(0, (100 - nvi)).toFixed(1)}%`,
    riskFactor: classifyLevel(nvi),
    activeIncidents: String(cards.filter((c) => Number(c.score || 0) >= 70).length),
    nvi,
    cards,
  };
};
