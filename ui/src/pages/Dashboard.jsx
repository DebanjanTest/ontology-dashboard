import React from 'react';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import WorldMap from '../components/WorldMap';
import DetailPanel from '../components/DetailPanel';
import CriticalAlerts from '../components/CriticalAlerts';
import TrendAnalysis from '../components/TrendAnalysis';
import RegionOverview from '../components/RegionOverview';

export default function Dashboard() {
    return (
        <div className="dashboard-wrapper">
            <TopBar activeNav="DASHBOARD" />
            <div className="main-content">
                <Sidebar activePage="Dashboard" />
                <main className="dashboard-body">
                    <div className="top-widgets">
                        <div className="map-container">
                            <WorldMap />
                        </div>
                        <DetailPanel className="detail-panel" />
                    </div>
                    <div className="bottom-widgets">
                        <CriticalAlerts />
                        <TrendAnalysis />
                        <RegionOverview />
                    </div>
                </main>
            </div>
            <StatusBar />
        </div>
    );
}
