'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterUserModal from '@/components/RegisterUserModal';
import { UserCheck, UserPlus, Lock, User, ArrowRight, KeyRound, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';

export default function SmsLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login State
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id_or_email: accountId,
          password: password,
          is_admin: false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "SMS Module Login failed");
      }

      localStorage.setItem('multiutility_token', data.token);
      localStorage.setItem('multiutility_user', JSON.stringify(data.user));

      router.push('/sms');

    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try default password 'password'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center relative">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
        
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 mb-3">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">SMS Module Gateway</h2>
          <p className="text-xs text-gray-400 mt-1">School Management & Attendance Kiosk System</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-dark-card/60 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'LOGIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Module Login
          </button>
          
          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setShowRegModal(true);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'REGISTER'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Self Register
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              User ID, Roll Number, or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="STU-1001 or FAC-2001"
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
            <KeyRound className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Default testing password is <strong className="text-white">password</strong></span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <span>{loading ? 'Authenticating...' : 'Enter SMS Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">New Student or Faculty member?</p>
          <button
            onClick={() => setShowRegModal(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register for SMS Module Access
          </button>
        </div>

      </div>

      <RegisterUserModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        onSuccess={() => {
          setTab('LOGIN');
        }}
      />

    </div>
  );
}
