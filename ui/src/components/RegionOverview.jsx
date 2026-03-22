import React from 'react';
import { useRegions } from '../hooks/useIntelData';
import { useTheme } from '../context/ThemeContext';

export default function RegionOverview() {
    const { theme: t } = useTheme();
    const regions = useRegions();

    return (
        <div className="bottomCard" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px', flex: 1, borderRight: 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '16px' }}>Region Overview</div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {regions.map(r => (
                    <div key={r.name} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: t.text, marginBottom: '4px' }}>
                            {r.name}
                        </div>
                        <div style={{ width: '100%', height: '6px', background: t.border, borderRadius: '3px', marginBottom: '3px' }}>
                            <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: '3px' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: t.textSecondary }}>{r.status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
