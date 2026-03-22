import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BrainCircuit,
    Target,
    Rss,
    Database,
    AlertTriangle,
    Settings,
    HelpCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
    { label: 'Intelligence Graph', path: '/graph', icon: BrainCircuit },
    { label: 'Comparison Dashboard', path: '/risk-dashboard', icon: Target },
    { label: 'Feed Monitor', path: '/feed', icon: Rss },
    { label: 'NL Query', path: '/query', icon: Database },
    { label: 'Risk Analyzer', path: '/analyzer', icon: AlertTriangle },
    { spacer: true },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Support', path: '/support', icon: HelpCircle }
];

export default function Sidebar({ className, activePage }) {
    const navigate = useNavigate();
    const { theme: t } = useTheme();

    return (
        <div className={`sidebar ${className || ''}`} style={{ width: '220px', minWidth: '220px', background: t.bgSidebar }}>
            {/* Brand Name */}
            <div style={{ padding: '0 20px', marginBottom: '16px', flexShrink: 0 }}>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.05em', margin: 0 }}>
                    SII COMMAND
                </h2>
            </div>

            {/* Fix 5 — Sidebar "SYSTEM ACTIVE" indicator */}
            <div style={{ padding: '0 16px 12px 16px', borderBottom: `1px solid ${t.border}`, marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: t.success,
                        boxShadow: `0 0 6px ${t.success}`
                    }} />
                    <span style={{ fontSize: '11px', fontWeight: '600', color: t.text }}>SYSTEM ACTIVE</span>
                </div>
                <div style={{ fontSize: '10px', color: t.textMuted, paddingLeft: '14px' }}>LIVE_FEED.v4.2</div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {NAV_ITEMS.map((item, idx) => {
                    if (item.spacer) return <div key={`spacer-${idx}`} style={{ borderTop: `1px solid ${t.border}`, margin: '16px 0' }} />;

                    const Icon = item.icon;
                    const isActive = activePage === item.label;

                    return (
                        <div
                            key={item.label}
                            className={`navItem ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon className="navIcon" strokeWidth={2} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
