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

    // Data Transformation for Bar Chart (Total per Symptom)
    const barData = useMemo(() => {
        if (!data) return [];
        return Object.entries(data).map(([name, months]) => ({
            name,
            total: Object.values(months).reduce((a, b) => a + b, 0),
        })).sort((a, b) => b.total - a.total);
    }, [data]);

    // Data Transformation for Pie Chart (Distribution)
    const pieData = useMemo(() => {
        return barData.slice(0, 5); // Top 5 for clarity
    }, [barData]);

    // Data for the List Section
    const detailedList = useMemo(() => {
        if (!data) return [];
        const months = ['January', 'February', 'March'];
        return Object.entries(data).map(([symptom, values]) => ({
            symptom,
            jan: values.January || 0,
            feb: values.February || 0,
            mar: values.March || 0,
            total: Object.values(values).reduce((a, b) => a + b, 0)
        }));
    }, [data]);

    if (loading) return null;

    return (
        <div className="space-y-12 py-12">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart: Symptom Volume */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Total Case Volume by Symptom</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    interval={0}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Distribution */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Top Symptom Distribution</h3>
                    <div className="h-80 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="total"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data List Section */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Clinic Data Ledger</h3>
                        <p className="text-sm text-slate-500">Comprehensive breakdown of all recorded symptoms.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        Export JSON
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-8 py-4 font-semibold">Symptom Name</th>
                                <th className="px-8 py-4 font-semibold">January</th>
                                <th className="px-8 py-4 font-semibold">February</th>
                                <th className="px-8 py-4 font-semibold">March</th>
                                <th className="px-8 py-4 font-semibold text-right">Aggregate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {detailedList.map((item) => (
                                <tr key={item.symptom} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="font-semibold text-slate-700">{item.symptom}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-slate-500 font-medium">{item.jan}</td>
                                    <td className="px-8 py-4 text-slate-500 font-medium">{item.feb}</td>
                                    <td className="px-8 py-4 text-slate-500 font-medium">{item.mar}</td>
                                    <td className="px-8 py-4 text-right">
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            {item.total}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdvancedAnalytics;
