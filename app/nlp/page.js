"use client";
import React, { useState } from 'react';

export default function SmartNotesPage() {
    const [notes, setNotes] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState('');

    const handleExtract = async () => {
        if (!notes.trim()) {
            setError("Please enter some clinical notes first.");
            return;
        }

        setIsExtracting(true);
        setError('');
        setSymptoms([]);

        try {
            const response = await fetch('/api/extract-symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clinicalNotes: notes }),
            });

            const data = await response.json();
            if (response.ok) {
                if (data.symptoms && Array.isArray(data.symptoms)) {
                    setSymptoms(data.symptoms);
                    setPredictions(data.predictions || []);
                } else {
                    setError("Received unexpected format from AI.");
                }
            } else {
                setError(data.error || "Failed to extract symptoms. Check API configuration.");
            }
        } catch (err) {
            setError("An error occurred during extraction.");
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1000px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    Smart <span style={{ color: '#2E7D32' }}>Notes</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Paste raw clinical notes below to automatically extract structured symptoms using AI.</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-5 py-4 rounded-2xl border text-sm font-medium" style={{ background: '#FFEBEE', borderColor: '#FFCDD2', color: '#C62828' }}>
                    {error}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#1a1a2e' }}>Clinical Notes</h3>
                        <textarea
                            className="flex-1 w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[250px]"
                            placeholder="e.g., Patient presented with a mild fever of 100.4°F, a persistent dry cough, and generalized fatigue. Denies nausea or vomiting..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <button
                            onClick={handleExtract}
                            disabled={isExtracting || !notes.trim()}
                            className="mt-6 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            style={{ background: '#2E7D32' }}
                        >
                            {isExtracting ? 'Extracting with AI...' : 'Extract Symptoms'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#1a1a2e' }}>Extracted Symptoms</h3>
                        
                        {symptoms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {symptoms.map((symptom, idx) => (
                                    <span 
                                        key={idx} 
                                        className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                                        style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}
                                    >
                                        {symptom}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4" style={{ background: '#F5F7FA', color: '#9e9e9e' }}>
                                    ✨
                                </div>
                                <p className="text-sm font-medium" style={{ color: '#6b7c8a' }}>No symptoms extracted yet</p>
                                <p className="text-[10px] mt-2 uppercase tracking-widest font-bold" style={{ color: '#9e9e9e' }}>Awaiting Input</p>
                            </div>
                        )}
                        
                        {symptoms.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
                                <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                                    <span className="text-lg">🤖</span> AI Diagnosis Prediction
                                </h3>
                                
                                {predictions.length > 0 ? (
                                    <div className="space-y-4">
                                        {predictions.map((pred, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{pred.disease}</span>
                                                    <span className="text-xs font-black px-2 py-1 rounded-md" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                                        {pred.probability.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="h-2 rounded-full transition-all duration-1000 ease-out" 
                                                        style={{ width: `${pred.probability}%`, background: idx === 0 ? '#2E7D32' : '#66BB6A' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: '#6b7c8a' }}>Analyzing symptoms...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
