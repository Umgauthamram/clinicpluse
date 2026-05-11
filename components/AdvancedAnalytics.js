"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    AreaChart,
    Area,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const AdvancedAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/clinic_insight.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error("Error fetching data for secondary analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to process raw array data if needed
    const processedData = useMemo(() => {
        if (!data) return null;
        if (Array.isArray(data)) {
            const aggregated = {};
            data.forEach(record => {
                const s = record.Symptom;
                const m = record.Month;
                if (s && m) {
                    if (!aggregated[s]) aggregated[s] = {};
                    aggregated[s][m] = (aggregated[s][m] || 0) + 1;
                }
            });
            return aggregated;
        }
        return data;
    }, [data]);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const activeMonths = useMemo(() => {
        if (!processedData) return [];
        return months.filter(m => 
            Object.values(processedData).some(s => s[m] !== undefined)
        );
    }, [processedData]);

    // Dynamically pick the top 4 symptoms by total volume instead of hardcoding
    const rankedSymptoms = useMemo(() => {
        if (!processedData) return [];
        return Object.keys(processedData)
            .map(s => ({
                name: s,
                total: activeMonths.reduce((sum, m) => sum + (processedData[s][m] || 0), 0)
            }))
            .sort((a, b) => b.total - a.total);
    }, [processedData, activeMonths]);

    // Dynamic comparison pairs from top 4 symptoms
    const pair1Data = useMemo(() => {
        if (!processedData || rankedSymptoms.length < 2) return [];
        const s1 = rankedSymptoms[0].name;
        const s2 = rankedSymptoms[1].name;
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            [s1]: processedData[s1]?.[m] || 0,
            [s2]: processedData[s2]?.[m] || 0,
        }));
    }, [processedData, activeMonths, rankedSymptoms]);

    const pair2Data = useMemo(() => {
        if (!processedData || rankedSymptoms.length < 4) return [];
        const s3 = rankedSymptoms[2].name;
        const s4 = rankedSymptoms[3].name;
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            [s3]: processedData[s3]?.[m] || 0,
            [s4]: processedData[s4]?.[m] || 0,
        }));
    }, [processedData, activeMonths, rankedSymptoms]);

    // Data for Top Symptom Monthly Trend (dynamic)
    const topSymptomTrendData = useMemo(() => {
        if (!processedData || rankedSymptoms.length === 0) return [];
        const topName = rankedSymptoms[0].name;
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            cases: processedData[topName]?.[m] || 0,
        }));
    }, [processedData, activeMonths, rankedSymptoms]);

    // Data for Top Symptom vs Average (dynamic)
    const topVsAverageData = useMemo(() => {
        if (!processedData || rankedSymptoms.length === 0) return [];
        const topName = rankedSymptoms[0].name;
        const symptoms = Object.keys(processedData);
        return activeMonths.map(m => {
            const topVal = processedData[topName]?.[m] || 0;
            const total = symptoms.reduce((sum, s) => sum + (processedData[s][m] || 0), 0);
            const average = total / symptoms.length;
            return {
                month: m.slice(0, 3),
                [topName]: topVal,
                Average: Math.round(average),
            };
        });
    }, [processedData, activeMonths, rankedSymptoms]);

    if (loading || !processedData || rankedSymptoms.length < 4) return null;

    const s1 = rankedSymptoms[0].name;
    const s2 = rankedSymptoms[1].name;
    const s3 = rankedSymptoms[2].name;
    const s4 = rankedSymptoms[3].name;

    return (
        <div className="space-y-12 py-12">
            {/* Row 1: Symptom Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 1 vs Top 2 Comparison */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">{s1} vs {s2} Comparison</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pair1Data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={s1} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={s2} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 3 vs Top 4 Comparison */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">{s3} vs {s4} Comparison</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pair2Data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={s3} fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={s4} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Trends and Aggregates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Symptom — Monthly Trend */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">{s1} — Monthly Trend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={topSymptomTrendData}>
                                <defs>
                                    <linearGradient id="colorTop" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="cases" stroke="#ef4444" fillOpacity={1} fill="url(#colorTop)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Symptom vs Average */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">{s1} vs Average</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={topVsAverageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey={s1} stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Average" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;
