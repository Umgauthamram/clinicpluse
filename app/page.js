"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [knowledge, setKnowledge] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/clinic_insight.json').then(res => res.json()),
      fetch('/medical_knowledge.json').then(res => res.json())
    ]).then(([d, k]) => {
      setData(d);
      setKnowledge(k);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  const symptoms = useMemo(() => processedData ? Object.keys(processedData) : [], [processedData]);
  const monthsOrder = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const months = useMemo(() => {
    if (!processedData) return [];
    return monthsOrder.filter(m =>
      symptoms.some(s => processedData[s][m] !== undefined)
    );
  }, [processedData, symptoms, monthsOrder]);

  useEffect(() => {
    if (symptoms.length > 0 && selectedSymptoms.length === 0) {
      setSelectedSymptoms(symptoms.slice(0, 3));
    }
  }, [symptoms]);

  const nextMonthPrediction = useMemo(() => {
    if (!processedData || !knowledge || months.length === 0) {
      return { disease: "Calculating...", symptom: "Analyzing", probability: "...", advice: "Scanning historical data..." };
    }
    
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2] || lastMonth;
    
    const projectedSymptoms = {};
    symptoms.forEach(s => {
      const current = processedData[s][lastMonth] || 0;
      const previous = processedData[s][prevMonth] || 0;
      const trend = current - previous;
      projectedSymptoms[s] = Math.max(0, Math.round(current + (trend * 1.5)));
    });

    let bestMatch = { disease: "Undetermined", score: 0, symptom: "Mixed", advice: "Maintain general hygiene." };

    knowledge.diseases.forEach(d => {
      const matchScore = d.symptoms.reduce((score, s) => {
        return score + (projectedSymptoms[s] || 0) + (projectedSymptoms[s.toLowerCase()] || 0);
      }, 0);

      if (matchScore > bestMatch.score) {
        bestMatch = {
          disease: d.name,
          score: matchScore,
          symptom: d.symptoms[0],
          advice: `Likely ${d.name} surge. Recommended: ${d.curing.split(',')[0]}.`
        };
      }
    });

    return {
      disease: bestMatch.disease,
      symptom: bestMatch.symptom,
      probability: bestMatch.score > 30 ? "Critical" : "Moderate",
      advice: bestMatch.advice
    };
  }, [processedData, months, symptoms, knowledge]);

  if (loading || !processedData) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#A5D6A7', borderTopColor: 'transparent' }} />
    </div>
  );

  const monthlyTotals = months.map(m => ({
    month: m.slice(0, 3),
    fullMonth: m,
    total: symptoms.reduce((sum, s) => sum + (processedData[s][m] || 0), 0)
  }));

  const totalCases = monthlyTotals.reduce((s, m) => s + m.total, 0);
  const topSymptomName = symptoms.map(s => ({
    name: s,
    total: months.reduce((sum, m) => sum + (processedData[s][m] || 0), 0)
  })).sort((a, b) => b.total - a.total)[0]?.name || "...";

  const colors = ['#2E7D32', '#66BB6A', '#A5D6A7', '#42A5F5', '#FFA726', '#E53935', '#AB47BC'];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
            Health <span style={{ color: '#2E7D32' }}>Intelligence</span> Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Advanced clinical monitoring and predictive analytics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2E7D32' }} />
          AI Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Cases</p>
          <p className="text-4xl font-black mt-2 text-emerald-600">{totalCases}</p>
          <p className="text-xs mt-2 text-slate-400">Past {months.length} Months</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dominant Symptom</p>
          <p className="text-2xl font-black mt-2 text-slate-800">{topSymptomName}</p>
          <p className="text-xs mt-2 text-slate-400">Primary complaint</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Peak Month</p>
          <p className="text-2xl font-black mt-2 text-slate-800">{monthlyTotals.sort((a, b) => b.total - a.total)[0]?.fullMonth || "..."}</p>
          <p className="text-xs mt-2 text-slate-400">Max volume detected</p>
        </div>
        <div className="rounded-3xl p-6 shadow-lg text-white relative overflow-hidden bg-emerald-700">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20 bg-emerald-400" />
          <p className="text-xs font-black uppercase tracking-widest opacity-70">Next Month Forecast</p>
          <p className="text-2xl font-black mt-2 leading-tight">{nextMonthPrediction.disease}</p>
          <p className="text-xs mt-2 opacity-80">{nextMonthPrediction.advice}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-wider mb-6 text-slate-800">Total Patient Volume</h3>
          <MuiBarChart
            xAxis={[{ scaleType: 'band', data: monthlyTotals.map(d => d.month) }]}
            series={[{ data: monthlyTotals.map(d => d.total), color: '#2E7D32', label: 'Cases' }]}
            height={320}
            slotProps={{ legend: { hidden: true } }}
          />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Detailed Symptom Trends</h3>
            <div className="flex flex-wrap gap-2">
              {symptoms.slice(0, 5).map(s => (
                <button 
                  key={s}
                  onClick={() => {
                    setSelectedSymptoms(prev => 
                      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    selectedSymptoms.includes(s) 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <MuiLineChart
            xAxis={[{ scaleType: 'point', data: months.map(m => m.slice(0, 3)) }]}
            series={selectedSymptoms.map((s, i) => ({
              data: months.map(m => processedData[s][m] || 0),
              label: s,
              color: colors[i % colors.length],
              showMark: true,
              curve: "catmullRom"
            }))}
            height={320}
            slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: -10 } }}
          />
        </div>
      </div>
    </div>
  );
}
