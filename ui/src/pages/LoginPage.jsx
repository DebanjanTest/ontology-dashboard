import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) { setError('All fields are required.'); return; }
        setError('');
        setLoading(true);
        setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1200);
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'transparent',
            display: 'flex', flexDirection: 'column'
        }}>
            <AnimatedBackground />
            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideAccent { 0% { transform: translateY(-100%); } 100% { transform: translateY(600px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

            {/* Top Bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,14,26,0.6)',
                backdropFilter: 'blur(16px)', position: 'relative', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '14px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '0.08em' }}>SII COMMAND</span>
                    <span onClick={() => navigate('/register')} style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.1em', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#2a9d8f'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >REGISTRY</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.1em', cursor: 'pointer' }}>SUPPORT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#2a9d8f', letterSpacing: '0.05em', borderLeft: '2px solid #2a9d8f', paddingLeft: '12px' }}>SECURE LOGIN</span>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.05)' }}>SYSTEM STATUS: NOMINAL</span>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', position: 'relative', zIndex: 10 }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '360px 440px', maxWidth: '840px', width: '100%',
                    animation: 'fadeUp 0.6s ease-out', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden'
                }}>
                    {/* Left Panel */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '48px 36px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                            background: 'linear-gradient(to right, transparent, rgba(42,157,143,0.5), transparent)',
                            animation: 'slideAccent 4s linear infinite', pointerEvents: 'none'
                        }} />
                        <div>
                            <Shield size={32} style={{ color: '#2a9d8f', marginBottom: '24px' }} />
                            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#f1f5f9', lineHeight: '1.15', marginBottom: '20px', fontFamily: 'Syne, sans-serif' }}>
                                SECURE<br />ACCESS<br />PORTAL
                            </h1>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
                                Access to the SII Command Intelligence Protocol is restricted to verified personnel.
                                Please ensure all credentials match your official agency records.
                            </p>
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#2a9d8f', letterSpacing: '0.1em' }}>PROTOCOL 44-B COMPLIANT</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Lock size={12} style={{ color: '#2a9d8f' }} />
                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#2a9d8f', letterSpacing: '0.1em' }}>END-TO-END ENCRYPTION</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div style={{
                        background: '#ffffff', padding: '48px 40px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#2a9d8f', letterSpacing: '0.12em', margin: 0, fontFamily: 'Syne, sans-serif' }}>
                                AUTHENTICATION PORTAL
                            </h2>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>REF: AU-{Math.floor(Math.random() * 900) + 100}-BRAVO</span>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>OFFICIAL EMAIL (.GOV / .MIL)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="j.doe@agency.gov"
                                    style={{
                                        width: '100%', padding: '12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb',
                                        borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none',
                                        fontFamily: 'Syne, sans-serif', transition: 'border-color 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#2a9d8f'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>ACCESS KEY</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"
                                        style={{
                                            width: '100%', padding: '12px 40px 12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb',
                                            borderRadius: '6px', color: '#0f172a', fontSize: '14px', outline: 'none',
                                            fontFamily: 'Syne, sans-serif', transition: 'border-color 0.2s', boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#2a9d8f'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    <div onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: '#94a3b8' }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '16px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <span onClick={() => navigate('/register')} style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#2a9d8f'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                >
                                    ← CREATE NEW ACCOUNT
                                </span>
                                <button type="submit" disabled={loading} style={{
                                    padding: '13px 32px', background: loading ? '#94a3b8' : '#2a9d8f', color: '#fff',
                                    border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em',
                                    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif',
                                    transition: 'all 0.3s', boxShadow: loading ? 'none' : '0 4px 14px rgba(42,157,143,0.25)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#238b7e'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2a9d8f'; }}
                                >
                                    {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '32px', fontSize: '9px', color: '#94a3b8', lineHeight: '1.6', letterSpacing: '0.02em' }}>
                            WARNING: THIS IS A SECURED INTELLIGENCE SYSTEM. UNAUTHORIZED ACCESS MAY
                            SUBJECT YOU TO CIVIL AND CRIMINAL PENALTIES. BY SUBMITTING, YOU CONSENT TO MONITORING AND
                            AUDITING OF ALL ACTIVITY.
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,14,26,0.6)',
                backdropFilter: 'blur(16px)', position: 'relative', zIndex: 10
            }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '12px', fontWeight: '700', color: '#475569' }}>SII COMMAND</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>© 2024 SII Intelligence Systems. Government Standard Protocol.</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}>Terms of Service</span>
                </div>
            </div>
        </div>
    );
}
