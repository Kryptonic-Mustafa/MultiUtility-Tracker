'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Shield, Building2, BookOpen, Layers, ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function ModulesPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Enterprise Utility System</span>
        </div>
        <h1 className="text-3xl font-black text-white">Scoped Module Switcher Gateway</h1>
        <p className="text-sm text-gray-400">
          Select an authorized module to open your institutional workspace.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: SMS */}
        <Link href="/sms" className="group">
          <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 group-hover:border-indigo-500/60 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between group-hover:scale-[1.02] shadow-xl shadow-indigo-600/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Module #1
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                School Management System (SMS)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Real-time biometric attendance kiosk, student/faculty directories, department analytics, and 1-click registration.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Launch Module Workspace</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Module 2: HR & Payroll (Future) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 opacity-70 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gray-800 text-gray-400">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-800 text-gray-400 border border-white/5">
                <Lock className="w-3 h-3" />
                Future Scope
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-300 mb-2">HR & Payroll Utility</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Faculty salary computation, leave management, overtime logging, and payroll distribution.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 text-xs text-gray-500 font-semibold">
            Admin Entitlement Pending
          </div>
        </div>

        {/* Module 3: Library & Assets (Future) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 opacity-70 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gray-800 text-gray-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-800 text-gray-400 border border-white/5">
                <Lock className="w-3 h-3" />
                Future Scope
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-300 mb-2">Asset & Library System</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Digital book checkout, lab equipment tracking, and inventory barcode/biometric verification.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 text-xs text-gray-500 font-semibold">
            Admin Entitlement Pending
          </div>
        </div>

      </div>

    </div>
  );
}
