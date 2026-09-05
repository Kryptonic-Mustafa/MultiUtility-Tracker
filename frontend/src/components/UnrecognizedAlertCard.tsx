'use client';

import React from 'react';
import { UserX, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

interface UnrecognizedAlertCardProps {
  snapshot?: string;
  onRegisterClick: () => void;
}

export default function UnrecognizedAlertCard({ snapshot, onRegisterClick }: UnrecognizedAlertCardProps) {
  return (
    <div className="glass-panel border-l-4 border-amber-500 rounded-2xl p-5 shadow-2xl relative overflow-hidden animate-pulse-subtle">
      <div className="flex items-start gap-4">
        
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-900 border border-amber-500/30 flex-shrink-0">
          {snapshot ? (
            <img src={snapshot} alt="Unrecognized Face" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-500/10">
              <UserX className="w-8 h-8 text-amber-400" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <h4 className="text-sm font-bold text-amber-400 tracking-wide uppercase">
              User Data Not Found
            </h4>
          </div>

          <p className="text-xs text-gray-300 font-medium leading-relaxed mb-3">
            An unregistered person was detected in front of the camera. Register their face now to add them to the database.
          </p>

          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Person Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
