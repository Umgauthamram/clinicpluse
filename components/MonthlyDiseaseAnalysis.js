"use client";

import React, { useEffect, useState, useMemo } from 'react';

const MonthlyDiseaseAnalysis = () => {
    const [insights, setInsights] = useState(null);
    const [knowledge, setKnowledge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [insRes, knowRes] = await Promise.all([
                    fetch('/clinic_insight.json'),
                    fetch('/medical_knowledge.json')
                ]);
                setInsights(await insRes.json());
                setKnowledge(await knowRes.json());
            } catch (err) {
                console.error("Analysis data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const analysis = useMemo(() => {
        if (!insights || !knowledge) return [];
        const months = ['January', 'February', 'March'];

        return months.map(month => {
            // Find top symptoms for the month
            const monthlyStats = Object.entries(insights).map(([symptom, counts]) => ({
                symptom,
                count: counts[month] || 0
            })).sort((a, b) => b.count - a.count);

            const topSymptom = monthlyStats[0];

            // Match with diseases based on symptoms
            const likelyDiseases = knowledge.diseases.filter(disease =>
                disease.symptoms.includes(topSymptom.symptom) ||
                (month === 'January' && disease.id === 'influenza' && monthlyStats.find(s => s.symptom === 'Fever')?.count > 5) ||
                (month === 'February' && disease.id === 'allergic-rhinitis' && monthlyStats.find(s => s.symptom === 'Itchy Eyes')?.count > 5)
            );

            return {
                month,
                topSymptom: topSymptom.symptom,
                count: topSymptom.count,
                diseases: likelyDiseases,
                summary: month === 'January' ? "Peak Flu Season" : month === 'February' ? "Allergy Surge" : "Viral Persistence"
            };
        });
    }, [insights, knowledge]);

    if (loading) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {analysis.map((item, idx) => (
                <div
                    key={item.month}
                    className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden relative"
                >
                    {/* Decorative Month Label */}
                    <div className="absolute -right-6 top-10 rotate-90 text-8xl font-black text-slate-50 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.month}
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-2 inline-block shadow-sm">
                                {item.summary}
                            </span>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{item.month}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Primary Diagnosis</h4>
                                <div className="space-y-3">
                                    {item.diseases.map(d => (
                                        <div key={d.id} className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{d.name}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">Likely due to {item.topSymptom} surge</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Impact Score</span>
                                    <span className="text-xl font-black text-slate-900 tracking-tight">{item.count}+ <span className="text-xs font-medium text-slate-400 italic">pts</span></span>
                                </div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${idx === 0 ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                    idx === 1 ? 'bg-blue-50 border-blue-100 text-blue-500' :
                                        'bg-amber-50 border-amber-100 text-amber-500'
                                    }`}>
                                    <span className="font-black text-xs">!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MonthlyDiseaseAnalysis;
