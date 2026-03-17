"use client";

import React, { useEffect, useState } from 'react';

const MONTHS = ['January', 'February', 'March'];

const SYMPTOM_COLORS = {
    0: 'bg-slate-50 opacity-100',
    1: 'bg-emerald-100 text-emerald-900',
    2: 'bg-emerald-200 text-emerald-900',
    3: 'bg-emerald-300 text-emerald-950',
    4: 'bg-emerald-400 text-emerald-950',
    5: 'bg-emerald-500 text-white',
    6: 'bg-emerald-600 text-white',
    7: 'bg-emerald-700 text-white',
    8: 'bg-emerald-800 text-white',
    9: 'bg-emerald-950 text-white', // Darkest color for 9
};

const SymptomHeatmap = () => {
    const [data, setData] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null); // { symptom, month, count }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/clinic_insight.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error("Error fetching clinic insight:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-50/50 rounded-2xl animate-pulse">
                <span className="text-emerald-600 font-medium tracking-wide">Loading Analytics...</span>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    const symptoms = Object.keys(data);
    const maxIntensity = 9; // Based on Fever in Jan

    return (
        <div className="w-full p-6 max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl transition-all duration-300 hover:shadow-emerald-100/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Symptom Intensity Matrix</h2>
                    <p className="text-slate-500 text-sm mt-1">Symptom frequency mapping by month for Medikly Analytics.</p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-emerald-50/80 rounded-xl border border-emerald-100/50">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Intensity</span>
                    <div className="flex gap-1">
                        {[1, 3, 6, 9].map((lvl) => (
                            <div key={lvl} className={`w-4 h-4 rounded-full ${SYMPTOM_COLORS[lvl]}`} title={`Level ${lvl}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 bg-slate-50/50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Symptom
                            </th>
                            {MONTHS.map((month) => (
                                <th key={month} className="p-4 bg-slate-50/50 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {symptoms.map((symptom) => (
                            <tr key={symptom} className="group transition-colors duration-150 hover:bg-slate-50/30">
                                <td className="p-4 text-sm font-semibold text-slate-700 border-b border-slate-50 group-hover:text-emerald-700 transition-colors">
                                    {symptom}
                                </td>
                                {MONTHS.map((month) => {
                                    const count = data[symptom][month] || 0;
                                    const intensityColor = SYMPTOM_COLORS[Math.min(count, 9)] || SYMPTOM_COLORS[0];
                                    const isActive = hoveredCell?.symptom === symptom && hoveredCell?.month === month;

                                    return (
                                        <td
                                            key={`${symptom}-${month}`}
                                            className="p-1 border-b border-slate-50 group/cell"
                                            onMouseEnter={() => setHoveredCell({ symptom, month, count })}
                                            onMouseLeave={() => setHoveredCell(null)}
                                        >
                                            <div
                                                className={`
                          mx-auto w-10 h-10 md:w-16 md:h-12 flex items-center justify-center 
                          rounded-lg md:rounded-xl text-sm font-bold
                          transition-all duration-300 transform
                          ${intensityColor}
                          ${isActive ? 'scale-110 shadow-lg ring ring-emerald-200/50 z-10' : 'hover:scale-105'}
                        `}
                                            >
                                                {count > 0 && <span className="opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">{count}</span>}
                                                {isActive && (
                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl pointer-events-none z-50">
                                                        {count} {count === 1 ? 'case' : 'cases'} in {month}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex items-center justify-between text-[11px] font-medium text-slate-400 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time Data Active</span>
                </div>
                <div className="tracking-wide">
                    © 2024 Medikly Analytics Engine
                </div>
            </div>
        </div>
    );
};

export default SymptomHeatmap;
