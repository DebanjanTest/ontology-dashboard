import React from 'react';

export default function StatusBar({ leftLabel }) {
    return (
        <div style={{
            height: '32px',
            background: '#e5e7eb',
            borderTop: '1px solid #d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.1em', fontFamily: 'Syne' }}>
                    {leftLabel || 'GEOPOLITICAL TENSION'}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#6b7280', fontFamily: 'JetBrains Mono' }}>
                <span>LAT: 38.5951° N</span>
                <span>LAN: 77.8364° W</span>
                <span style={{
                    background: '#e5e7eb',
                    border: '1px solid #d1d5db',
                    padding: '2px 6px',
                    borderRadius: '4px'
                }}>ENCRYPTED CHANNEL ON</span>
            </div>
        </div>
    );
}
