'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Shield, Sparkles } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptId || !deptName) return;

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: deptId,
          dept_name: deptName
        })
      });

      if (res.ok) {
        setDeptId('');
        setDeptName('');
        fetchDepartments();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Department Management
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Institutional Departments</h1>
        <p className="text-xs text-gray-400">Configure academic departments, assign HOD oversight, and view department metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create Department Form */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-5 border border-white/10 h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Add New Department</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Department Code ID *</label>
              <input
                type="text"
                required
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                placeholder="e.g. CSE, ECE, MECH"
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Department Full Name *</label>
              <input
                type="text"
                required
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          </form>
        </div>

        {/* Department List */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : departments.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/10">
              <p className="text-xs text-gray-400">No custom departments created yet. Use the form on the left to add one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((d) => (
                <div key={d.dept_id} className="glass-card rounded-2xl p-5 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-800 text-indigo-300 font-mono">
                      {d.dept_id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{d.dept_name}</h3>
                  <p className="text-xs text-gray-400 mb-3">HOD Assigned: <span className="text-gray-200 font-semibold">{d.hod_id || 'Pending Assignment'}</span></p>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-gray-500 flex justify-between">
                    <span>Active Department</span>
                    <span>Created: {d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
