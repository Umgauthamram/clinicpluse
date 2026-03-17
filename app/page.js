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
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
            Dashboard <span style={{ color: '#2E7D32' }}>Overview</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Quick overview for doctors — Total cases, trends, and alerts</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2E7D32' }} />
          Live Monitoring Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fade-in">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#6b7c8a' }}>Total Cases</p>
          <p className="text-4xl font-black mt-2 animate-count" style={{ color: '#2E7D32' }}>{totalCases}</p>
          <p className="text-xs mt-2" style={{ color: '#6b7c8a' }}>Across Jan-Mar 2026</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fade-in">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#6b7c8a' }}>Top Symptom</p>
          <p className="text-2xl font-black mt-2" style={{ color: '#1a1a2e' }}>{topSymptom.name}</p>
          <p className="text-xs mt-2" style={{ color: '#6b7c8a' }}>{topSymptom.total} reported cases</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fade-in">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#6b7c8a' }}>Peak Month</p>
          <p className="text-2xl font-black mt-2" style={{ color: '#1a1a2e' }}>{monthlyTotals.sort((a, b) => b.total - a.total)[0].fullMonth}</p>
          <p className="text-xs mt-2" style={{ color: '#6b7c8a' }}>{monthlyTotals.sort((a, b) => b.total - a.total)[0].total} cases logged</p>
        </div>
        <div className="rounded-3xl p-6 shadow-lg text-white relative overflow-hidden" style={{ background: '#2E7D32' }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20" style={{ background: '#A5D6A7' }} />
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#A5D6A7' }}>Symptoms Tracked</p>
          <p className="text-4xl font-black mt-2">{symptoms.length}</p>
          <p className="text-xs mt-2 text-white/70">Active monitoring</p>
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
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>Total Cases Per Month</h3>
          <p className="text-xs" style={{ color: '#6b7c8a' }}>Aggregated symptom volume by month</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTotals.sort((a, b) => months.indexOf(a.fullMonth) - months.indexOf(b.fullMonth))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="total" fill="#2E7D32" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — Symptom Trends */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: '#1a1a2e' }}>Symptom Trends Over Time</h3>
          <p className="text-xs mb-6" style={{ color: '#6b7c8a' }}>Monthly progression of each symptom</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
              {symptoms.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: '#1a1a2e' }}>Trend Summary ({months[0]} → {months[months.length - 1]})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 stagger">
          {symptoms.map((s, i) => {
            const t = trends.find(tr => tr.symptom === s);
            const startVal = processedData[s][months[0]] || 0;
            const endVal = processedData[s][months[months.length - 1]] || 0;
            const dir = t ? t.direction : '→';
            const color = dir === '↑' ? '#E53935' : dir === '↓' ? '#2E7D32' : '#9e9e9e';
            return (
              <div key={s} className="text-center p-4 rounded-2xl border border-gray-100 opacity-0 animate-fade-in hover:shadow-md transition-shadow">
                <p className="text-xs font-bold mb-2" style={{ color: '#6b7c8a' }}>{s}</p>
                <p className="text-2xl font-black" style={{ color }}>{dir}</p>
                <p className="text-xs font-black mt-2" style={{ color: '#1a1a2e' }}>{startVal} → {endVal}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
