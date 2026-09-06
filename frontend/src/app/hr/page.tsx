'use client';

import React, { useState } from 'react';
import { 
  Briefcase, Users, DollarSign, Calendar, FileText, Plus, Search, 
  CheckCircle2, Clock, XCircle, ArrowUpRight, TrendingUp, Sparkles, Building2, Download
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function HrWorkspacePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'PAYROLL' | 'LEAVES'>('EMPLOYEES');
  const [search, setSearch] = useState('');

  // Sample HR Data
  const [employees, setEmployees] = useState([
    { id: 'EMP-101', name: 'Dr. Sarah Jenkins', dept: 'CSE', designation: 'Senior Professor', salary: '$8,500', status: 'Active' },
    { id: 'EMP-102', name: 'Marcus Vance', dept: 'ECE', designation: 'Assistant Professor', salary: '$6,200', status: 'Active' },
    { id: 'EMP-103', name: 'Elena Rostova', dept: 'MECH', designation: 'Lab Administrator', salary: '$4,800', status: 'On Leave' },
    { id: 'EMP-104', name: 'Robert Chen', dept: 'CIVIL', designation: 'Associate Professor', salary: '$7,100', status: 'Active' },
  ]);

  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'LV-501', empName: 'Elena Rostova', type: 'Medical Leave', dates: 'Sep 05 - Sep 10', days: 5, status: 'Approved' },
    { id: 'LV-502', empName: 'Marcus Vance', type: 'Casual Leave', dates: 'Sep 12 - Sep 14', days: 2, status: 'Pending' },
    { id: 'LV-503', empName: 'Dr. Sarah Jenkins', type: 'Conference Travel', dates: 'Sep 20 - Sep 22', days: 3, status: 'Pending' }
  ]);

  const handleAction = (msg: string) => {
    showToast(msg, 'success', 'HR Action Completed');
  };

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(leaveRequests.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    showToast(`Leave request ${id} approved successfully!`, 'success', 'Leave Approved');
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-r from-[#0d1527] via-[#15102a] to-[#1a0c2e] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>Module #2 Workspace (module_hr)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            HR & Payroll Governance System
          </h1>
          <p className="text-xs text-gray-400 max-w-xl mt-1">
            Manage employee onboarding, generate monthly salary slips, authorize leave approvals, and review department headcount metrics.
          </p>
        </div>

        <button
          onClick={() => handleAction('Opening Employee Onboarding Modal...')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 hover:opacity-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Onboard New Employee
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Employees</div>
            <div className="text-xl font-black text-white">148 Staff</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Monthly Payroll</div>
            <div className="text-xl font-black text-white">$842,500</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Pending Leaves</div>
            <div className="text-xl font-black text-white">2 Requests</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Retention Rate</div>
            <div className="text-xl font-black text-white">98.4%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'EMPLOYEES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Directory ({filteredEmployees.length})
        </button>

        <button
          onClick={() => setActiveTab('PAYROLL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'PAYROLL'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Payroll & Salary Slips
        </button>

        <button
          onClick={() => setActiveTab('LEAVES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'LEAVES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Leave Approvals
        </button>
      </div>

      {/* TAB 1: EMPLOYEES */}
      {activeTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff by ID, Name or Dept..."
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0f172a] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">{emp.id}</td>
                    <td className="py-3 px-4 font-bold text-white">{emp.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {emp.dept}
                      </span>
                    </td>
                    <td className="py-3 px-4">{emp.designation}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{emp.salary}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAction(`Generating Payslip for ${emp.name}...`)}
                        className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all"
                      >
                        Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYROLL */}
      {activeTab === 'PAYROLL' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Monthly Payroll Calculations & Slip Generator
            </h3>
            <button
              onClick={() => handleAction('Exporting Payroll Report PDF...')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Salary Slips Batch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 space-y-2">
              <div className="text-xs text-gray-400 font-bold">Base Basic Salaries</div>
              <div className="text-2xl font-black text-white">$620,000</div>
              <p className="text-[11px] text-gray-500">Fixed contractual salaries</p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 space-y-2">
              <div className="text-xs text-gray-400 font-bold">Allowances & Bonuses</div>
              <div className="text-2xl font-black text-emerald-400">+$242,500</div>
              <p className="text-[11px] text-gray-500">Research grants & overtime</p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 space-y-2">
              <div className="text-xs text-gray-400 font-bold">Tax Deductions & Benefits</div>
              <div className="text-2xl font-black text-rose-400">-$20,000</div>
              <p className="text-[11px] text-gray-500">Standard statutory tax holding</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVES */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0f172a] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">{req.id}</td>
                    <td className="py-3 px-4 font-bold text-white">{req.empName}</td>
                    <td className="py-3 px-4">{req.type}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{req.dates}</td>
                    <td className="py-3 px-4 font-bold">{req.days} days</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleApproveLeave(req.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition-all"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-gray-500 text-[11px] font-semibold">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
