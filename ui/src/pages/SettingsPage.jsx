import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import { Shield, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Toggle = ({ on, onChange, label, t }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: t.text }}>{label}</span>
        <div onClick={() => onChange(!on)} style={{
            width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
            background: on ? '#2a9d8f' : t.textFaint, position: 'relative', transition: 'background 0.2s'
        }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
    </div>
);

const TagChip = ({ label, onRemove, t }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: t.bgHover, padding: '6px 12px', fontSize: '12px', color: t.textSecondary, fontWeight: '500', borderRadius: '4px' }}>
        {label}
        <span onClick={onRemove} style={{ cursor: 'pointer', color: t.textFaint, fontSize: '14px', fontWeight: '700' }}>×</span>
    </span>
);

const Checkbox = ({ checked, onChange, label, t }) => (
    <div onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '3px', border: checked ? 'none' : `1.5px solid ${t.textFaint}`, background: checked ? '#2a9d8f' : t.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            {checked && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>}
        </div>
        <span style={{ fontSize: '13px', color: t.textSecondary, fontWeight: '500' }}>{label}</span>
    </div>
);

export default function SettingsPage() {
    const { theme: t, isDark, toggleTheme } = useTheme();
    const [mfaEnabled, setMfaEnabled] = useState(true);
    const [regionalFocus, setRegionalFocus] = useState(['Indo-Pacific', 'South China Sea']);
    const [mapView, setMapView] = useState('Interactive Map');
    const [language, setLanguage] = useState('English (US)');
    const [timezone, setTimezone] = useState('UTC+8');
    const [subs, setSubs] = useState({ geopolitical: true, economic: true, climate: true, maritime: true });
    const [emailAlerts, setEmailAlerts] = useState({ daily: true, critical: false });

    const toggleSub = (key) => setSubs(prev => ({ ...prev, [key]: !prev[key] }));
    const removeRegion = (region) => setRegionalFocus(prev => prev.filter(r => r !== region));

    const selectStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${t.border}`, fontSize: '13px', color: t.textSecondary, background: t.bgCard, cursor: 'pointer', outline: 'none' };

    return (
        <div className="dashboard-wrapper">
            <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <TopBar activeNav="DASHBOARD" />
            <div className="main-content">
                <Sidebar activePage="Settings" />
                <main className="dashboard-body" style={{ background: t.bg, padding: '40px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', transition: 'background 0.3s' }}>
                    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                        <div style={{ marginBottom: '32px', animation: 'fadeSlideUp 0.4s ease-out' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', color: t.text, fontFamily: 'Syne, sans-serif', margin: 0 }}>
                                ANALYST PLATFORM | <span style={{ color: '#2a9d8f' }}>SETTINGS</span>
                            </h1>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', alignItems: 'start' }}>
                            {/* Column 1: User Security */}
                            <div style={{ background: t.bgCard, borderRadius: '12px', padding: '28px', border: `1px solid ${t.border}`, animation: 'fadeSlideUp 0.5s ease-out 0.1s both', transition: 'background 0.3s, border-color 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                    <div style={{ width: '40px', height: '40px', background: t.accentBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={20} style={{ color: '#2a9d8f' }} />
                                    </div>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: t.text, margin: 0 }}>User Security</h2>
                                </div>
                                <Toggle on={mfaEnabled} onChange={setMfaEnabled} label="Multi-factor Authentication (MFA)" t={t} />
                                <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '-12px', marginBottom: '16px' }}>
                                    Status: <span style={{ color: mfaEnabled ? '#2a9d8f' : t.danger, fontWeight: '600' }}>{mfaEnabled ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>Clearance Level</div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: t.text }}>Top Secret - Level 5</div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '10px' }}>Password Management</div>
                                    <button style={{ width: '100%', padding: '10px', background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Syne, sans-serif', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#238b7e'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#2a9d8f'}
                                    >Change Password</button>
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '12px' }}>Session Management</div>
                                    {[{ name: 'Active session 1', date: 'August 5, 2023 at 11:03 AM' }, { name: 'Active session 2', date: 'August 5, 2023 at 11:03 AM' }].map((s, i) => (
                                        <div key={i} style={{ padding: '10px 0', borderLeft: '3px solid #2a9d8f', paddingLeft: '12px', marginBottom: '8px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: t.text }}>{s.name}</div>
                                            <div style={{ fontSize: '11px', color: t.textFaint }}>{s.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Column 2: Workspace Preferences */}
                            <div style={{ background: t.bgCard, borderRadius: '12px', padding: '28px', border: `1px solid ${t.border}`, animation: 'fadeSlideUp 0.5s ease-out 0.2s both', transition: 'background 0.3s, border-color 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                    <div style={{ width: '40px', height: '40px', background: t.accentBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SettingsIcon size={20} style={{ color: '#2a9d8f' }} />
                                    </div>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: t.text, margin: 0 }}>Workspace Preferences</h2>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '8px' }}>Theme</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['Light', 'Dark'].map(th => (
                                            <button key={th} onClick={() => { if (th === 'Dark' && !isDark) toggleTheme(); if (th === 'Light' && isDark) toggleTheme(); }} style={{
                                                padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                border: (th === 'Dark' ? isDark : !isDark) ? 'none' : `1px solid ${t.border}`, cursor: 'pointer',
                                                background: (th === 'Dark' ? isDark : !isDark) ? '#2a9d8f' : t.bgCard,
                                                color: (th === 'Dark' ? isDark : !isDark) ? '#fff' : t.textMuted,
                                                transition: 'all 0.2s'
                                            }}>{th}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '8px' }}>Regional Focus</div>
                                    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px' }}>
                                        {regionalFocus.map(r => <TagChip key={r} label={r} onRemove={() => removeRegion(r)} t={t} />)}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '8px' }}>Default Map View</div>
                                    <select value={mapView} onChange={e => setMapView(e.target.value)} style={selectStyle}>
                                        <option>Interactive Map</option><option>Satellite View</option><option>Heat Map</option>
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '8px' }}>Language & Timezone</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
                                            <option>English (US)</option><option>Hindi</option><option>Mandarin</option>
                                        </select>
                                        <select value={timezone} onChange={e => setTimezone(e.target.value)} style={selectStyle}>
                                            <option>UTC+8</option><option>UTC+5:30</option><option>UTC-5</option><option>UTC+0</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Subscription/Feed Management */}
                            <div style={{ background: t.bgCard, borderRadius: '12px', padding: '28px', border: `1px solid ${t.border}`, animation: 'fadeSlideUp 0.5s ease-out 0.3s both', transition: 'background 0.3s, border-color 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                    <div style={{ width: '40px', height: '40px', background: t.accentBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <RefreshCw size={20} style={{ color: '#2a9d8f' }} />
                                    </div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: t.text, margin: 0 }}>Subscription/Feed Management</h2>
                                </div>
                                <Toggle on={subs.geopolitical} onChange={() => toggleSub('geopolitical')} label="Global Geopolitical Events" t={t} />
                                <Toggle on={subs.economic} onChange={() => toggleSub('economic')} label="Economic Indicators" t={t} />
                                <Toggle on={subs.climate} onChange={() => toggleSub('climate')} label="Climate & Natural Disasters" t={t} />
                                <Toggle on={subs.maritime} onChange={() => toggleSub('maritime')} label="Maritime Traffic" t={t} />
                                <div style={{ marginTop: '8px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '12px' }}>Email Alerts</div>
                                    <Checkbox checked={emailAlerts.daily} onChange={v => setEmailAlerts(p => ({ ...p, daily: v }))} label="Daily Digest" t={t} />
                                    <Checkbox checked={emailAlerts.critical} onChange={v => setEmailAlerts(p => ({ ...p, critical: v }))} label="Critical Alerts" t={t} />
                                </div>
                                <button style={{ width: '100%', padding: '12px', background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Syne, sans-serif', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#238b7e'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#2a9d8f'}
                                >Manage Data Sources</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <StatusBar leftLabel="SYSTEM NOMINAL: LATENCY 14MS" />
        </div>
    );
}
