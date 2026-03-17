"use client";
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function TrendsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/clinic_insight.json')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#A5D6A7', borderTopColor: 'transparent' }} />
        </div>
    );

    // Normalize data: Handle both aggregated object format and raw record array format
    let processedData = data;
    if (Array.isArray(data)) {
        processedData = {};
        data.forEach(record => {
            const s = record.Symptom;
            const m = record.Month;
            if (s && m) {
                if (!processedData[s]) processedData[s] = {};
                processedData[s][m] = (processedData[s][m] || 0) + 1;
            }
        });
    }

    const symptoms = Object.keys(processedData);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].filter(m =>
        symptoms.some(s => processedData[s][m] !== undefined)
    );
    const colors = ['#2E7D32', '#66BB6A', '#A5D6A7', '#42A5F5', '#FFA726', '#E53935', '#AB47BC'];

    // Heatmap data
    const heatmapData = symptoms.map(s => ({
        symptom: s,
        ...Object.fromEntries(months.map(m => [m, processedData[s][m] || 0]))
    }));
    const maxVal = Math.max(...symptoms.flatMap(s => months.map(m => processedData[s][m] || 0)));

    const getHeatColor = (val) => {
        if (val === 0) return '#F1F8F4';
        const intensity = val / maxVal;
        if (intensity > 0.7) return '#1B5E20';
        if (intensity > 0.5) return '#2E7D32';
        if (intensity > 0.3) return '#66BB6A';
        if (intensity > 0.1) return '#A5D6A7';
        return '#C8E6C9';
    };

    // Seasonal spike detection
    const spikes = [];
    symptoms.forEach(s => {
        months.forEach(m => {
            const val = processedData[s][m] || 0;
            const avg = months.reduce((sum, mo) => sum + (processedData[s][mo] || 0), 0) / months.length;
            if (val > avg * 1.5 && val >= 5) {
                spikes.push({ symptom: s, month: m, value: val, avg: Math.round(avg * 10) / 10 });
            }
        });
    });

    // Correlation: scatter plot pairs (Fever vs Cough, Sneezing vs Itchy Eyes)
    const correlationPairs = [
        { x: 'Fever', y: 'Cough', label: 'Fever vs Cough' },
        { x: 'Sneezing', y: 'Itchy Eyes', label: 'Sneezing vs Itchy Eyes' },
    ];

    const scatterData = correlationPairs.map(pair => ({
        ...pair,
        points: months.map(m => ({
            x: processedData[pair.x]?.[m] || 0,
            y: processedData[pair.y]?.[m] || 0,
            month: m.slice(0, 3)
        }))
    }));

    // Pattern detection logic
    const patterns = [];

    // Check for respiratory spikes in any month
    const respSymptoms = ['Fever', 'Cough', 'Runny Nose'];
    months.forEach(m => {
        const respCount = respSymptoms.reduce((s, sym) => s + (processedData[sym]?.[m] || 0), 0);
        if (respCount >= 20) {
            patterns.push({ type: 'Respiratory Cluster', detail: `High respiratory activity in ${m} (${respCount} cases). Potential viral outbreak.`, severity: 'high' });
        }
    });

    // Allergy cluster
    months.forEach(m => {
        const allergyCount = (processedData['Itchy Eyes']?.[m] || 0) + (processedData['Sneezing']?.[m] || 0);
        if (allergyCount >= 15) {
            patterns.push({ type: 'Allergy Cluster', detail: `${m} saw ${allergyCount} combined allergy cases. Seasonal trigger detected.`, severity: 'medium' });
        }
    });

    // Overall trend comparison
    const firstMonthTotal = symptoms.reduce((s, sym) => s + (processedData[sym]?.[months[0]] || 0), 0);
    const lastMonthTotal = symptoms.reduce((s, sym) => s + (processedData[sym]?.[months[months.length - 1]] || 0), 0);

    if (lastMonthTotal < firstMonthTotal) {
        patterns.push({ type: 'Overall Recovery', detail: `Cases in ${months[months.length - 1]} (${lastMonthTotal}) show decline from early ${months[0]} levels.`, severity: 'low' });
    } else {
        patterns.push({ type: 'Increasing Demand', detail: `Clinic volume in ${months[months.length - 1]} is higher than starting period.`, severity: 'medium' });
    }

    // Month comparison
    const monthData = months.map(m => ({
        month: m,
        short: m.slice(0, 3),
        total: symptoms.reduce((s, sym) => s + (processedData[sym][m] || 0), 0),
        breakdown: symptoms.map(sym => ({ name: sym, value: processedData[sym][m] || 0 }))
    }));

    // Line data
    const lineData = months.map(m => {
        const point = { month: m.slice(0, 3) };
        symptoms.forEach(s => { point[s] = processedData[s][m] || 0; });
        return point;
    });

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    Trends & <span style={{ color: '#2E7D32' }}>Patterns</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Identify outbreaks, seasonal spikes, and symptom correlations</p>
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-fade-in">
                <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>Symptom Intensity Heatmap</h3>
                <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Color intensity = number of cases. Darker = more cases.</p>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left text-xs font-bold p-3" style={{ color: '#6b7c8a' }}>Symptom</th>
                                {months.map(m => (
                                    <th key={m} className="text-center text-xs font-bold p-3" style={{ color: '#6b7c8a' }}>{m.slice(0, 3)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapData.map((row, i) => (
                                <tr key={row.symptom}>
                                    <td className="text-sm font-bold p-3" style={{ color: '#1a1a2e' }}>{row.symptom}</td>
                                    {months.map(m => {
                                        const val = row[m];
                                        const bg = getHeatColor(val);
                                        const textColor = val > maxVal * 0.5 ? '#fff' : '#1a1a2e';
                                        return (
                                            <td key={m} className="text-center p-2">
                                                <div className="rounded-xl py-4 px-3 font-black text-sm transition-transform hover:scale-110 cursor-default" style={{ background: bg, color: textColor }}>
                                                    {val}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Seasonal Spikes */}
            {spikes.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: '#1a1a2e' }}>Seasonal Spike Detection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                        {spikes.map((sp, i) => (
                            <div key={i} className="p-5 rounded-2xl border-l-4 opacity-0 animate-fade-in" style={{ background: '#FFF3E0', borderColor: '#FFA726' }}>
                                <p className="text-xs font-black uppercase" style={{ color: '#E65100' }}>{sp.symptom} — {sp.month}</p>
                                <p className="text-2xl font-black mt-1" style={{ color: '#1a1a2e' }}>{sp.value} cases</p>
                                <p className="text-xs mt-1" style={{ color: '#6b7c8a' }}>Average: {sp.avg} — Spike of {Math.round((sp.value / sp.avg - 1) * 100)}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Symptom Correlation Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {correlationPairs.map((pair, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>{pair.label} Comparison</h3>
                        <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Temporal correlation tracking — how these symptoms peak together</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={months.map(m => ({
                                month: m.slice(0, 3),
                                [pair.x]: processedData[pair.x]?.[m] || 0,
                                [pair.y]: processedData[pair.y]?.[m] || 0,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                                <Line type="monotone" dataKey={pair.x} stroke="#2E7D32" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey={pair.y} stroke="#FFA726" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>



            {/* Month Comparison Tool */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: '#1a1a2e' }}>Month Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {monthData.map((md, i) => (
                        <div key={i} className="rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition-shadow" style={{ background: i === 0 ? '#E8F5E9' : '#fff' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black" style={{ color: '#1a1a2e' }}>{md.month}</h4>
                                <span className="text-2xl font-black" style={{ color: '#2E7D32' }}>{md.total}</span>
                            </div>
                            <div className="space-y-2">
                                {md.breakdown.filter(b => b.value > 0).sort((a, b) => b.value - a.value).map((b, j) => (
                                    <div key={j} className="flex items-center justify-between">
                                        <span className="text-xs font-medium" style={{ color: '#6b7c8a' }}>{b.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 rounded-full" style={{ width: `${(b.value / maxVal) * 60}px`, background: '#66BB6A' }} />
                                            <span className="text-xs font-bold" style={{ color: '#1a1a2e' }}>{b.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
