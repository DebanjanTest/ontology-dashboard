import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import WorldMapSVG from '../components/map/WorldMapSVG';
import { useBilateralData } from '../hooks/useBilateral';
import ALL_COUNTRIES from '../data/countries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import CountryStatsTable from '../components/CountryStatsTable';
import { useTheme } from '../context/ThemeContext';

export default function RiskDashboard() {
    const { theme: t } = useTheme();
    const [primary, setPrimary] = useState('India');
    const [comparison, setComparison] = useState('USA');
    const { chartData, stability, insights } = useBilateralData(primary, comparison);
    const availableCountries = useMemo(() => [...ALL_COUNTRIES].sort((a, b) => a.localeCompare(b)), []);

    useEffect(() => {
        if (comparison === primary) {
            const fallback = availableCountries.find(c => c !== primary) || 'USA';
            setComparison(fallback);
        }
    }, [primary, comparison, availableCountries]);

    return (
        <div className="dashboard-wrapper">
            <TopBar activeNav="DASHBOARD" />
            <div className="main-content">
                <Sidebar activePage="Comparison Dashboard" />

                <main className="dashboard-body" style={{ background: t.bg, padding: '24px' }}>

                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: t.text,
                        fontFamily: 'Syne, sans-serif',
                        marginBottom: '20px'
                    }}>
                        Bilateral Sectoral Comparison Dashboard
                    </h1>

                    {/* Component 1: Country Selector Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '14px', color: t.textSecondary, fontWeight: '500' }}>Primary Country:</label>
                            <select
                                value={primary}
                                onChange={e => setPrimary(e.target.value)}
                                style={{
                                    border: `1px solid ${t.border}`, borderRadius: '6px',
                                    padding: '7px 28px 7px 12px', fontSize: '14px',
                                    color: t.text, background: t.bgCard, cursor: 'pointer',
                                    fontFamily: 'Syne, sans-serif', minWidth: '140px', outline: 'none'
                                }}
                            >
                                {availableCountries.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '14px', color: t.textSecondary, fontWeight: '500' }}>Comparison Country:</label>
                            <select
                                value={comparison}
                                onChange={e => setComparison(e.target.value)}
                                style={{
                                    border: `1px solid ${t.border}`, borderRadius: '6px',
                                    padding: '7px 28px 7px 12px', fontSize: '14px',
                                    color: t.text, background: t.bgCard, cursor: 'pointer',
                                    fontFamily: 'Syne, sans-serif', minWidth: '140px', outline: 'none'
                                }}
                            >
                                {availableCountries.filter(c => c !== primary).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke={t.textMuted} strokeWidth="2" style={{ cursor: 'pointer' }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '20px', color: t.text, fontFamily: 'Syne' }}>
                                    Bilateral Sectoral Comparison Analysis
                                </h3>
                                <div style={{ width: '100%', height: 320, minHeight: 320, minWidth: 420 }}>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={380} minHeight={280}>
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke={t.border} vertical={false} />
                                            <XAxis
                                                dataKey="sector"
                                                tick={{ fontSize: 12, fill: t.textSecondary, fontFamily: 'Syne' }}
                                                axisLine={false} tickLine={false} dy={8}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                tick={{ fontSize: 12, fill: t.textMuted }}
                                                axisLine={false} tickLine={false} dx={-10}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: t.bgCard, border: `1px solid ${t.border}`,
                                                    borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                            />

                                            <Bar dataKey="primary" name={primary} fill="#1a7a6e" radius={[2, 2, 0, 0]} barSize={20}>
                                                <LabelList dataKey="primary" position="top" style={{ fontSize: '10px', fill: t.textSecondary, fontFamily: 'JetBrains Mono' }} />
                                            </Bar>
                                            <Bar dataKey="comparison" name={comparison} fill="#26a69a" radius={[2, 2, 0, 0]} barSize={20}>
                                                <LabelList dataKey="comparison" position="top" style={{ fontSize: '10px', fill: t.textSecondary, fontFamily: 'JetBrains Mono' }} />
                                            </Bar>
                                            <Bar dataKey="global" name="Global Average" fill="#90caf9" radius={[2, 2, 0, 0]} barSize={20}>
                                                <LabelList dataKey="global" position="top" style={{ fontSize: '10px', fill: t.textSecondary, fontFamily: 'JetBrains Mono' }} />
                                            </Bar>

                                            <Legend
                                                wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }}
                                                iconType="square"
                                                iconSize={10}
                                                formatter={(value) => <span style={{ color: t.textSecondary, fontFamily: 'Syne' }}>{value}</span>}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '16px', color: t.text, fontFamily: 'Syne' }}>
                                    Comparative Risks & Relational Dynamics
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {insights.map((point, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '13px', color: t.textSecondary, lineHeight: '1.4' }}>
                                            <span style={{ color: t.accent, flexShrink: 0 }}>•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>

                        <div style={{ width: '280px', flexShrink: 0 }}>
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '16px', color: t.text, fontFamily: 'Syne' }}>Regional Context</h3>
                                <WorldMapSVG highlight={[primary, comparison]} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: t.textSecondary, marginBottom: '4px' }}>{primary} Stability</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: t.accent, fontFamily: 'JetBrains Mono' }}>
                                            {stability.primary?.stability ?? '—'}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', color: t.textSecondary, marginBottom: '4px' }}>{comparison} Stability</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: t.accent, fontFamily: 'JetBrains Mono' }}>
                                            {stability.comparison?.stability ?? '—'}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', color: t.textSecondary, marginBottom: '4px' }}>{primary} Momentum</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: t.accent, fontFamily: 'JetBrains Mono' }}>
                                            {stability.primary?.momentum ?? '—'}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '12px', color: t.textSecondary, marginBottom: '4px' }}>{comparison} Momentum</div>
                                        <div style={{ fontSize: '26px', fontWeight: '700', color: t.accent, fontFamily: 'JetBrains Mono' }}>
                                            {stability.comparison?.momentum ?? '—'}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <CountryStatsTable />
                    </div>
                </main>
            </div>
            <StatusBar />
        </div>
    );
}
