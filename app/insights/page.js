"use client";
import React, { useEffect, useState } from 'react';

export default function InsightsPage() {
    const [data, setData] = useState(null);
    const [knowledge, setKnowledge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/clinic_insight.json').then(r => r.json()),
            fetch('/medical_knowledge.json').then(r => r.json())
        ]).then(([d, k]) => { setData(d); setKnowledge(k); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data || !knowledge) return (
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

    // AI Diagnosis Rules (Iterate through months to find spikes)
    const diagnoses = [];

    months.forEach(m => {
        // Rule 1: Fever + Cough → Flu (Winter/Early Spring)
        const fever = processedData['Fever']?.[m] || 0;
        const cough = processedData['Cough']?.[m] || 0;
        if (fever >= 15 && cough >= 10) {
            diagnoses.push({
                condition: 'Influenza (Flu)',
                confidence: Math.min(95, Math.round((fever + cough) / 40 * 100)),
                trigger: `High Fever (${fever}) + Cough (${cough}) in ${m}`,
                severity: 'high',
                month: m,
                treatment: knowledge.diseases.find(d => d.id === 'influenza'),
            });
        }

        // Rule 2: Sneezing + Itchy Eyes → Allergy (Spring/Fall)
        const sneeze = processedData['Sneezing']?.[m] || 0;
        const itchy = processedData['Itchy Eyes']?.[m] || 0;
        if (sneeze >= 20 && itchy >= 20) {
            diagnoses.push({
                condition: 'Allergic Rhinitis',
                confidence: Math.min(98, Math.round((sneeze + itchy) / 60 * 100)),
                trigger: `Severe Sneezing (${sneeze}) + Itchy Eyes (${itchy}) in ${m}`,
                severity: 'medium',
                month: m,
                treatment: knowledge.diseases.find(d => d.id === 'allergic-rhinitis'),
            });
        }

        // Rule 3: Fever + Body Ache → Viral Fever
        const feverVal = processedData['Fever']?.[m] || 0;
        const bodyVal = processedData['Body Ache']?.[m] || 0;
        if (feverVal >= 8 && bodyVal >= 5 && !diagnoses.find(d => d.month === m && d.condition === 'Influenza (Flu)')) {
            diagnoses.push({
                condition: 'Viral Fever',
                confidence: Math.min(85, Math.round((feverVal + bodyVal) / 20 * 100)),
                trigger: `Fever (${feverVal}) + Body Ache (${bodyVal}) in ${m}`,
                severity: 'medium',
                month: m,
                treatment: knowledge.diseases.find(d => d.id === 'viral-fever'),
            });
        }
    });

    // Rule 4: Cough + Runny Nose → Common Cold
    const coughTotal = months.reduce((s, m) => s + (processedData['Cough']?.[m] || 0), 0);
    const runnyTotal = months.reduce((s, m) => s + (processedData['Runny Nose']?.[m] || 0), 0);
    if (coughTotal >= 5 && runnyTotal >= 2) {
        diagnoses.push({
            condition: 'Common Cold',
            confidence: Math.min(80, Math.round((coughTotal + runnyTotal) / 12 * 100)),
            trigger: `Cough (${coughTotal}) + Runny Nose (${runnyTotal}) across quarter`,
            severity: 'low',
            month: 'All Months',
            treatment: knowledge.diseases.find(d => d.id === 'common-cold'),
        });
    }

    const aiInsights = [
        "Annual data reveals clear seasonality: Fever peaks in Winter (Dec-Jan), while Allergies dominate Spring (March-May).",
        "Respiratory infections show a strongly cyclical pattern, returning in late Autumn (September).",
        "The highest single-month volume was recorded in April for Sneezing/Allergies.",
        "Treatment stock should be rotated: Stock Antivirals in Nov-Jan and Antihistamines in Feb-May.",
    ];

    // Prediction for upcoming cycle
    const predictions = symptoms.map(s => {
        const lastIdx = months.length - 1;
        const current = processedData[s][months[lastIdx]] || 0;
        const previous = processedData[s][months[lastIdx - 1]] || 0;
        const trend = current - previous;
        const predicted = Math.max(0, Math.round(current + trend));
        return { symptom: s, predicted, direction: trend > 0 ? '↑' : trend < 0 ? '↓' : '→' };
    });

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    AI <span style={{ color: '#2E7D32' }}>Insights</span> & Diagnosis
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Convert data into actionable clinical decisions — This is where analysis becomes medicine.</p>
            </div>

            {/* Diagnosis Cards */}
            <div className="space-y-6 stagger">
                {diagnoses.map((d, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden opacity-0 animate-fade-in">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left: Diagnosis */}
                            <div className="flex-1 p-8 lg:p-10">
                                <div className="flex items-start gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black" style={{ color: '#1a1a2e' }}>{d.condition}</h3>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{
                                                background: d.severity === 'high' ? '#FFEBEE' : d.severity === 'medium' ? '#FFF3E0' : '#E8F5E9',
                                                color: d.severity === 'high' ? '#C62828' : d.severity === 'medium' ? '#E65100' : '#2E7D32'
                                            }}>{d.severity} risk</span>
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: '#6b7c8a' }}>{d.trigger}</p>
                                    </div>
                                </div>

                                {/* Confidence Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9e9e9e' }}>Confidence</span>
                                        <span className="text-sm font-black" style={{ color: '#2E7D32' }}>{d.confidence}%</span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden" style={{ background: '#E8F5E9' }}>
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.confidence}%`, background: '#2E7D32' }} />
                                    </div>
                                </div>

                                <p className="text-xs px-4 py-3 rounded-2xl italic" style={{ background: '#F1F8F4', color: '#6b7c8a' }}>
                                    Detected in: <strong>{d.month}</strong>
                                </p>
                            </div>

                            {/* Right: Treatment */}
                            {d.treatment && (
                                <div className="lg:w-96 p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-gray-100" style={{ background: '#F1F8F4' }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#2E7D32' }}>Recommended Protocol</p>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: '#9e9e9e' }}>Treatment</p>
                                            <p className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{d.treatment.curing}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: '#9e9e9e' }}>Medicine</p>
                                            <p className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{d.treatment.medicine}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insight Generator */}
            <div className="rounded-3xl p-8 lg:p-10 shadow-lg text-white" style={{ background: '#1a1a2e' }}>
                <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: '#66BB6A' }}>AI Insight Generator</h3>
                <div className="space-y-4 stagger">
                    {aiInsights.map((insight, i) => (
                        <div key={i} className="px-5 py-4 rounded-2xl text-sm font-medium opacity-0 animate-fade-in" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>
                            {insight}
                        </div>
                    ))}
                </div>
            </div>

            {/* April Prediction */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#1a1a2e' }}>Next Month Prediction (April 2026)</h3>
                <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Based on linear trend extrapolation from Jan-Mar data</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 stagger">
                    {predictions.map((p, i) => {
                        const color = p.direction === '↑' ? '#E53935' : p.direction === '↓' ? '#2E7D32' : '#9e9e9e';
                        return (
                            <div key={i} className="text-center p-5 rounded-2xl border border-gray-100 opacity-0 animate-fade-in hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold mb-2" style={{ color: '#6b7c8a' }}>{p.symptom}</p>
                                <p className="text-3xl font-black" style={{ color }}>{p.direction}</p>
                                <p className="text-lg font-black mt-1" style={{ color: '#1a1a2e' }}>~{p.predicted}</p>
                                <p className="text-xs font-bold" style={{ color: '#6b7c8a' }}>predicted</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
