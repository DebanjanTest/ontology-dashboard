import React from 'react';
import {
    LayoutDashboard,
    Target,
    Rss,
    BrainCircuit,
    Map as MapIcon,
    AlertTriangle,
    Database,
    Settings,
    HelpCircle
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Risk Dashboard', icon: Target },
    { label: 'Feed Monitor', icon: Rss },
    { label: 'NL Analyzer', icon: BrainCircuit },
    { label: 'Explore Map', icon: MapIcon },
    { label: 'Critical Alerts', icon: AlertTriangle },
    { label: 'Data Sources', icon: Database },
    { label: 'Settings', icon: Settings, spacer: true },
    { label: 'Support', icon: HelpCircle }
];

export default function Sidebar({ className }) {
    return (
        <div className={`sidebar ${className || ''}`}>
            {NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                    <React.Fragment key={item.label}>
                        {item.spacer && <div style={{ flex: 1 }} />}
                        <div className={`navItem ${item.active ? 'active' : ''}`}>
                            <Icon className="navIcon" strokeWidth={2} />
                            <span>{item.label}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
