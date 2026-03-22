import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Bell, Moon, Sun, LogOut, LogIn, User, Settings } from 'lucide-react';
import useSystemHealth from '../../hooks/useSystemHealth';
import { useTheme } from '../../context/ThemeContext';

export default function TopBar({ activeNav = 'DASHBOARD' }) {
    const navigate = useNavigate();
    const health = useSystemHealth();
    const { theme: t, isDark, toggleTheme } = useTheme();

    const [showProfile, setShowProfile] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const notifications = [
        { id: 1, type: 'high', title: 'Naval Activity Alert', desc: 'Increased movement in South China Sea corridor', time: '2 min ago' },
        { id: 2, type: 'medium', title: 'Cyber Threat Update', desc: 'New vulnerability detected in European banking sector', time: '18 min ago' },
        { id: 3, type: 'low', title: 'Trade Route Change', desc: 'Suez Canal traffic pattern shift detected', time: '1 hr ago' },
    ];
    const typeColors = { high: t.danger, medium: t.warning, low: t.info };

    const handleNavClick = (item) => {
        if (item === 'DASHBOARD') navigate('/dashboard');
        if (item === 'GRAPH') navigate('/graph');
        if (item === 'MONITOR') navigate('/feed');
        if (item === 'QUERY') navigate('/query');
        if (item === 'CASCADE') navigate('/analyzer');
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: '52px', background: t.bgTopbar || '#ffffff', borderBottom: `1px solid ${t.border || '#e5e7eb'}`,
            padding: '0 20px', flexShrink: 0, position: 'relative', zIndex: 100,
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            transition: 'background 0.3s, border-color 0.3s'
        }}>
            <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', height: '100%' }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '14px', fontWeight: '700', color: t.text || '#1a1a2e', letterSpacing: '0.05em', lineHeight: '52px' }}>
                    SII COMMAND
                </span>

                <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%' }}>
                    {['GRAPH', 'DASHBOARD', 'MONITOR', 'QUERY', 'CASCADE'].map(item => (
                        <div key={item}
                            onClick={() => handleNavClick(item)}
                            style={{
                                fontSize: '11px', fontWeight: '600', color: item === activeNav ? (t.text || '#1a1a2e') : (t.textMuted || '#6b7280'),
                                fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', cursor: 'pointer',
                                borderBottom: item === activeNav ? `2px solid ${t.text || '#1a1a2e'}` : '2px solid transparent',
                                height: '52px', display: 'flex', alignItems: 'center', boxSizing: 'border-box'
                            }}>
                            {item}
                        </div>
                    ))}
                </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: '700',
                    background: health?.status === 'ok' ? '#dcfce7' : '#fee2e2',
                    color: health?.status === 'ok' ? '#166534' : '#991b1b',
                    border: `1px solid ${health?.status === 'ok' ? '#86efac' : '#fecaca'}`
                }}>
                    {health?.status === 'ok' ? `DB:${health?.db || 'ok'} | GRAPH:${health?.graph_mode || 'live'}` : 'BACKEND OFFLINE'}
                </div>
                
                {/* Theme Toggle */}
                <div onClick={toggleTheme} style={{
                    width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    border: `1px solid ${t.border || '#e5e7eb'}`, transition: 'all 0.3s'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}
                >
                    {isDark
                        ? <Sun size={16} style={{ color: '#fbbf24', transition: 'transform 0.3s' }} />
                        : <Moon size={16} style={{ color: '#64748b', transition: 'transform 0.3s' }} />
                    }
                </div>

                <div ref={notifRef} style={{ position: 'relative' }}>
                    <div onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} style={{ position: 'relative', cursor: 'pointer', padding: '6px' }}>
                        <Bell style={{ width: '18px', height: '18px', color: t.textMuted || '#6b7280' }} />
                        <span style={{
                            position: 'absolute', top: '2px', right: '2px',
                            width: '14px', height: '14px', background: t.danger || '#e63946', borderRadius: '50%',
                            fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
                        }}>3</span>
                    </div>
                    {showNotifs && (
                        <div style={{
                            position: 'absolute', top: '44px', right: 0, width: '320px',
                            background: t.bgCard || '#ffffff', border: `1px solid ${t.border || '#e5e7eb'}`, borderRadius: '10px',
                            boxShadow: t.shadowLg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', animation: 'fadeDown 0.2s ease-out'
                        }}>
                            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.borderLight || '#f1f5f9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: t.text || '#1a1a2e', letterSpacing: '0.05em' }}>NOTIFICATIONS</span>
                                <span style={{ fontSize: '10px', color: t.accent || '#2a9d8f', cursor: 'pointer', fontWeight: '600' }}>Mark all read</span>
                            </div>
                            {notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '12px 16px', borderBottom: `1px solid ${t.borderLight || '#f1f5f9'}`, cursor: 'pointer',
                                    transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.bgHover || '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: typeColors[n.type] }} />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: t.text || '#1a1a2e' }}>{n.title}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: t.textMuted || '#6b7280', marginBottom: '4px', paddingLeft: '14px' }}>{n.desc}</div>
                                    <div style={{ fontSize: '10px', color: t.textFaint || '#9ca3af', paddingLeft: '14px' }}>{n.time}</div>
                                </div>
                            ))}
                            <div onClick={() => { navigate('/feed'); setShowNotifs(false); }} style={{
                                padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '600',
                                color: t.accent || '#2a9d8f', cursor: 'pointer', borderTop: `1px solid ${t.borderLight || '#f1f5f9'}`
                            }}>View All in Feed Monitor →</div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                    <div onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} style={{
                        width: '28px', height: '28px', background: t.accent || '#2a9d8f', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', color: '#fff', fontWeight: '600', fontFamily: 'Syne, sans-serif',
                        cursor: 'pointer', transition: 'box-shadow 0.2s',
                        boxShadow: showProfile ? `0 0 0 3px ${t.accentBg || 'rgba(42,157,143,0.1)'}` : 'none'
                    }}>JD</div>
                    {showProfile && (
                        <div style={{
                            position: 'absolute', top: '40px', right: 0, width: '220px',
                            background: t.bgCard || '#ffffff', border: `1px solid ${t.border || '#e5e7eb'}`, borderRadius: '10px',
                            boxShadow: t.shadowLg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', animation: 'fadeDown 0.2s ease-out'
                        }}>
                            <div style={{ padding: '16px', borderBottom: `1px solid ${t.borderLight || '#f1f5f9'}` }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: t.text || '#1a1a2e' }}>Jane Doe</div>
                                <div style={{ fontSize: '11px', color: t.textMuted || '#6b7280' }}>j.doe@agency.gov</div>
                                <div style={{ fontSize: '9px', fontWeight: '700', color: t.accent || '#2a9d8f', marginTop: '6px', letterSpacing: '0.05em' }}>TOP SECRET - LEVEL 5</div>
                            </div>
                            {[
                                { icon: User, label: 'My Profile', action: () => { navigate('/settings'); setShowProfile(false); } },
                                { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowProfile(false); } },
                            ].map((item, i) => (
                                <div key={i} onClick={item.action} style={{
                                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                                    fontSize: '12px', color: t.textSecondary || '#4b5563', cursor: 'pointer', transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.bgHover || '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <item.icon size={14} style={{ color: t.textMuted || '#6b7280' }} />{item.label}
                                </div>
                            ))}
                            <div style={{ borderTop: `1px solid ${t.borderLight || '#f1f5f9'}` }}>
                                <div onClick={() => { navigate('/login'); setShowProfile(false); }} style={{
                                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                                    fontSize: '12px', color: t.textSecondary || '#4b5563', cursor: 'pointer', transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.bgHover || '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogIn size={14} style={{ color: t.textMuted || '#6b7280' }} />Login
                                </div>
                                <div onClick={() => { navigate('/login'); setShowProfile(false); }} style={{
                                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                                    fontSize: '12px', color: t.danger || '#e63946', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.dangerBg || 'rgba(230, 57, 70, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={14} style={{ color: t.danger || '#e63946' }} />Logout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
