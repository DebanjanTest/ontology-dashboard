import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTrendData } from '../hooks/useIntelData';
import { useTheme } from '../context/ThemeContext';

export default function TrendAnalysis() {
    const { theme: t } = useTheme();
    const data = useTrendData();

    return (
        <div className="bottomCard" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '20px', flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '16px' }}>Trend Analysis</div>

            <div style={{ flex: 1, position: 'relative', height: 140, minHeight: 140, minWidth: 280, marginLeft: '-24px', marginRight: '8px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={120}>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.border} />
                        <XAxis
                            dataKey="month"
                            axisLine={{ stroke: t.border }}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: t.textSecondary }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={{ stroke: t.border }}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: t.textSecondary }}
                            domain={[0, 80]}
                            ticks={[0, 20, 40, 60, 80]}
                            dx={-5}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '6px', border: `1px solid ${t.border}`, fontSize: '11px', padding: '6px', background: t.bgCard }}
                        />
                        <Legend
                            iconType="plainline"
                            iconSize={12}
                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: t.text }}
                            verticalAlign="top"
                            align="center"
                            height={30}
                        />
                        <Line type="linear" dataKey="conflict" name="Conflict" stroke="#e63946" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="linear" dataKey="diplomacy" name="Diplomacy" stroke="#2a9d8f" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="linear" dataKey="disaster" name="Disaster" stroke="#f4a261" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
