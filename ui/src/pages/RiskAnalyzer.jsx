import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import { TrendingUp, Globe, ShieldCheck } from 'lucide-react';
import mockData from '../data/mockRiskAnalyzer.json';
import { useTheme } from '../context/ThemeContext';

const MiniBarChart = ({ data, color, maxVal = 100 }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px', marginTop: '12px' }}>
        {data.map((v, i) => (
            <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i === data.length - 1 ? color : `${color}55`, height: `${(v / maxVal) * 100}%`, animation: `growBar 0.6s ease-out ${i * 0.08}s both` }} />
        ))}
    </div>
);

const DomainCard = ({ domain, delay, t }) => {
    const isAlert = domain.score >= 80;
    return (
        <div style={{
            background: t.bgCard, padding: '28px', display: 'flex', flexDirection: 'column',
            animation: `fadeSlideUp 0.5s ease-out ${delay}s both`,
            border: isAlert ? `1px solid ${t.dangerBg}` : `1px solid ${t.border}`,
            transition: 'box-shadow 0.3s, transform 0.2s'
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowLg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                    <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: '800', letterSpacing: '0.1em', color: isAlert ? t.danger : '#0258d4', border: `1px solid ${isAlert ? t.dangerBg : t.accentBgSoft}`, padding: '3px 10px', marginBottom: '10px', fontFamily: 'Syne, sans-serif' }}>{domain.label}</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: t.text, lineHeight: '1.15', margin: 0 }}>
                        {domain.title.split(' ').map((w, i) => <span key={i}>{w}<br /></span>)}
                    </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: isAlert ? t.danger : t.text, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{domain.score}</div>
                    <div style={{ fontSize: '8px', fontWeight: '700', color: t.textFaint, letterSpacing: '0.1em', marginTop: '4px' }}>{domain.scoreLabel}</div>
                </div>
            </div>
            <MiniBarChart data={domain.barData} color={domain.color} />
            <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: t.textFaint, letterSpacing: '0.1em', marginBottom: '10px' }}>TOP 3 EVENTS</div>
                {domain.events.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontSize: '12px', color: t.textSecondary, fontWeight: '500' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: isAlert ? t.danger : '#0258d4', background: isAlert ? t.dangerBg : t.accentBgSoft, padding: '2px 6px', fontFamily: 'JetBrains Mono, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                        {ev}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MiniGraph = ({ nodes, t }) => {
    const navigate = useNavigate();
    return (
        <div style={{ background: t.bgCard, padding: '28px', border: `1px solid ${t.border}`, animation: 'fadeSlideUp 0.5s ease-out 0.3s both', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: t.textFaint }}>✦</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: t.text, letterSpacing: '0.02em' }}>INTELLIGENCE GRAPH</span>
            </div>
            <div style={{ fontSize: '10px', color: t.textFaint, fontWeight: '700', letterSpacing: '0.05em', marginBottom: '20px' }}>NODE ASSOCIATION MAP</div>
            <div style={{ position: 'relative', height: '180px', background: t.bgInput, border: `1px solid ${t.borderLight}`, marginBottom: '20px' }}>
                <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%' }}>
                    {[[40, 30, 160, 30], [40, 90, 160, 90], [40, 30, 40, 90], [160, 30, 160, 90], [40, 30, 160, 90], [160, 30, 40, 90]].map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.border} strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                </svg>
                {nodes.map(node => (
                    <div key={node.id} style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div style={{ fontSize: '8px', fontWeight: '800', letterSpacing: '0.05em', color: node.status === 'alert' ? t.danger : t.text, background: node.status === 'alert' ? t.dangerBg : t.bgHover, padding: '3px 8px', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>{node.label}</div>
                        <div style={{ width: '100%', height: '3px', marginTop: '4px', background: node.status === 'alert' ? '#ef4444' : t.textFaint }} />
                    </div>
                ))}
                <div style={{ position: 'absolute', bottom: '4px', left: '12px', fontSize: '8px', color: t.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>42.82N 12.3E</div>
                <div style={{ position: 'absolute', bottom: '4px', right: '12px', fontSize: '8px', color: t.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>SEC_ENC_4</div>
            </div>
            <button onClick={() => navigate('/graph')} style={{
                width: '100%', padding: '14px', background: t.text, color: t.bg, fontSize: '11px', fontWeight: '800',
                letterSpacing: '0.1em', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', transition: 'opacity 0.2s'
            }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >FULL GRAPH EXPANSION</button>
        </div>
    );
};

const InsightCard = ({ icon, label, value, delay, t }) => {
    const IconComponent = icon === 'trending' ? TrendingUp : icon === 'globe' ? Globe : ShieldCheck;
    return (
        <div style={{ background: t.bgCard, padding: '28px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: `fadeSlideUp 0.5s ease-out ${delay}s both`, transition: 'box-shadow 0.3s', minHeight: '180px' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = t.shadowLg}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
            <div style={{ width: '32px', height: '32px', background: t.accentBgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <IconComponent size={16} style={{ color: '#0258d4' }} />
            </div>
            <div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: t.textFaint, letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: t.text, lineHeight: '1.2' }}>{value}</div>
            </div>
        </div>
    );
};

export default function RiskAnalyzer() {
    const { theme: t } = useTheme();
    const [data, setData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setData(mockData), 300);
        return () => clearTimeout(timer);
    }, []);

    if (!data) {
        return (
            <div className="dashboard-wrapper">
                <TopBar activeNav="CASCADE" />
                <div className="main-content">
                    <Sidebar activePage="Risk Analyzer" />
                    <main className="dashboard-body" style={{ background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '40px', height: '40px', border: `3px solid ${t.border}`, borderTopColor: '#0258d4', borderRadius: '50%', animation: 'spinSlow 1s linear infinite', margin: '0 auto 16px' }} />
                            <div style={{ fontSize: '12px', fontWeight: '700', color: t.textFaint, letterSpacing: '0.1em' }}>LOADING RISK MATRIX...</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes growBar { from { height: 0; } }
        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
        @keyframes fillBar { from { width: 0; } }
      `}</style>
            <TopBar activeNav="CASCADE" />
            <div className="main-content">
                <Sidebar activePage="Risk Analyzer" />
                <main className="dashboard-body" style={{ background: t.bg, padding: '40px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', transition: 'background 0.3s' }}>
                    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', animation: 'fadeSlideUp 0.4s ease-out' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: t.textFaint, letterSpacing: '0.15em', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace' }}>INTELLIGENCE PROTOCOL 09-X</div>
                                <h1 style={{ fontSize: '32px', fontWeight: '900', color: t.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>RISK ANALYZER</h1>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: t.bgCard, border: `1px solid ${t.border}`, padding: '8px 16px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: t.textMuted, fontWeight: '600' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.text }} />
                                LAST UPDATE: {data.lastUpdate}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr minmax(260px, 300px)', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {data.domains.map((d, i) => <DomainCard key={d.id} domain={d} delay={0.1 + i * 0.12} t={t} />)}
                            </div>
                            <MiniGraph nodes={data.graphNodes} t={t} />
                        </div>
                        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                                <div style={{ background: t.bgCard, padding: '28px', border: `1px solid ${t.border}`, animation: 'fadeSlideUp 0.5s ease-out 0.6s both' }}>
                                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: t.text, lineHeight: '1.15', marginBottom: '16px' }}>STRATEGIC<br />OUTLOOK</h3>
                                    <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: '1.7', fontWeight: '500', marginBottom: '20px' }}>{data.strategicOutlook.summary}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#0258d4', letterSpacing: '0.1em', background: t.accentBgSoft, padding: '4px 10px' }}>SYSTEM CONFIDENCE</span>
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>{data.strategicOutlook.confidence}%</span>
                                    </div>
                                    <div style={{ height: '4px', background: t.border, marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: '#0258d4', borderRadius: '2px', width: `${data.strategicOutlook.confidence}%`, animation: 'fillBar 1.5s ease-out 1s both' }} />
                                    </div>
                                </div>
                                {data.strategicOutlook.insights.map((ins, i) => <InsightCard key={i} icon={ins.icon} label={ins.label} value={ins.value} delay={0.7 + i * 0.15} t={t} />)}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <StatusBar leftLabel="SYSTEM NOMINAL: LATENCY 14MS" />
        </div>
    );
}
