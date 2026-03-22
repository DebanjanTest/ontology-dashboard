import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import { Search, Satellite, Newspaper, MessageSquare, Globe, ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const SourceIcon = ({ type }) => {
  const { theme: t } = useTheme();
  const typeLower = (type || '').toLowerCase();
  if (typeLower.includes('nasa')) return <Satellite size={14} style={{ color: t.textSecondary }} />;
  if (typeLower.includes('news') || typeLower.includes('gdelt')) return <Newspaper size={14} style={{ color: t.textSecondary }} />;
  if (typeLower.includes('social')) return <MessageSquare size={14} style={{ color: t.textSecondary }} />;
  return <Globe size={14} style={{ color: t.textSecondary }} />;
};

const SentimentDisplay = ({ sentiment, reliability, trend }) => {
  const { theme: t } = useTheme();
  let color = t.textSecondary;
  let Icon = Minus;

  if (sentiment === 'Critical') { color = t.danger; Icon = ArrowUp; }
  else if (sentiment === 'High') { color = t.danger; Icon = ArrowUp; }
  else if (sentiment === 'Elevated') { color = t.warning; Icon = ArrowUp; }
  else if (sentiment === 'Guarded') { color = t.warning; Icon = Minus; }
  else if (sentiment === 'Low' && trend === 'down') { color = t.danger; Icon = ArrowDown; }
  else if (sentiment === 'Low') { color = t.success; Icon = Minus; }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
      <Icon size={14} strokeWidth={2.5} style={{ color }} />
      <span style={{ color: t.text, fontWeight: '600' }}>{sentiment},</span>
      <span style={{ color: t.textSecondary }}>{reliability}</span>
    </div>
  );
};

function mapRisk(risk){
  if (risk >= 85) return ['Critical', 'Verified', 'up'];
  if (risk >= 70) return ['High', 'Trusted', 'up'];
  if (risk >= 55) return ['Elevated', 'Standard', 'up'];
  if (risk >= 35) return ['Guarded', 'Watch', 'flat'];
  return ['Low', 'Watch', 'down'];
}

export default function FeedMonitor() {
  const { theme: t } = useTheme();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/api/feed?limit=60`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = (json.items || []).map((x, i) => {
        const [sentiment, reliability, trend] = mapRisk(Number(x.risk_score || 0));
        const rawTs = String(x.timestamp || '');
        const normalizedTs = /Z$|[+-]\d{2}:?\d{2}$/.test(rawTs) ? rawTs : `${rawTs}Z`; // treat naive as UTC
        const ts = new Date(normalizedTs);
        const ist = Number.isNaN(ts.getTime())
          ? rawTs
          : new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }).format(ts);
        return {
          id: i + 1,
          timestamp: ist,
          source: x.source,
          headline: `[${x.domain}] ${x.headline}`,
          sentiment,
          reliability,
          trend,
        };
      });
      setRows(items);
    } catch (e) {
      setError('Feed API not reachable. Start backend on :8000 and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredData = useMemo(() => rows.filter(item =>
    item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  ), [rows, searchTerm]);

  return (
    <div className="dashboard-wrapper">
      <TopBar activeNav="MONITOR" />
      <div className="main-content">
        <Sidebar activePage="Feed Monitor" />

        <main className="dashboard-body" style={{ background: t.bg, padding: '32px 40px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexShrink: 0 }}>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', color: t.text, letterSpacing: '-0.02em', marginBottom: '8px', textTransform: 'uppercase' }}>
                LIVE INTELLIGENCE FEED MONITOR
              </h1>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: t.textSecondary, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                AGGREGATE INTELLIGENCE TERMINAL // SECURE SESSION 882-X
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0, gap: '16px' }}>
            <div style={{ position: 'relative', width: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '9px', color: t.textMuted }} />
              <input type="text" placeholder="Search Feed..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '4px', border: `1px solid ${t.border}`, outline: 'none', fontSize: '13px', fontFamily: 'Syne, sans-serif', background: t.bgCard, color: t.text }} />
            </div>

            <button onClick={triggerRefresh} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${t.border}`, background: t.bgCard, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }}>
              <RefreshCw size={14} style={{ color: t.textSecondary }} />
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {error && <div style={{marginBottom:'10px', color: t.danger, fontSize:'12px', fontWeight:600, background: t.dangerBg, padding: '8px 12px', borderRadius: '6px'}}>{error}</div>}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: t.bgCard, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '700', color: t.text, width: '170px', borderBottom: `2px solid ${t.border}` }}>Timestamp (IST)</th>
                    <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '700', color: t.text, width: '160px', borderBottom: `2px solid ${t.border}` }}>Source</th>
                    <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '700', color: t.text, borderBottom: `2px solid ${t.border}` }}>Headline</th>
                    <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '700', color: t.text, width: '220px', borderBottom: `2px solid ${t.border}` }}>Sentiment / Reliability</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="4" style={{padding:'20px', color: t.textSecondary}}>Loading live feed...</td></tr>
                  )}
                  {!loading && filteredData.length === 0 && (
                    <tr><td colSpan="4" style={{padding:'20px', color: t.textSecondary}}>No feed rows yet. Wait ~12s or click refresh.</td></tr>
                  )}
                  {filteredData.map((row, i) => (
                    <tr key={row.id || i} style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.bgCard, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = t.bgHover}
                        onMouseLeave={e => e.currentTarget.style.background = t.bgCard}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: t.text, fontFamily: 'Syne, sans-serif' }}>{row.timestamp}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: t.text }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><SourceIcon type={row.source} />{row.source}</div>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: t.text, fontWeight: '500' }}>{row.headline}</td>
                      <td style={{ padding: '16px 12px' }}><SentimentDisplay sentiment={row.sentiment} reliability={row.reliability} trend={row.trend} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <StatusBar leftLabel="LIVE STREAM MONITORING" />
    </div>
  );
}
