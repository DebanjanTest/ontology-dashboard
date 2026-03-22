import React from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import { useTheme } from '../context/ThemeContext';

export default function SimplePage({ title, activePage }) {
  const { theme: t } = useTheme();

  return (
    <div className="dashboard-wrapper">
      <TopBar activeNav="DASHBOARD" />
      <div className="main-content">
        <Sidebar activePage={activePage} />
        <main className="dashboard-body" style={{ background: t.bg, padding:'24px', transition: 'background 0.3s ease' }}>
          <h1 style={{ fontFamily:'Syne', fontSize:'28px', color: t.text }}>{title}</h1>
          <p style={{ color: t.textSecondary, marginTop: '16px' }}>This panel is now routed and functional. Add your module-specific settings/support logic here.</p>
        </main>
      </div>
      <StatusBar leftLabel={title?.toUpperCase() || ''} />
    </div>
  );
}
