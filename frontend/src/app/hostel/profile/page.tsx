'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Home, Mail, Phone, Building2, CheckCircle2, ArrowLeft, Key, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function HostelProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('multiutility_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between glass-panel rounded-3xl p-6 border border-emerald-500/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Module #4 • Hostel Governance Profile
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">Hostel Residency & Security Clearance</h1>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Left */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-600 p-1 shadow-xl shadow-emerald-950/50">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 flex items-center justify-center">
              {currentUser?.profile_image_url ? (
                <img src={currentUser.profile_image_url} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-emerald-400" />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{currentUser?.name || 'Mustafa Chhabrawala'}</h2>
            <p className="text-xs text-emerald-300 font-mono mt-0.5">{currentUser?.user_id || 'HST-503'}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Home className="w-3 h-3" />
              <span>{currentUser?.role || 'HOSTEL_WARDEN'}</span>
            </div>
          </div>
        </div>

        {/* Hostel Profile Details Right */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-6">
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" />
              Residential Block & Gate Pass Allocation
            </h3>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Residency Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> Resident Email
              </p>
              <p className="text-xs font-semibold text-white truncate">{currentUser?.email || 'mustafa@gmail.com'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Number
              </p>
              <p className="text-xs font-semibold text-white">{currentUser?.phone || '+91 9876543210'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Hostel Block
              </p>
              <p className="text-xs font-semibold text-emerald-300">{currentUser?.dept_id || 'Block A - Warden Wing'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Room Key Code
              </p>
              <p className="text-xs font-semibold text-emerald-400">A-402 (Master Access Key)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Biometric Gate Access & Late Night Pass Clearance</span>
            </div>
            <span className="text-[11px] font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg shadow">
              Clear Pass
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
