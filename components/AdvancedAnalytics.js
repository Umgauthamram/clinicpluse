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

    // Data for Fever vs Cough
    const feverVsCoughData = useMemo(() => {
        if (!processedData) return [];
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            Fever: processedData['Fever']?.[m] || 0,
            Cough: processedData['Cough']?.[m] || 0,
        }));
    }, [processedData, activeMonths]);

    // Data for Sneezing vs Itchy Eyes
    const sneezeVsItchyData = useMemo(() => {
        if (!processedData) return [];
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            Sneezing: processedData['Sneezing']?.[m] || 0,
            'Itchy Eyes': processedData['Itchy Eyes']?.[m] || 0,
        }));
    }, [processedData, activeMonths]);

    // Data for Fever Monthly Trend
    const feverTrendData = useMemo(() => {
        if (!processedData) return [];
        return activeMonths.map(m => ({
            month: m.slice(0, 3),
            cases: processedData['Fever']?.[m] || 0,
        }));
    }, [processedData, activeMonths]);

    // Data for Fever vs Average
    const feverVsAverageData = useMemo(() => {
        if (!processedData) return [];
        const symptoms = Object.keys(processedData);
        return activeMonths.map(m => {
            const fever = processedData['Fever']?.[m] || 0;
            const total = symptoms.reduce((sum, s) => sum + (processedData[s][m] || 0), 0);
            const average = total / symptoms.length;
            return {
                month: m.slice(0, 3),
                Fever: fever,
                Average: Math.round(average),
            };
        });
    }, [processedData, activeMonths]);

    if (loading || !processedData) return null;

    return (
        <div className="space-y-12 py-12">
            {/* Row 1: Symptom Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fever vs Cough Comparison */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">Fever vs Cough Comparison</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={feverVsCoughData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Fever" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Cough" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sneezing vs Itchy Eyes Comparison */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">Sneezing vs Itchy Eyes Comparison</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sneezeVsItchyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Sneezing" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Itchy Eyes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Trends and Aggregates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fever - Monthly Trend */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">Fever — Monthly Trend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={feverTrendData}>
                                <defs>
                                    <linearGradient id="colorFever" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="cases" stroke="#ef4444" fillOpacity={1} fill="url(#colorFever)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fever vs Average */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">Fever vs Average</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={feverVsAverageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Fever" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
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
