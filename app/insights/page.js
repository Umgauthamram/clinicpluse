"use client";
import React, { useEffect, useState, useMemo } from 'react';

export default function InsightsPage() {
    const [data, setData] = useState(null);
    const [knowledge, setKnowledge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState([]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/clinic_insight.json').then(r => r.json()),
            fetch('/medical_knowledge.json').then(r => r.json())
        ]).then(([d, k]) => { 
            setData(d); 
            setKnowledge(k); 
            setLoading(false);
            generateRealInsights(d);
        })
        .catch(() => setLoading(false));
    }, []);

    const processedData = useMemo(() => {
        if (!data) return null;
        let processed = data;
        if (Array.isArray(data)) {
            processed = {};
            data.forEach(record => {
                const s = record.Symptom;
                const m = record.Month;
                if (s && m) {
                    if (!processed[s]) processed[s] = {};
                    processed[s][m] = (processed[s][m] || 0) + 1;
                }
            });
        }
        return processed;
    }, [data]);

    const generateRealInsights = async (currentData) => {
        setGenerating(true);
        try {
            // Create a summary for the AI
            const summary = Object.entries(currentData).slice(0, 5).map(([s, m]) => 
                `${s}: ${Object.entries(m).map(([month, count]) => `${month}(${count})`).join(', ')}`
            ).join('; ');

            const res = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataSummary: summary })
            });
            const result = await res.json();
            setAiInsights(result.insights || []);
        } catch (error) {
            console.error("Failed to generate AI insights:", error);
        } finally {
            setGenerating(false);
        }
    };

    const symptoms = useMemo(() => processedData ? Object.keys(processedData) : [], [processedData]);
    const monthsOrder = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
    const months = useMemo(() => {
        if (!processedData) return [];
        return monthsOrder.filter(m =>
            symptoms.some(s => processedData[s][m] !== undefined)
        );
    }, [processedData, symptoms, monthsOrder]);

    // Advanced Dynamic Diagnosis Engine
    const diagnoses = useMemo(() => {
        if (!processedData || !knowledge || months.length === 0) return [];
        const results = [];
        
        // Dynamic matching: Iterate through each month and each disease in the library
        months.forEach(m => {
            knowledge.diseases.forEach(disease => {
                // If a disease is "detected" (at least 2 matching moderate symptoms in that month)
                // Case-insensitive lookup
                const matchingSymptoms = disease.symptoms.filter(s => {
                    const val = processedData[s]?.[m] || 
                                processedData[s.toLowerCase()]?.[m] || 
                                processedData[s.charAt(0).toUpperCase() + s.slice(1)]?.[m] || 0;
                    return val >= 2;
                });
                
                if (matchingSymptoms.length >= 2 || (matchingSymptoms.length >= 1 && disease.symptoms.length === 1)) {
                    // Calculate confidence based on symptom volume
                    const totalVolume = matchingSymptoms.reduce((sum, s) => {
                        const val = processedData[s]?.[m] || 
                                    processedData[s.toLowerCase()]?.[m] || 
                                    processedData[s.charAt(0).toUpperCase() + s.slice(1)]?.[m] || 0;
                        return sum + val;
                    }, 0);
                    const confidence = Math.min(98, Math.round((totalVolume / (matchingSymptoms.length * 10)) * 100));

                    if (confidence > 30) {
                        results.push({
                            condition: disease.name,
                            confidence: confidence,
                            trigger: `${matchingSymptoms.join(' + ')} detected in ${m}`,
                            severity: disease.severity || 'Medium',
                            month: m,
                            treatment: disease
                        });
                    }
                }
            });
        });
        
        // Sort by confidence and month recital
        return results.sort((a, b) => b.confidence - a.confidence);
    }, [processedData, knowledge, months]);

    const [searchTerm, setSearchTerm] = useState('');
    const filteredDiagnoses = diagnoses.filter(d => 
        d.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.month.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !processedData || !knowledge) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#A5D6A7', borderTopColor: 'transparent' }} />
        </div>
    );

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                        AI <span style={{ color: '#2E7D32' }}>Intelligence</span> Center
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Cross-referencing trends against {knowledge.diseases.length} medical conditions.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Search detected conditions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* AI Insight Generator */}
            <div className="rounded-[2.5rem] p-10 shadow-2xl text-white bg-emerald-950 border border-emerald-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                    </svg>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Large Scale Correlation</h3>
                            <h2 className="text-2xl font-black">AI Observational Analysis</h2>
                        </div>
                        <button 
                            onClick={() => generateRealInsights(processedData)}
                            disabled={generating}
                            className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${generating ? 'bg-emerald-900' : 'bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/40'}`}
                        >
                            {generating ? 'Scanning Library...' : 'Generate Global Insights'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiInsights.length > 0 ? aiInsights.map((insight, i) => (
                            <div key={i} className="px-6 py-5 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors group">
                                <p className="text-sm text-emerald-50/80 group-hover:text-white transition-colors">
                                    <span className="text-emerald-400 font-black mr-2">●</span>
                                    {insight}
                                </p>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center py-10 text-emerald-800 italic">
                                Ready to analyze {knowledge.diseases.length} condition variations...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Diagnosis Cards */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Detected Clinical Correlations ({filteredDiagnoses.length})</h3>
                </div>
                
                {filteredDiagnoses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredDiagnoses.map((d, i) => (
                            <div key={i} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all">
                                <div className="flex flex-col lg:flex-row">
                                    <div className="flex-1 p-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-black text-slate-900">{d.condition}</h3>
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        d.severity === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>{d.severity} Alert</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tight">{d.trigger}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Detected In</span>
                                                <span className="text-xl font-black text-emerald-600">{d.month}</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase text-slate-400">
                                                <span>Diagnostic Match Probability</span>
                                                <span>{d.confidence}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-50 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${d.confidence}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {d.treatment && (
                                        <div className="lg:w-[450px] bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-center">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Immediate Action</p>
                                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{d.treatment.curing}</p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200">
                                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Pharmacology/Therapy</p>
                                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{d.treatment.medicine}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No correlations matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
