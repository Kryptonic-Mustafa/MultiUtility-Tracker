'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Shield, Building2, BookOpen, Layers, ArrowRight, Lock, Sparkles, UserCheck } from 'lucide-react';

export default function ModulesPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* Module 1: SMS */}
        <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between group shadow-xl shadow-indigo-600/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Camera className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Module #1 • Active
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              School Management System (SMS)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Biometric Attendance Kiosk, Student & Faculty Directory, Department Analytics, and self-registration.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <Link
              href="/sms/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>SMS Module Login & Self-Register</span>
            </Link>

            <Link
              href="/sms"
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
            >
              <span>Open Attendance Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 2: HR & Payroll (Future Scope) */}
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

        {/* Module 3: Library & Assets (Future Scope) */}
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
