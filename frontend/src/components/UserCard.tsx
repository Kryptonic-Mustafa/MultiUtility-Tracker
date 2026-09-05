'use client';

import React from 'react';
import { UserCheck, ShieldCheck, Award, Clock, Sparkles } from 'lucide-react';

interface UserCardProps {
  user: {
    user_id: string;
    name: string;
    role: string;
    dept_id?: string;
    confidence?: number;
    distance?: number;
  } | null;
  cooldown?: boolean;
  timestamp?: string;
}

export default function UserCard({ user, cooldown, timestamp }: UserCardProps) {
  if (!user) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Camera Kiosk Active</h4>
        <p className="text-xs text-gray-400 max-w-xs">
          Stand in front of the camera stream to scan biometrics & log attendance instantly.
        </p>
      </div>
    );
  }

  const getRoleBadgeStyle = (roleStr: string) => {
    switch (roleStr?.toUpperCase()) {
      case 'STUDENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'HOD':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'TEACHER':
      case 'SUB_TEACHER':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="glass-panel border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in duration-200">
      
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getRoleBadgeStyle(user.role)}`}>
          {user.role}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{cooldown ? 'Already Logged' : 'Attendance Logged'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-[1.5px] flex-shrink-0 shadow-lg">
          <div className="w-full h-full bg-dark-card rounded-[14px] flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
          <p className="text-xs font-mono text-indigo-400">ID: {user.user_id}</p>
          {user.dept_id && (
            <p className="text-xs text-gray-400">Dept: <span className="text-gray-200 font-medium">{user.dept_id}</span></p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Confidence: <strong className="text-white">{(user.confidence ? user.confidence * 100 : 95).toFixed(1)}%</strong></span>
        </div>
        <div className="flex items-center gap-2 text-gray-300 justify-end">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Just Now'}</span>
        </div>
      </div>

    </div>
  );
}
