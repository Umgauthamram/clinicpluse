"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/clinic_insight.json')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
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

  // Total cases per month
  const monthlyTotals = months.map(m => ({
    month: m.slice(0, 3),
    fullMonth: m,
    total: symptoms.reduce((sum, s) => sum + (processedData[s][m] || 0), 0)
  }));

  // Total cases overall
  const totalCases = monthlyTotals.reduce((s, m) => s + m.total, 0);

  // Most common symptom overall
  const symptomTotals = symptoms.map(s => ({
    name: s,
    total: months.reduce((sum, m) => sum + (processedData[s][m] || 0), 0)
  })).sort((a, b) => b.total - a.total);

  const topSymptom = symptomTotals[0];

  // Line chart data
  const lineData = months.map(m => {
    const point = { month: m.slice(0, 3) };
    symptoms.forEach(s => { point[s] = processedData[s][m] || 0; });
    return point;
  });

  // Trend detection (comparing first and last detected months)
  const firstM = months[0];
  const lastM = months[months.length - 1];
  const trends = symptoms.map(s => {
    const startVal = processedData[s][firstM] || 0;
    const endVal = processedData[s][lastM] || 0;
    const diff = endVal - startVal;
    return { symptom: s, startVal, endVal, diff, direction: diff > 0 ? '↑' : diff < 0 ? '↓' : '→' };
  }).filter(t => t.diff !== 0).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  // Alerts
  const alerts = [];
  if ((processedData['Itchy Eyes']?.['February'] || 0) >= 5 && (processedData['Sneezing']?.['February'] || 0) >= 5) {
    alerts.push({ type: 'warning', msg: 'Allergy spike detected in February (Itchy Eyes + Sneezing)' });
  }
  if ((processedData['Fever']?.['January'] || 0) >= 7) {
    alerts.push({ type: 'danger', msg: 'Fever outbreak in January — Possible Flu season onset' });
  }
  if ((processedData['Fever']?.['March'] || 0) >= 4) {
    alerts.push({ type: 'info', msg: 'Fever persists in March — Monitor for viral resurgence' });
  }
  if ((processedData['Cough']?.['January'] || 0) >= 4) {
    alerts.push({ type: 'info', msg: 'Cough consistently high — Common respiratory concern' });
  }

  const colors = ['#2E7D32', '#66BB6A', '#A5D6A7', '#42A5F5', '#FFA726', '#E53935', '#AB47BC'];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            Dashboard <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Overview</span>
          </h1>
          <p className="text-sm mt-2 text-slate-500 font-medium">Quick overview for doctors — Total cases, trends, and alerts</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 backdrop-blur-sm border border-emerald-500/20 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          Live Monitoring Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 opacity-0 animate-fade-in hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)] transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Cases</p>
          <p className="text-4xl font-black mt-3 animate-count bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-600">{totalCases}</p>
          <p className="text-xs mt-3 text-slate-500 font-medium">Across Jan-Mar 2026</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 opacity-0 animate-fade-in hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Symptom</p>
          <p className="text-2xl font-black mt-3 text-slate-700">{topSymptom.name}</p>
          <p className="text-xs mt-3 text-slate-500 font-medium">{topSymptom.total} reported cases</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 opacity-0 animate-fade-in hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peak Month</p>
          <p className="text-2xl font-black mt-3 text-slate-700">{monthlyTotals.sort((a, b) => b.total - a.total)[0].fullMonth}</p>
          <p className="text-xs mt-3 text-slate-500 font-medium">{monthlyTotals.sort((a, b) => b.total - a.total)[0].total} cases logged</p>
        </div>
        <div className="rounded-3xl p-6 shadow-[0_10px_40px_rgba(5,150,105,0.4)] text-white relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl mix-blend-overlay" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">Symptoms Tracked</p>
          <p className="text-4xl font-black mt-3">{symptoms.length}</p>
          <p className="text-xs mt-3 text-white/80 font-medium">Active monitoring</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#1a1a2e' }}>Active Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
            {alerts.map((a, i) => (
              <div key={i} className="px-5 py-4 rounded-2xl border text-sm font-medium opacity-0 animate-fade-in"
                style={{
                  background: a.type === 'danger' ? '#FFEBEE' : a.type === 'warning' ? '#FFF3E0' : '#E8F5E9',
                  borderColor: a.type === 'danger' ? '#FFCDD2' : a.type === 'warning' ? '#FFE0B2' : '#C8E6C9',
                  color: a.type === 'danger' ? '#C62828' : a.type === 'warning' ? '#E65100' : '#2E7D32'
                }}>
                {a.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart — Cases per Month */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none" />
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">Total Cases Per Month</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">Aggregated symptom volume</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTotals.sort((a, b) => months.indexOf(a.fullMonth) - months.indexOf(b.fullMonth))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(203,213,225,0.2)' }} contentStyle={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — Symptom Trends */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none" />
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">Symptom Trends</h3>
          <p className="text-xs mb-6 text-slate-400 font-medium">Progression of each symptom</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              {symptoms.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">Trend Summary ({months[0]} → {months[months.length - 1]})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 stagger relative z-10">
          {symptoms.map((s, i) => {
            const t = trends.find(tr => tr.symptom === s);
            const startVal = processedData[s][months[0]] || 0;
            const endVal = processedData[s][months[months.length - 1]] || 0;
            const dir = t ? t.direction : '→';
            const color = dir === '↑' ? '#ef4444' : dir === '↓' ? '#10b981' : '#94a3b8';
            return (
              <div key={s} className="text-center p-5 rounded-2xl bg-white/50 border border-white/80 opacity-0 animate-fade-in hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
                <p className="text-xs font-bold mb-2 text-slate-500 truncate" title={s}>{s}</p>
                <p className="text-3xl font-black" style={{ color }}>{dir}</p>
                <p className="text-xs font-bold mt-2 text-slate-700">{startVal} → {endVal}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
