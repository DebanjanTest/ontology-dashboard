import React, { useMemo, useState } from 'react';
import useCountryStats from '../hooks/useCountryStats';
import { useTheme } from '../context/ThemeContext';

export default function CountryStatsTable() {
  const { theme: t } = useTheme();
  const [q, setQ] = useState('');
  const stats = useCountryStats();

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return stats;
    return stats.filter((r) => r.country.toLowerCase().includes(query));
  }, [stats, q]);

  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: t.text, fontFamily: 'Syne' }}>All Countries Statistics</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search country..."
          style={{ background: t.bgInput, color: t.text, border: `1px solid ${t.border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: 180 }}
        />
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto', border: `1px solid ${t.borderLight}`, borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, background: t.bgHover, zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Country</th>
              <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Stability</th>
              <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Momentum</th>
              <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Risk</th>
              <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, color: t.textSecondary }}>Level</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.country}>
                <td style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderLight}`, color: t.text }}>{r.country}</td>
                <td style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderLight}`, textAlign: 'right', color: t.text }}>{r.stability}</td>
                <td style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderLight}`, textAlign: 'right', color: t.text }}>{r.momentum}</td>
                <td style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderLight}`, textAlign: 'right', color: t.text }}>{r.riskScore}</td>
                <td style={{ padding: '7px 10px', borderBottom: `1px solid ${t.borderLight}`, color: t.text }}>{r.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
