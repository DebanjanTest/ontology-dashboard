import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useEntityGraph } from '../hooks/useEntityGraph';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import ForceGraph from '../components/graph/ForceGraph';
import { Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function IntelligenceGraph() {
    const [selectedNode, setSelectedNode] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const { nodes, edges, riskSummary, getDetail } = useEntityGraph();
    const { theme: t } = useTheme();

    const filters = ['Economy', 'Security', 'Climate', 'Political', 'Social'];

    const filteredNodes = useMemo(() => {
        return activeFilter === 'all'
            ? nodes
            : nodes.filter(n => n.categories?.includes(activeFilter));
    }, [nodes, activeFilter]);

    const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);
    const filteredEdges = useMemo(() => edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)), [edges, filteredNodeIds]);

    const handleNodeClick = useCallback((node) => {
        setSelectedNode(node);
    }, []);

    useEffect(() => {
        if (!selectedNode) return;
        if (!filteredNodeIds.has(selectedNode.id)) {
            setSelectedNode(null);
        }
    }, [filteredNodeIds, selectedNode]);

    const detail = selectedNode ? getDetail(selectedNode.id) : null;

    return (
        <div className="dashboard-wrapper">
            <TopBar activeNav="GRAPH" />
            <div className="main-content">
                <Sidebar activePage="Intelligence Graph" />

                <main className="dashboard-body" style={{ background: t.bg, padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
                        <div>
                            <h1 style={{
                                fontFamily: 'Syne, sans-serif',
                                fontSize: '28px', fontWeight: '700',
                                color: t.text, letterSpacing: '0.02em',
                                marginBottom: '4px', textTransform: 'uppercase'
                            }}>
                                RISK-AWARE INTELLIGENCE GRAPH
                            </h1>
                            <p style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '11px', color: t.textMuted,
                                letterSpacing: '0.15em', textTransform: 'uppercase'
                            }}>
                                AGGREGATE INTELLIGENCE TERMINAL // SECURE SESSION 882-X
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
                            <div>
                                <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Active Alerts
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: t.danger, fontFamily: 'JetBrains Mono' }}>
                                    {riskSummary.critical + riskSummary.high} High+
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Visible Graph
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: t.text, fontFamily: 'JetBrains Mono' }}>
                                    {nodes.length ? `${Math.round((filteredNodes.length / nodes.length) * 100)}%` : '0%'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', flexShrink: 0 }}>
                        {filters.map(f => {
                            const isActive = activeFilter === f.toLowerCase();
                            return (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f.toLowerCase())}
                                    style={{
                                        padding: '6px 16px',
                                        border: `1px solid ${isActive ? t.accent : t.border}`,
                                        borderRadius: '6px',
                                        background: isActive ? t.accentBg : t.bgCard,
                                        color: isActive ? t.text : t.textMuted,
                                        fontSize: '13px', cursor: 'pointer',
                                        fontFamily: 'Syne, sans-serif',
                                        fontWeight: isActive ? '600' : '500',
                                        transition: 'all 0.15s'
                                    }}
                                >{f}</button>
                            );
                        })}
                        <button
                            onClick={() => setActiveFilter('all')}
                            style={{
                                padding: '6px 16px',
                                border: `1px solid ${t.border}`,
                                borderRadius: '6px',
                                background: t.bgHover,
                                color: t.textSecondary,
                                fontSize: '13px', cursor: 'pointer',
                                fontFamily: 'Syne, sans-serif',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Filter size={14} /> Filter All
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>

                        <div style={{
                            flex: 1, background: t.bgCard,
                            border: `1px solid ${t.border}`, borderRadius: '8px',
                            position: 'relative', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                                <ForceGraph
                                    nodes={filteredNodes}
                                    edges={filteredEdges}
                                    onNodeClick={handleNodeClick}
                                />
                            </div>

                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center',
                                padding: '12px 14px', borderTop: `1px solid ${t.border}`, background: t.bgCard, zIndex: 10
                            }}>
                                <div style={{ display: 'flex', gap: '28px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Diplomatic', dash: 'none', color: '#0ea5a4' },
                                        { label: 'Trade', dash: '6,4', color: '#2563eb' },
                                        { label: 'Conflict', dash: '2,3', color: '#dc2626' },
                                    ].map(l => (
                                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="32" height="12">
                                                <line x1="0" y1="6" x2="32" y2="6"
                                                    stroke={l.color} strokeWidth="2"
                                                    strokeDasharray={l.dash === 'none' ? null : l.dash} />
                                            </svg>
                                            <span style={{ fontSize: '12px', color: t.textSecondary, fontFamily: 'Syne', fontWeight: '500' }}>{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Critical', color: '#7f1d1d' },
                                        { label: 'High', color: '#dc2626' },
                                        { label: 'Elevated', color: '#f97316' },
                                        { label: 'Guarded', color: '#f59e0b' },
                                        { label: 'Low', color: '#14b8a6' },
                                    ].map(r => (
                                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                                            <span style={{ fontSize: '11px', color: t.textSecondary, fontFamily: 'Syne' }}>{r.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {selectedNode && (
                            <div style={{
                                width: '300px', flexShrink: 0,
                                background: t.bgCard, border: `1px solid ${t.border}`,
                                borderRadius: '8px', padding: '24px',
                                position: 'relative', overflowY: 'auto'
                            }}>
                                <button onClick={() => setSelectedNode(null)} style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    color: t.textMuted, fontSize: '20px', lineHeight: 1
                                }}>×</button>

                                <div style={{ fontSize: '10px', color: t.textMuted, letterSpacing: '0.12em', marginBottom: '6px' }}>
                                    PROFILE
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: t.text, fontFamily: 'Syne, sans-serif', marginBottom: '2px' }}>
                                    {selectedNode.label || selectedNode.id}
                                </div>
                                <div style={{ fontSize: '10px', color: t.textMuted, letterSpacing: '0.1em', marginBottom: '24px' }}>
                                    {selectedNode.profile || selectedNode.type.toUpperCase()} PROFILE
                                </div>

                                <div style={{ height: '1px', background: t.border, marginBottom: '20px' }} />

                                {detail ? <>
                                    <div style={{ fontSize: '10px', color: t.textMuted, letterSpacing: '0.1em', marginBottom: '6px' }}>
                                        RISK RATING
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{
                                            fontSize: '18px', fontWeight: '700',
                                            color: detail.riskScore >= 85 ? t.danger : detail.riskScore >= 70 ? t.danger : detail.riskScore >= 55 ? t.warning : detail.riskScore >= 35 ? t.warning : t.accent
                                        }}>
                                            {detail.riskRating}
                                        </span>
                                        <span style={{
                                            fontSize: '32px', fontWeight: '700', fontFamily: 'Syne, sans-serif',
                                            color: detail.riskScore >= 85 ? t.danger : detail.riskScore >= 55 ? t.warning : t.accent, lineHeight: '1'
                                        }}>
                                            {detail.riskScore}
                                            {detail.riskScore >= 85 && <div style={{ fontSize: '9px', fontWeight: '800', fontFamily: 'Syne', textAlign: 'right', color: t.danger, marginTop: '2px' }}>▲ CRITICAL</div>}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '40px', marginBottom: '24px' }}>
                                        {[30, 40, 45, 52, 60, 68, 75, detail.riskScore].map((v, i) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                height: `${(v / 100) * 100}%`,
                                                background: i === 7 ? t.accent : t.barFillLight,
                                                borderRadius: '2px 2px 0 0'
                                            }} />
                                        ))}
                                    </div>

                                    <div style={{ height: '1px', background: t.border, marginBottom: '20px' }} />

                                    <div style={{ fontSize: '10px', color: t.textMuted, letterSpacing: '0.1em', marginBottom: '16px' }}>
                                        RISK SCORECARD
                                    </div>
                                    {detail.scorecard.map(s => (
                                        <div key={s.label} style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '13px', color: t.text, fontWeight: '500' }}>{s.label}</span>
                                                <span style={{ fontSize: '12px', color: t.text, fontWeight: '600' }}>
                                                    {s.score} <span style={{ color: t.textMuted, fontWeight: '400' }}>({s.level})</span>
                                                </span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: t.border, borderRadius: '4px' }}>
                                                <div style={{ width: `${s.score}%`, height: '100%', background: s.color, borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ height: '1px', background: t.border, margin: '20px 0' }} />

                                    <div style={{ fontSize: '10px', color: t.textMuted, letterSpacing: '0.1em', marginBottom: '16px' }}>
                                        RECENT ACTIVITIES
                                    </div>
                                    {detail.activities.map((a, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            padding: '10px 0', borderBottom: `1px solid ${t.borderLight}`,
                                            fontSize: '13px', color: t.text, fontWeight: '500'
                                        }}>
                                            <span>{a.label}</span>
                                            <span style={{ fontSize: '14px', color: t.accent }}>
                                                {a.icon === 'pin' ? '🛡️' : a.icon === 'signal' ? '📡' : '🔒'}
                                            </span>
                                        </div>
                                    ))}
                                </> : <div style={{ fontSize: '13px', color: t.textMuted }}>No detailed profile exists for this entity class.</div>}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <StatusBar leftLabel="RELATIONSHIP NETWORK" />
        </div>
    );
}
