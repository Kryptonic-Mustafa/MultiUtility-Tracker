'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Layers, KeyRound, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [resStu, resFac] = await Promise.all([
        fetch(`http://${window.location.hostname}:8000/api/students`),
        fetch(`http://${window.location.hostname}:8000/api/faculty`)
      ]);

      let allUsers: any[] = [];
      if (resStu.ok) {
        const data = await resStu.json();
        allUsers = [...allUsers, ...data.map((d: any) => ({ ...d, role: 'STUDENT' }))];
      }
      if (resFac.ok) {
        const data = await resFac.json();
        allUsers = [...allUsers, ...data];
      }
      setUsers(allUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            System Administration
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Central Admin & Module Entitlements Portal</h1>
        <p className="text-xs text-gray-400">
          Manage system accounts stored in regular <code className="text-indigo-400">users</code> table separate from <code className="text-purple-400">admins</code> table
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">System Accounts</span>
          </div>
          <p className="text-2xl font-black text-white">{users.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Students, Faculty & Staff</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Module Scopes</span>
          </div>
          <p className="text-2xl font-black text-white">1 Active (SMS)</p>
          <p className="text-[11px] text-gray-400 mt-1">Module 1 enabled</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Default Credentials</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">password</p>
          <p className="text-[11px] text-gray-400 mt-1">Universal testing password</p>
        </div>

      </div>

      {/* Accounts List */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered System Accounts</h3>
          <span className="text-xs text-gray-400">TiDB Cloud MySQL</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            No system user accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase font-mono border-b border-white/10 text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">User ID</th>
                  <th className="py-3.5 px-6">Full Name</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Granted Modules</th>
                  <th className="py-3.5 px-6 text-right">Biometric Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-indigo-400 font-bold">{u.user_id}</td>
                    <td className="py-3.5 px-6 font-semibold text-white">{u.name}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-300">{u.dept_id || 'CSE'}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SMS (Module #1)
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-medium text-emerald-400">
                      Active
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
