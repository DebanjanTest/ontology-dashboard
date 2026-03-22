import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import { Search, FileText, Download, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TimelineStep = ({ step, title, desc, isLast, isComplete, t }) => (
    <div style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: isLast ? '0' : '32px', animation: 'fadeIn 0.5s ease-out' }}>
        {!isLast && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '0', width: '1px', background: t.border, zIndex: 0 }} />}
        <div style={{ zIndex: 1, flexShrink: 0 }}>
            {isComplete ? (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0258d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 0 0 4px ${t.accentBgSoft}` }}>
                    <Check size={12} strokeWidth={3} />
                </div>
            ) : (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.bgCard, border: '1px solid #0258d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#0258d4', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 10px rgba(2, 88, 212, 0.2)' }}>
                    {step}
                </div>
            )}
        </div>
        <div style={{ paddingTop: '2px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: isComplete ? '#0258d4' : t.text, letterSpacing: '0.05em', marginBottom: '8px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase' }}>{title}</div>
            <div style={{ fontSize: '13px', color: t.textSecondary, lineHeight: '1.6', fontFamily: 'Syne, sans-serif', fontWeight: isComplete ? '600' : '500' }}>{desc}</div>
        </div>
    </div>
);

const FileCard = ({ title, size, isPdf, t }) => (
    <div style={{ background: t.bgInput, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', transition: 'transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '32px', height: '32px', background: isPdf ? t.dangerBg : t.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} style={{ color: isPdf ? t.danger : t.textSecondary }} />
            </div>
            <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: t.text, fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '10px', color: t.textMuted, fontFamily: 'Syne, sans-serif', fontWeight: '600' }}>{size}</div>
            </div>
        </div>
        <Download size={14} style={{ color: '#0258d4' }} />
    </div>
);

export default function NLQuery() {
    const { theme: t } = useTheme();
    const [query, setQuery] = useState('');
    const [stage, setStage] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        let timer;
        if (stage > 0 && stage < 5) { timer = setTimeout(() => setStage(s => s + 1), 1200); }
        return () => clearTimeout(timer);
    }, [stage]);

    const handleExecute = () => { if (!query.trim()) return; setStage(1); };

    const autofillQuery = (text) => {
        setQuery(''); setStage(0); setIsTyping(true);
        let i = 0;
        const interval = setInterval(() => {
            setQuery(text.substring(0, i + 1)); i++;
            if (i === text.length) { clearInterval(interval); setIsTyping(false); }
        }, 30);
    };

    return (
        <div className="dashboard-wrapper">
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseChart { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
      `}</style>
            <TopBar activeNav="QUERY" />
            <div className="main-content">
                <Sidebar activePage="NL Query" />
                <main className="dashboard-body" style={{ background: t.bg, padding: '48px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', transition: 'background 0.3s' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px', transition: 'all 0.5s', transform: stage > 0 ? 'translateY(0)' : 'translateY(10vh)' }}>
                            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', color: t.text, letterSpacing: '-0.02em', marginBottom: '24px' }}>ASK INTELLIGENCE</h1>
                            <div style={{
                                background: t.bgCard, boxShadow: t.shadowLg, padding: '8px 8px 8px 24px',
                                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
                                border: stage > 0 && stage < 5 ? '1px solid #0258d4' : `1px solid ${t.border}`,
                                borderRadius: '4px', transition: 'all 0.3s'
                            }}>
                                {stage > 0 && stage < 5 ? <Loader2 size={20} style={{ color: '#0258d4', animation: 'spinSlow 2s linear infinite' }} /> : <Search size={20} style={{ color: '#0258d4' }} />}
                                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Define analytic parameters or select a trending vector..."
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', fontFamily: 'Syne, sans-serif', color: t.text, fontWeight: '500', background: 'transparent' }}
                                    disabled={stage > 0} onKeyDown={e => e.key === 'Enter' && handleExecute()} />
                                <button onClick={handleExecute} disabled={stage > 0 || isTyping || !query.trim()} style={{
                                    background: (stage > 0 || isTyping || !query.trim()) ? t.textFaint : '#0258d4', color: '#ffffff', border: 'none', padding: '14px 28px',
                                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', cursor: (stage > 0 || isTyping || !query.trim()) ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Syne, sans-serif', borderRadius: '4px', transition: 'background 0.3s'
                                }}>{stage > 0 && stage < 5 ? 'PROCESSING...' : 'EXECUTE'}</button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', opacity: stage === 0 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', color: t.textFaint, letterSpacing: '0.1em' }}>TRENDING VECTORS:</span>
                                {[
                                    { tag: '#CRITICAL-MINERALS', text: 'Analyze global economic shifts in critical mineral supply chains over the past 90 days.' },
                                    { tag: '#ECHO-CHAMBER-DETECTION', text: 'Detect polarizing echo-chamber propagation on public sentiment networks.' },
                                    { tag: '#ARCTIC-LOGISTICS', text: 'Assess maritime vulnerabilities in newly exposed Arctic logistics nodes.' }
                                ].map(item => (
                                    <span key={item.tag} onClick={() => stage === 0 && autofillQuery(item.text)} style={{
                                        fontSize: '10px', fontWeight: '700', color: '#0258d4', letterSpacing: '0.05em', cursor: stage === 0 ? 'pointer' : 'default',
                                        borderBottom: '1px solid transparent'
                                    }} onMouseEnter={e => stage === 0 && (e.currentTarget.style.borderBottom = '1px solid #0258d4')} onMouseLeave={e => e.currentTarget.style.borderBottom = '1px solid transparent'}>
                                        {item.tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {stage > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr minmax(280px, 1fr)', gap: '24px', alignItems: 'start' }}>
                                <div style={{ background: t.bgCard, padding: '32px', height: '100%', boxShadow: t.shadow, borderRadius: '4px', animation: 'fadeIn 0.5s ease-out', border: `1px solid ${t.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: t.text, letterSpacing: '0.1em', margin: 0 }}>REASONING<br />PATH</h3>
                                        <div style={{ background: t.bgInput, padding: '4px 8px', fontSize: '9px', fontWeight: '700', color: t.textMuted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                                            TRACE_ID: {Math.floor(Math.random() * 900) + 100}-XQ
                                        </div>
                                    </div>
                                    {stage >= 1 && <TimelineStep t={t} step="01" title="DECONSTRUCTING QUERY" desc="Identified primary entities. Cross-referencing current geopolitical tension index boundaries." isComplete={stage > 1} />}
                                    {stage >= 2 && <TimelineStep t={t} step="02" title="RETRIEVING SAT-INTEL" desc="Analyzing vessel tracking data from 48-hour window. Anomaly detected in shipping lanes." isComplete={stage > 2} />}
                                    {stage >= 3 && <TimelineStep t={t} step="03" title="SYNTHESIZING IMPACT" desc="Calculating downstream ripple for manufacturers. Probability of 15% delay variance." isComplete={stage > 3} />}
                                    {stage >= 4 && <TimelineStep t={t} isLast isComplete title="FINAL CONCLUSION GENERATED" desc={<i>The intersection of recorded events suggests a tactical market volatility spike within T-minus 12 days.</i>} />}
                                </div>

                                {stage >= 5 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.8s ease-out' }}>
                                        <div style={{ background: t.bgCard, padding: '40px', boxShadow: t.shadow, borderRadius: '4px', border: `1px solid ${t.border}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                <div style={{ width: '4px', height: '16px', background: '#0258d4' }} />
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0258d4', letterSpacing: '0.15em' }}>INTELLIGENCE SYNTHESIS</span>
                                            </div>
                                            <h2 style={{ fontSize: '32px', fontWeight: '800', color: t.text, marginBottom: '24px', lineHeight: '1.2' }}>
                                                Supply Chain<br />Fragility in Target<br />Nodes Detected
                                            </h2>
                                            <p style={{ fontSize: '14px', lineHeight: '1.7', color: t.textSecondary, marginBottom: '24px', fontWeight: '500' }}>
                                                Our NL Engine has processed <span style={{ color: '#0258d4', fontWeight: '700' }}>14,000+ data points</span> to identify a <span style={{ color: t.danger, background: t.dangerBg, padding: '2px 6px', fontWeight: '700' }}>Medium-High Criticality</span> vulnerability.
                                            </p>
                                            <p style={{ fontSize: '14px', lineHeight: '1.7', color: t.textSecondary, marginBottom: '40px', fontWeight: '500' }}>
                                                Alternative routes show <span style={{ color: t.success, fontWeight: '700', background: t.accentBg, padding: '2px 6px' }}>22% lower risk profile</span> but 14% higher operational cost.
                                            </p>
                                            <div style={{ display: 'flex', gap: '48px', borderTop: `1px solid ${t.borderLight}`, paddingTop: '24px' }}>
                                                {[{ l: 'CONFIDENCE\nSCORE', v: '94.2%', c: t.text }, { l: 'DATA\nFRESHNESS', v: '3.4m', c: t.text }, { l: 'ANOMALIES', v: '02', c: t.danger }].map(m => (
                                                    <div key={m.l}><div style={{ fontSize: '10px', fontWeight: '700', color: t.textFaint, letterSpacing: '0.05em', marginBottom: '8px', whiteSpace: 'pre-line' }}>{m.l}</div><div style={{ fontSize: '24px', fontWeight: '800', color: m.c }}>{m.v}</div></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ background: t.bgCard, padding: '32px', boxShadow: t.shadow, borderRadius: '4px', border: `1px solid ${t.border}` }}>
                                            <h3 style={{ fontSize: '11px', fontWeight: '800', color: t.text, letterSpacing: '0.1em', marginBottom: '32px' }}>RISK PROBABILITY VS. IMPACT</h3>
                                            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                                                <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                                    <line x1="100" y1="0" x2="100" y2="180" stroke={t.borderLight} strokeWidth="2" />
                                                    <line x1="200" y1="0" x2="200" y2="180" stroke={t.borderLight} strokeWidth="2" />
                                                    <line x1="300" y1="0" x2="300" y2="180" stroke={t.borderLight} strokeWidth="2" />
                                                    <line x1="0" y1="90" x2="400" y2="90" stroke={t.borderLight} strokeWidth="2" />
                                                    <line x1="0" y1="180" x2="400" y2="180" stroke={t.border} strokeWidth="2" />
                                                    <path d="M 0 170 Q 200 150 400 30" fill="none" stroke={t.border} strokeWidth="3" strokeDasharray="6 6" style={{ animation: 'pulseChart 3s infinite' }} />
                                                    <g style={{ animation: 'fadeIn 1s ease-out 0.2s both' }}><circle cx="150" cy="110" r="6" fill="#0258d4" stroke={t.bgCard} strokeWidth="3" /></g>
                                                    <g style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}><circle cx="230" cy="140" r="7" fill={t.text} stroke={t.bgCard} strokeWidth="3" /></g>
                                                    <g style={{ animation: 'fadeIn 1s ease-out 0.8s both' }}><circle cx="320" cy="80" r="6" fill="#ef4444" stroke={t.bgCard} strokeWidth="3" /></g>
                                                    <text x="200" y="196" fill={t.textFaint} fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">PROBABILITY</text>
                                                    <text x="-90" y="-12" fill={t.textFaint} fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.05em" transform="rotate(-90)" dominantBaseline="hanging">IMPACT</text>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {stage >= 5 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.8s ease-out 0.3s both' }}>
                                        <div style={{ background: t.bgCard, padding: '32px', boxShadow: t.shadow, borderRadius: '4px', border: `1px solid ${t.border}` }}>
                                            <h3 style={{ fontSize: '11px', fontWeight: '800', color: t.text, letterSpacing: '0.1em', marginBottom: '24px' }}>SOURCE<br />ARCHIVES</h3>
                                            <FileCard t={t} title="Q3 MARITIME TRAFFIC_SUMMARY.PDF" size="2.4 MB" isPdf={true} />
                                            <FileCard t={t} title="SEMICOND_VULNERABILITY.PDF" size="11.8 MB" isPdf={true} />
                                            <FileCard t={t} title="NAV_DRILL_INTEL_LOG.TXT" size="45 KB" isPdf={false} />
                                        </div>
                                        <div style={{ background: t.bgCard, padding: '24px', boxShadow: t.shadow, borderRadius: '4px', border: `1px solid ${t.border}` }}>
                                            <h3 style={{ fontSize: '10px', fontWeight: '800', color: t.textFaint, letterSpacing: '0.1em', marginBottom: '16px' }}>SATELLITE REFERENCE</h3>
                                            <div style={{
                                                height: '180px', background: '#334155', position: 'relative', overflow: 'hidden', borderRadius: '4px', border: `1px solid ${t.border}`,
                                                backgroundImage: 'radial-gradient(#475569 10%, transparent 11%), radial-gradient(#475569 10%, transparent 11%)',
                                                backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px',
                                            }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)', animation: 'pulseChart 3s infinite linear', transform: 'translateY(100px)' }} />
                                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: t.bgCard, padding: '8px 12px', fontSize: '10px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: t.text, letterSpacing: '0.05em', boxShadow: t.shadow }}>
                                                    COORD: 22.61° N, 120.31°<br />E
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <StatusBar leftLabel="SYSTEM NOMINAL: LATENCY 14MS" />
        </div>
    );
}
