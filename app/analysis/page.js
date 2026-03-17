"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AnalysisPage() {
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState('Fever');
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

    // Selected symptom data
    const selectedData = months.map(m => ({
        month: m.slice(0, 3),
        count: processedData[selected]?.[m] || 0
    }));
    const selectedTotal = selectedData.reduce((s, d) => s + d.count, 0);
    const peakMonth = selectedData.sort((a, b) => b.count - a.count)[0];

    // Comparison: all symptoms for a bar chart
    const comparisonData = symptoms.map((s, i) => ({
        name: s,
        total: months.reduce((sum, m) => sum + (processedData[s][m] || 0), 0),
        fill: colors[i % colors.length]
    }));

    // Pie chart for selected symptom distribution
    const pieData = months.map(m => ({
        name: m.slice(0, 3),
        value: processedData[selected]?.[m] || 0
    })).filter(d => d.value > 0);

    // Line: selected symptom vs average
    const avgPerMonth = months.map(m => {
        const avg = symptoms.reduce((sum, s) => sum + (processedData[s][m] || 0), 0) / symptoms.length;
        return Math.round(avg * 10) / 10;
    });
    const lineCompare = months.map((m, i) => ({
        month: m.slice(0, 3),
        [selected]: processedData[selected]?.[m] || 0,
        Average: avgPerMonth[i]
    }));

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    Symptom <span style={{ color: '#2E7D32' }}>Analysis</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Deep dive into each symptom — select, compare, and understand trends</p>
            </div>

            {/* Symptom Selector */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#9e9e9e' }}>Select a Symptom</p>
                <div className="flex flex-wrap gap-3">
                    {symptoms.map((s, i) => (
                        <button
                            key={s}
                            onClick={() => setSelected(s)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border ${selected === s ? 'text-white shadow-lg scale-105' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                                }`}
                            style={selected === s ? { background: '#2E7D32', borderColor: '#2E7D32' } : {}}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Symptom Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden" style={{ background: '#2E7D32' }}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-20" style={{ background: '#A5D6A7' }} />
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#A5D6A7' }}>Total Reports</p>
                    <p className="text-4xl font-black mt-2">{selectedTotal}</p>
                    <p className="text-xs mt-1 text-white/60">{selected} across Q1</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9e9e9e' }}>Peak Month</p>
                    <p className="text-2xl font-black mt-2" style={{ color: '#1a1a2e' }}>{peakMonth.month}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7c8a' }}>{peakMonth.count} cases</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9e9e9e' }}>Avg / Month</p>
                    <p className="text-2xl font-black mt-2" style={{ color: '#1a1a2e' }}>{(selectedTotal / 3).toFixed(1)}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7c8a' }}>cases per month</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend for Selected */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>{selected} — Monthly Trend</h3>
                    <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Bar chart showing case distribution</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={selectedData.sort((a, b) => months.indexOf(months.find(m => m.startsWith(a.month))) - months.indexOf(months.find(m => m.startsWith(b.month))))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                            <Bar dataKey="count" fill="#66BB6A" radius={[12, 12, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Selected vs Average Line */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>{selected} vs Average</h3>
                    <p className="text-[10px] mb-6" style={{ color: '#9e9e9e' }}>Comparison with overall mean</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={lineCompare}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                            <Line type="monotone" dataKey={selected} stroke="#2E7D32" strokeWidth={4} dot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Average" stroke="#9e9e9e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart Distribution */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>{selected} Distribution</h3>
                    <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Pie chart of monthly share</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={5} label={({ name, value }) => `${name}: ${value}`}>
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={colors[i % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Comparison Bar */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>All Symptoms Comparison</h3>
                    <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Total counts across the quarter</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={comparisonData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} width={90} />
                            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                            <Bar dataKey="total" radius={[0, 12, 12, 0]}>
                                {comparisonData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
