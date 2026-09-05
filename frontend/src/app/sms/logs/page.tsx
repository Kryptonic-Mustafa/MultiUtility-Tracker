'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Filter, Search, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `http://${window.location.hostname}:8000/api/attendance/logs?limit=100`;
      if (roleFilter) url += `&role=${roleFilter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [roleFilter]);

  const filtered = logs.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Attendance Log Inspector
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Biometric Log History</h1>
        <p className="text-xs text-gray-400">Historical & real-time log records synced directly with TiDB Cloud MySQL</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or user ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-indigo-400 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-dark-card/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students Only</option>
            <option value="TEACHER">Teachers Only</option>
            <option value="HOD">HODs Only</option>
            <option value="STAFF">Staff Only</option>
          </select>
        </div>

      </div>

      {/* Log Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            No attendance records found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase font-mono border-b border-white/10 text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">User / Person</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Entry Type</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Device Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    
                    <td className="py-3.5 px-6 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                          {log.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold">{log.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{log.user_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {log.user_role}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.entry_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-mono text-gray-200">
                      {(log.confidence_score ? log.confidence_score * 100 : 95).toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-6 text-gray-400 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono text-gray-400">
                      {log.device_info}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
