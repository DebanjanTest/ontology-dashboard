import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, CircleMarker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapEvents, useTradeArcs } from '../hooks/useIntelData';

// Curved arc lines
function curvedArc(from, to, points = 32) {
    const dLat = to[0] - from[0];
    const dLng = to[1] - from[1];
    const dist = Math.sqrt((dLat * dLat) + (dLng * dLng));
    const bow = Math.max(1.2, Math.min(6.5, dist * 0.06)); // reduced, distance-aware curvature

    return Array.from({ length: points }, (_, i) => {
        const t = i / (points - 1);
        const lat = from[0] + dLat * t + Math.sin(Math.PI * t) * bow;
        const lng = from[1] + dLng * t;
        return [lat, lng];
    });
}

// Map marker colors via divIcon
const markerIcons = {
    conflict: divIcon({
        className: '',
        html: `<div style="
      width:14px; height:14px; border-radius:50% 50% 50% 0;
      background:#e63946; border:2px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 14],
    }),
    diplomatic: divIcon({
        className: '',
        html: `<div style="
      width:14px; height:14px; border-radius:50% 50% 50% 0;
      background:#3b82f6; border:2px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 14],
    }),
    disaster: divIcon({
        className: '',
        html: `<div style="
      width:14px; height:14px; border-radius:50% 50% 50% 0;
      background:#f4a261; border:2px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 14],
    }),
};

export default function WorldMap() {
    const events = useMapEvents();
    const tradeArcs = useTradeArcs();

    return (
        <div className="w-full h-full relative group">
            <MapContainer
                center={[25, 15]}
                zoom={2}
                minZoom={2}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                className="w-full h-full z-0"
                style={{ background: '#e0e5ec', height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="topleft" />

                {events.map((event) => (
                    <React.Fragment key={event.id}>
                    <CircleMarker
                        center={[event.lat, event.lng]}
                        radius={Math.max(4, Math.min(12, (event.risk || 50) / 10))}
                        pathOptions={{
                            color: event.type === 'conflict' ? '#e63946' : event.type === 'diplomatic' ? '#3b82f6' : '#f4a261',
                            fillColor: event.type === 'conflict' ? '#e63946' : event.type === 'diplomatic' ? '#3b82f6' : '#f4a261',
                            fillOpacity: 0.15,
                            weight: 1
                        }}
                    />
                    <Marker
                        position={[event.lat, event.lng]}
                        icon={markerIcons[event.type] || markerIcons.conflict}
                    >
                        <Popup className="font-sans text-sm p-0 m-0 border-none shadow-md rounded-md">
                            <div className="px-3 py-2 bg-white rounded-md">
                                <strong className={`block mb-1 ${event.type === 'conflict' ? 'text-accentRed' :
                                    event.type === 'diplomatic' ? 'text-[#3b82f6]' : 'text-accentOrange'
                                    }`}>
                                    {event.label}
                                </strong>
                                <span className="text-textPrimary">{event.desc}</span>
                            </div>
                        </Popup>
                    </Marker>
                    </React.Fragment>
                ))}

                {tradeArcs.map((arc, i) => (
                    <Polyline
                        key={i}
                        positions={curvedArc(arc.from, arc.to)}
                        pathOptions={{
                            color: arc.color || '#2a9d8f',
                            weight: arc.weight || 1.5,
                            opacity: arc.opacity || 0.7,
                            dashArray: null
                        }}
                    />
                ))}
            </MapContainer>

            {/* Map Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '12px',
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '10px 14px',
                zIndex: 1000,
                fontSize: '11px'
            }}>
                <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Events</div>
                {[
                    { color: '#e63946', label: 'Conflicts' },
                    { color: '#3b82f6', label: 'Diplomatic Meetings' },
                    { color: '#f4a261', label: 'Natural Disasters' },
                ].map(e => (
                    <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.color }} />
                        <span style={{ color: '#444' }}>{e.label}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <div style={{ width: '16px', height: '2px', background: '#2a9d8f' }} />
                    <span style={{ color: '#444' }}>Trade Relations</span>
                </div>
            </div>
        </div>
    );
}
