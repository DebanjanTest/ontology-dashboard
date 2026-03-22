import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countryCoords from '../../data/countryCoordsFull.json';

export default function WorldMapSVG({ highlight = [] }) {
    const primary = highlight[0];
    const comparison = highlight[1];

    const pCoords = primary && countryCoords[primary] ? countryCoords[primary] : null;
    const cCoords = comparison && countryCoords[comparison] ? countryCoords[comparison] : null;

    // A bound that comfortably shows most of the world for a horizontal container
    const worldBounds = [
        [-55, -135], // Southwest
        [75, 145]    // Northeast
    ];

    return (
        <div style={{ width: '100%', height: '220px', borderRadius: '6px', overflow: 'hidden', background: '#e0e5ec', border: '1px solid #e5e7eb' }}>
            <MapContainer
                bounds={worldBounds}
                maxBounds={worldBounds}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}   // Fixed map, no panning
                style={{ height: '100%', width: '100%', background: '#e0e5ec', zIndex: 1 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                />
                
                {pCoords && (
                    <CircleMarker center={pCoords} radius={8} pathOptions={{ color: '#2a9d8f', fillColor: '#2a9d8f', fillOpacity: 0.7, weight: 2 }}>
                        <Tooltip direction="top" offset={[0, -8]} permanent className="font-sans text-xs font-bold" opacity={0.9}>{primary}</Tooltip>
                    </CircleMarker>
                )}
                
                {cCoords && (
                    <CircleMarker center={cCoords} radius={8} pathOptions={{ color: '#e63946', fillColor: '#e63946', fillOpacity: 0.7, weight: 2 }}>
                        <Tooltip direction="top" offset={[0, -8]} permanent className="font-sans text-xs font-bold" opacity={0.9}>{comparison}</Tooltip>
                    </CircleMarker>
                )}
            </MapContainer>
        </div>
    );
}
