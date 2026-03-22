import React from 'react';
import { useDetailPanel } from '../hooks/useIntelData';
import { useTheme } from '../context/ThemeContext';

function riskColor(level) {
  if (level === 'Critical') return '#7f1d1d';
  if (level === 'High') return '#dc2626';
  if (level === 'Elevated') return '#f97316';
  if (level === 'Guarded') return '#f59e0b';
  return '#14b8a6';
}

export default function DetailPanel({ className }) {
  const { theme: t } = useTheme();
  const data = useDetailPanel();
  const pct = Math.max(0, Math.min(100, Number((data.stabilityScore || '0').replace('%', ''))));
  const markerLeft = `${Math.max(2, Math.min(98, data.nvi || 50))}%`;

  return (
    <div className={`detail-panel ${className || ''}`} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.textSecondary, marginBottom: '10px' }}>
        Detailed Information (Live)
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: t.textSecondary }}>Stability Score</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: t.accent, fontFamily: 'JetBrains Mono' }}>{data.stabilityScore}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: t.border, borderRadius: '3px' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: t.accent, borderRadius: '3px' }} />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: t.textSecondary }}>Risk Factor Meter (NVI)</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: riskColor(data.riskFactor) }}>{data.riskFactor}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'linear-gradient(to right, #14b8a6, #f59e0b, #f97316, #dc2626, #7f1d1d)', borderRadius: '3px', position: 'relative', marginBottom: '4px' }}>
          <div style={{ position: 'absolute', top: '-3px', left: markerLeft, width: '12px', height: '12px', background: t.bg, border: '2px solid white', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: t.textSecondary, marginBottom: '4px' }}>Active High/Critical Incidents</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '36px', fontWeight: '700', color: t.text, lineHeight: '1' }}>{String(data.activeIncidents).padStart(2, '0')}</div>
      </div>

      <div style={{ height: '1px', background: t.border, margin: '10px 0' }} />

      <div style={{ fontSize: '10px', fontWeight: '600', color: t.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
        Risk Index Context
      </div>
      <div style={{ fontSize: '10px', color: t.textMuted, marginBottom: '12px' }}>Auto-updates every few seconds from /api/risk</div>

      {(data.cards || []).slice(0, 4).map((item) => (
        <div key={item.domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: t.textSecondary }}>{item.domain}</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: riskColor(item.level) }}>{item.level} ({Math.round(item.score)})</span>
        </div>
      ))}
    </div>
  );
}
