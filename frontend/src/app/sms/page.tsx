'use client';

import React, { useState, useEffect } from 'react';
import WebcamFeed from '@/components/WebcamFeed';
import UserCard from '@/components/UserCard';
import UnrecognizedAlertCard from '@/components/UnrecognizedAlertCard';
import RegisterUserModal from '@/components/RegisterUserModal';
import { Camera, UserPlus, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function SmsKioskPage() {
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [cooldown, setCooldown] = useState(false);
  const [timestamp, setTimestamp] = useState<string | undefined>();
  
  const [unrecognizedSnapshot, setUnrecognizedSnapshot] = useState<string | undefined>();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Fetch recent logs
  const fetchRecentLogs = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/attendance/logs?limit=8`);
      if (res.ok) {
        const data = await res.json();
        setRecentLogs(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchRecentLogs();
    const interval = setInterval(fetchRecentLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (data: any) => {
    if (data.status === 'MATCHED') {
      setMatchedUser(data.user);
      setCooldown(data.cooldown);
      setTimestamp(data.timestamp);
      setUnrecognizedSnapshot(undefined);
    }
  };

  const handleUnrecognized = (snapshot: string) => {
    setUnrecognizedSnapshot(snapshot);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Module #1 • SMS Kiosk
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Biometric Attendance Kiosk</h1>
          <p className="text-xs text-gray-400">
            Real-time face detection & instant Cloud database sync for Students, HODs & Staff
          </p>
        </div>

        <button
          onClick={() => {
            setUnrecognizedSnapshot(undefined);
            setShowRegisterModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Person</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Camera Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-3xl p-4 border border-white/10">
            <WebcamFeed
              isActive={!showRegisterModal}
              onStatusUpdate={handleStatusUpdate}
              onUnrecognized={handleUnrecognized}
            />
          </div>

          {/* Unrecognized Person Alert Prompt */}
          {unrecognizedSnapshot && (
            <UnrecognizedAlertCard
              snapshot={unrecognizedSnapshot}
              onRegisterClick={() => setShowRegisterModal(true)}
            />
          )}
        </div>

        {/* Right Column: User Profile Card & Recent Feed */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Matched Profile Card */}
          <UserCard
            user={matchedUser}
            cooldown={cooldown}
            timestamp={timestamp}
          />

          {/* Live Recent Logs Feed */}
          <div className="glass-panel rounded-3xl p-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Live Attendance Stream</h4>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">TiDB Cloud Sync</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No recent logs recorded.</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-card/50 border border-white/5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                        {log.user_role ? log.user_role[0] : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">{log.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{log.user_id} • {log.user_role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        LOGGED
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Registration Modal */}
      <RegisterUserModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        initialSnapshot={unrecognizedSnapshot}
        onSuccess={() => {
          fetchRecentLogs();
          setUnrecognizedSnapshot(undefined);
        }}
      />

    </div>
  );
}
