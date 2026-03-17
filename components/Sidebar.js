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
        <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen z-40 shadow-sm">
            {/* Branding */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ background: '#2E7D32' }}>
                        <span className="text-white font-black text-2xl">+</span>
                    </div>
                    <div>
                        <span className="text-base font-black tracking-tight block leading-none" style={{ color: '#1a1a2e' }}>
                            ClinicPulse
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 block" style={{ color: '#2E7D32' }}>
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive
                                ? 'shadow-md'
                                : 'hover:bg-gray-50'
                                }`}
                            style={isActive ? { background: '#E8F5E9', color: '#2E7D32' } : {}}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isActive ? '' : 'text-gray-700'}`}>{item.label}</span>
                                <span className="text-[10px] text-gray-400">{item.desc}</span>
                            </div>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 rounded-full animate-pulse-glow" style={{ background: '#2E7D32' }} />
                            )}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
