"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Dashboard', desc: 'Overview' },
    { href: '/analysis', label: 'Analysis', desc: 'Symptom Deep Dive' },
    { href: '/trends', label: 'Trends', desc: 'Patterns & Spikes' },
    { href: '/insights', label: 'AI Insights', desc: 'Diagnosis Engine' },
    { href: '/upload', label: 'Upload', desc: 'Import Data' },
    { href: '/reports', label: 'Reports', desc: 'Export PDF' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex w-72 bg-white/40 backdrop-blur-2xl border-r border-white/60 flex-col sticky top-0 h-screen z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {/* Branding */}
            <div className="p-6 border-b border-white/40">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform bg-gradient-to-br from-emerald-500 to-teal-700">
                        <span className="text-white font-black text-2xl">+</span>
                    </div>
                    <div>
                        <span className="text-base font-black tracking-tight block leading-none text-slate-800">
                            Medikly
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 block text-emerald-600">
                            Data Science Hub
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] px-3 mb-4" style={{ color: '#9e9e9e' }}>Menu</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-gradient-to-r from-emerald-500/10 to-transparent shadow-sm border-l-4 border-emerald-500'
                                : 'hover:bg-white/50 border-l-4 border-transparent'
                                }`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>{item.label}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                            </div>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 rounded-full animate-pulse blur-[1px] bg-emerald-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
