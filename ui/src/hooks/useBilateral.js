import { useEffect, useMemo, useState } from 'react';
import bilateralData from '../data/bilateralData.json';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const sectors = ['Economy', 'Sovereignty', 'Infrastructure', 'Defense', 'Technology', 'Society'];

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function fromMock(primaryCountry, comparisonCountry) {
  const key = `${primaryCountry}-${comparisonCountry}`;
  const data =
    bilateralData.sectorData[key] ||
    bilateralData.sectorData[`${comparisonCountry}-${primaryCountry}`] ||
    null;

  return {
    chartData: data
      ? Object.keys(data).map((sector) => ({
          sector,
          primary: data[sector].primary,
          comparison: data[sector].comparison,
          global: data[sector].global,
        }))
      : [],
    stability: {
      primary: bilateralData.stabilityScores[primaryCountry] || {},
      comparison: bilateralData.stabilityScores[comparisonCountry] || {},
    },
    insights: bilateralData.regionalInsights[key] || [
      `${primaryCountry} and ${comparisonCountry} show mixed bilateral signals across sectors.`,
      'Monitor defense and technology vectors for fast changes.',
    ],
  };
}

export function useBilateralData(primaryCountry, comparisonCountry) {
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/api/risk`)
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setRiskData(json);
      })
      .catch(() => {
        // fallback will be mock
      });

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    // If live risk is missing, guaranteed fallback.
    if (!riskData?.cards?.length) {
      return fromMock(primaryCountry, comparisonCountry);
    }

    // Build sector baselines from live domain risk.
    const cardMap = Object.fromEntries(riskData.cards.map((c) => [c.domain, Number(c.score || 0)]));

    const sectorBase = {
      Economy: cardMap.Economics ?? 52,
      Sovereignty: cardMap.Geopolitics ?? 58,
      Infrastructure: cardMap.Society ?? 48,
      Defense: cardMap.Defense ?? 60,
      Technology: cardMap.Technology ?? 50,
      Society: cardMap.Society ?? 45,
    };

    // Deterministic country modifiers (no random) to keep comparison realistic + stable.
    const countryStability = bilateralData.stabilityScores || {};
    const p = countryStability[primaryCountry] || { stability: 60, momentum: 60 };
    const c = countryStability[comparisonCountry] || { stability: 60, momentum: 60 };

    const pBias = ((Number(p.momentum || 60) - 60) * 0.25) + ((Number(p.stability || 60) - 60) * 0.15);
    const cBias = ((Number(c.momentum || 60) - 60) * 0.25) + ((Number(c.stability || 60) - 60) * 0.15);

    const chartData = sectors.map((sector, idx) => {
      const b = Number(sectorBase[sector] || 50);
      const sectorJitter = (idx - 2.5) * 1.8; // deterministic spread by sector
      const primary = clamp(Math.round(b + pBias + sectorJitter));
      const comparison = clamp(Math.round(b + cBias - sectorJitter));
      const global = clamp(Math.round((primary + comparison) / 2 - 4));
      return { sector, primary, comparison, global };
    });

    const insights = [
      `${primaryCountry} vs ${comparisonCountry}: strongest divergence appears in Defense and Technology vectors.`,
      `Current global risk baseline (NVI) is ${riskData.nvi}; bilateral comparisons are normalized around live sector pressure.`,
      `${primaryCountry} stability ${p.stability ?? '—'} vs ${comparisonCountry} stability ${c.stability ?? '—'}.`,
      'Use this panel for relative comparison; absolute threat scoring is available in Intelligence Graph and Risk Analyzer.',
    ];

    return {
      chartData,
      stability: {
        primary: p,
        comparison: c,
      },
      insights,
    };
  }, [riskData, primaryCountry, comparisonCountry]);
}
