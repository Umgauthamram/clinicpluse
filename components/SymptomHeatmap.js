"use client";

import React, { useEffect, useState } from 'react';

const MONTHS = ['January', 'February', 'March'];

const SYMPTOM_COLORS = {
    0: 'bg-white/40 border border-slate-100',
    1: 'bg-emerald-50 text-emerald-600',
    2: 'bg-emerald-100 text-emerald-700',
    3: 'bg-emerald-200 text-emerald-800',
    4: 'bg-emerald-300 text-emerald-900',
    5: 'bg-emerald-400 text-white',
    6: 'bg-emerald-500 text-white',
    7: 'bg-emerald-600 text-white',
    8: 'bg-teal-700 text-white',
    9: 'bg-teal-900 text-emerald-50', // Darkest color for 9
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
        <div className="w-full p-8 max-w-5xl mx-auto bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(16,185,129,0.05)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-800">Symptom <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Intensity Matrix</span></h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Symptom frequency mapping by month for Medikly Analytics.</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white max-w-max shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Intensity</span>
                    <div className="flex gap-1.5 pr-2">
                        {[1, 3, 6, 9].map((lvl) => (
                            <div key={lvl} className={`w-5 h-5 rounded-full ${SYMPTOM_COLORS[lvl]} shadow-sm`} title={`Level ${lvl}`} />
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
                            <tr key={symptom} className="group transition-colors duration-300 hover:bg-slate-50/50">
                                <td className="p-4 text-sm font-bold text-slate-600 border-b border-transparent group-hover:text-emerald-700 transition-colors">
                                    {symptom}
                                </td>
                                {MONTHS.map((month) => {
                                    const count = data[symptom][month] || 0;
                                    const intensityColor = SYMPTOM_COLORS[Math.min(count, 9)] || SYMPTOM_COLORS[0];
                                    const isActive = hoveredCell?.symptom === symptom && hoveredCell?.month === month;

                                    return (
                                        <td
                                            key={`${symptom}-${month}`}
                                            className="p-1.5 border-b border-transparent group/cell"
                                            onMouseEnter={() => setHoveredCell({ symptom, month, count })}
                                            onMouseLeave={() => setHoveredCell(null)}
                                        >
                                            <div
                                                className={`
                                                    mx-auto w-10 h-10 md:w-14 md:h-14 flex items-center justify-center 
                                                    rounded-full text-sm font-bold
                                                    transition-all duration-300 transform
                                                    ${intensityColor}
                                                    ${isActive ? 'scale-110 shadow-lg ring-4 ring-emerald-100 z-10' : 'hover:scale-105 hover:shadow-md'}
                                                `}
                                            >
                                                {count > 0 && <span className="opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300">{count}</span>}
                                                {isActive && (
                                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white text-[10px] items-center gap-1 font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl pointer-events-none z-50 border border-slate-700">
                                                        <span className="font-bold text-emerald-400">{count}</span> {count === 1 ? 'case' : 'cases'} in {month}
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
