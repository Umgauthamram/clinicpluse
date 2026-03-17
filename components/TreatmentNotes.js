"use client";

import React, { useState, useEffect } from 'react';

const TreatmentNotes = () => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        const fetchKnowledge = async () => {
            try {
                const response = await fetch('/medical_knowledge.json');
                const data = await response.json();
                setDiseases(data.diseases);
                if (data.diseases.length > 0) setActiveId(data.diseases[0].id);
            } catch (err) {
                console.error("Failed to load medical knowledge:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchKnowledge();
    }, []);

    if (loading) return null;

    const activeDisease = diseases.find(d => d.id === activeId);

    return (
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden animate-fade-in group">
            <div className="flex flex-col lg:flex-row h-[560px]">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-3 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                        Medical Directory
                    </h3>
                    {diseases.map((disease) => (
                        <button
                            key={disease.id}
                            onClick={() => setActiveId(disease.id)}
                            className={`p-4 rounded-2xl text-left transition-all duration-300 group/btn ${activeId === disease.id
                                    ? 'bg-white shadow-xl shadow-emerald-100 ring-1 ring-emerald-100 text-slate-900 translate-x-2'
                                    : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-lg'
                                }`}
                        >
                            <span className="block font-bold text-sm tracking-tight">{disease.name}</span>
                            <span className={`text-[10px] uppercase font-bold mt-1 inline-block ${disease.severity === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                {disease.severity} Severity
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 lg:p-12 bg-white relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-60" />

                    {activeDisease && (
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full mb-4">
                                    Diagnostic Profile
                                </div>
                                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                                    {activeDisease.name}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                                {/* Left Column: Symptoms & Curing */}
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Primary Symptoms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeDisease.symptoms.map(s => (
                                                <span key={s} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Curing Protocol
                                        </h4>
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                            {activeDisease.curing}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column: Medicine */}
                                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        Medicine Notes
                                    </h4>
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-slate-700 font-bold text-lg leading-relaxed text-center italic">
                                            "{activeDisease.medicine}"
                                        </p>
                                    </div>
                                    <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">!</div>
                                            <p className="text-[10px] leading-tight text-slate-400 font-bold uppercase tracking-tight">
                                                Professional medical consultation is required before initiating therapy.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TreatmentNotes;
