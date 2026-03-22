import { useEffect, useMemo, useState } from 'react';
import ALL_COUNTRIES from '../data/countries';
import bilateralData from '../data/bilateralData.json';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function hashNum(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

export default function useCountryStats() {
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/risk`);
        if (!r.ok) throw new Error();
        const j = await r.json();
        if (mounted) setRisk(j);
      } catch {
        // ignore
      }
    };
    load();
    const t = setInterval(load, 12000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return useMemo(() => {
    const nvi = Number(risk?.nvi ?? 65);
    const st = bilateralData.stabilityScores || {};

    return [...ALL_COUNTRIES].sort((a, b) => a.localeCompare(b)).map((country) => {
      const seed = hashNum(country);
      const baseStability = st[country]?.stability ?? (55 + (seed % 35));
      const momentum = st[country]?.momentum ?? (45 + ((seed >> 3) % 45));

      // Derived country risk: blend global NVI + country stability/momentum effects
      const riskScore = clamp(Math.round((0.55 * nvi) + (0.25 * (100 - baseStability)) + (0.20 * (100 - momentum / 1.2))));
      const level = riskScore >= 85 ? 'Critical' : riskScore >= 70 ? 'High' : riskScore >= 55 ? 'Elevated' : riskScore >= 35 ? 'Guarded' : 'Low';

      return {
        country,
        stability: clamp(Math.round(baseStability)),
        momentum: clamp(Math.round(momentum)),
        riskScore,
        level,
      };
    });
  }, [risk]);
}
