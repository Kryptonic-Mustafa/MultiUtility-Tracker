'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Building2, BookOpen, Bus, Layers, ArrowRight, Lock, Sparkles } from 'lucide-react';

const DEFAULT_MODULES = [
  {
    id: 'sms',
    title: 'School Management System (SMS)',
    badge: 'Module #1',
    description: 'Biometric face attendance, student management, faculty dashboard, department hierarchy, and daily reports.',
    icon: 'GraduationCap',
    enabled: true,
    order: 1,
    href: '/sms'
  },
  {
    id: 'hr',
    title: 'HR & Payroll Management',
    badge: 'Module #2',
    description: 'Employee onboarding, salary slip generation, leave approvals, performance evaluations, and tax calculations.',
    icon: 'Briefcase',
    enabled: true,
    order: 2,
    href: '/hr'
  },
  {
    id: 'library',
    title: 'Digital Library System',
    badge: 'Module #3',
    description: 'Book cataloging, barcode scanning, loan tracking, overdue fine calculation, and digital resource access.',
    icon: 'BookOpen',
    enabled: true,
    order: 3,
    href: '/library'
  },
  {
    id: 'hostel',
    title: 'Hostel & Fleet Logistics',
    badge: 'Module #4',
    description: 'Dormitory bed allocation, mess bill management, bus route tracking, and visitor pass issuance.',
    icon: 'Bus',
    enabled: true,
    order: 4,
    href: '/hostel'
  }
];

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const res = await fetch(`http://${host}:8000/api/admin/config`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.modules && Array.isArray(data.modules)) {
            const sorted = [...data.modules].sort((a, b) => a.order - b.order);
            setModules(sorted);
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_MODULES cleanly on network delay or error
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
      case 'Camera':
        return <Camera className="w-6 h-6" />;
      case 'Briefcase':
      case 'Building2':
        return <Building2 className="w-6 h-6" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6" />;
      case 'Bus':
        return <Bus className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Purpose Platform Gateway</span>
        </div>
        <h1 className="text-3xl font-black text-white">Scoped Module Switcher Gateway</h1>
        <p className="text-sm text-gray-400">
          Select an available module below to enter module workspace or register for module access.
        </p>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between group ${
                mod.enabled
                  ? 'border-indigo-500/30 hover:border-indigo-500/70 shadow-xl shadow-indigo-600/10'
                  : 'border-white/10 opacity-60'
              }`}
            >
              {mod.enabled && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all" />
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-2xl border ${
                      mod.enabled
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-gray-800 text-gray-400 border-white/5'
                    }`}
                  >
                    {getIconComponent(mod.icon)}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                      mod.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border-white/5 flex items-center gap-1'
                    }`}
                  >
                    {!mod.enabled && <Lock className="w-3 h-3" />}
                    {mod.badge} • {mod.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3
                  className={`text-xl font-bold mb-2 transition-colors ${
                    mod.enabled ? 'text-white group-hover:text-indigo-300' : 'text-gray-300'
                  }`}
                >
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {mod.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                {mod.enabled ? (
                  <Link
                    href={mod.href || '/sms'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
                  >
                    <span>Enter Module Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="text-xs text-gray-500 font-semibold text-center py-2">
                    Module Disabled by Master Admin
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
