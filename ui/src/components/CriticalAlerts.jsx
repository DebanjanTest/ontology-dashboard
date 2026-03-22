import React from 'react';
import { useAlerts } from '../hooks/useIntelData';
import { useTheme } from '../context/ThemeContext';

const levelStyle = {
  Critical: { bg: '#fee2e2', border: '#7f1d1d', txt: '#7f1d1d' },
  High: { bg: '#fde8e8', border: '#dc2626', txt: '#dc2626' },
  Elevated: { bg: '#fff3e0', border: '#f97316', txt: '#f97316' },
  Guarded: { bg: '#fffbeb', border: '#f59e0b', txt: '#b45309' },
  Low: { bg: '#ecfeff', border: '#14b8a6', txt: '#0f766e' },
};

export default function CriticalAlerts() {
  const { theme: t } = useTheme();
  const alerts = useAlerts();

  return (
    <div className="bottomCard" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px', flex: 1, minWidth: '260px', maxWidth: '340px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px' }}>🔔</span>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: t.text, margin: 0 }}>Critical Alerts</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.slice(0, 6).map((a) => {
          const s = levelStyle[a.level] || levelStyle.Low;
          return (
            <div key={a.id} style={{ background: s.bg, borderLeft: `3px solid ${s.border}`, borderRadius: '4px', padding: '8px 12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: s.txt, marginBottom: '3px' }}>{a.level}</div>
              <div style={{ fontSize: '11px', color: t.textSecondary, lineHeight: '1.4' }}>{a.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '8px', borderTop: `1px solid ${t.border}` }}>
        <span style={{ fontSize: '12px', color: t.accent, fontFamily: 'Syne, sans-serif' }}>Live stream connected</span>
      </div>
    </div>
  );
}
