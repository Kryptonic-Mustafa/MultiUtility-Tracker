'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Layers, Database, Users, Settings, CheckCircle2, XCircle, 
  Edit3, Trash2, Plus, ArrowUp, ArrowDown, Save, Search, Lock, 
  Sparkles, RefreshCw, Eye, AlertTriangle, KeyRound, Server, LogOut
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function MasterAdminPage() {
  const router = useRouter();
  const { showToast, confirmAction } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<'MODULES' | 'DATABASE' | 'USERS' | 'SETTINGS'>('MODULES');

  // Module Config State
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Database Inspector State
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [dbSearch, setDbSearch] = useState('');

  // Row Edit Modal State
  const [editRow, setEditRow] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingRow, setSavingRow] = useState(false);

  // Auth Check for Master Admin
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('master_admin_session');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.is_admin || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')) {
          setCurrentUser(u);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          window.location.href = '/admin/login';
        }
      } catch (e) {
        setIsAuthorized(false);
        window.location.href = '/admin/login';
      }
    } else {
      setIsAuthorized(false);
      window.location.href = '/admin/login';
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    confirmAction({
      title: 'Confirm Admin Logout',
      message: 'Are you sure you want to log out from Master Admin Panel?',
      confirmText: 'Logout Admin',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'logout',
      onConfirm: () => {
        localStorage.removeItem('master_admin_session');
        localStorage.removeItem('master_admin_token');
        showToast('Logged out from Master Admin Panel', 'info', 'Admin Logout');
        window.location.href = '/admin/login';
      }
    });
  };

  // Fetch Config
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error('Error fetching config:', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Fetch Tables List
  const fetchTables = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/tables`);
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (e) {
      console.error('Error fetching tables:', e);
    }
  };

  // Fetch Table Data
  const fetchTableData = async (tableName: string) => {
    setLoadingTable(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/table-data?table_name=${tableName}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (e) {
      console.error('Error fetching table data:', e);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchTables();
  }, []);

  useEffect(() => {
    if (activeTab === 'DATABASE' || activeTab === 'USERS') {
      fetchTableData(selectedTable);
    }
  }, [activeTab, selectedTable]);

  // Handle Module Toggle & Ordering
  const handleToggleModule = (moduleId: string) => {
    if (!config) return;
    const updatedModules = config.modules.map((m: any) =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    );
    const updatedConfig = { ...config, modules: updatedModules };
    setConfig(updatedConfig);
  };

  const handleMoveModule = (index: number, direction: 'UP' | 'DOWN') => {
    if (!config) return;
    const newModules = [...config.modules];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;

    const temp = newModules[index];
    newModules[index] = newModules[targetIndex];
    newModules[targetIndex] = temp;

    // Update order indexes
    newModules.forEach((m, idx) => (m.order = idx + 1));

    setConfig({ ...config, modules: newModules });
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        showToast('System configuration saved successfully!', 'success', 'Config Saved');
      } else {
        showToast('Failed to save configuration', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error saving configuration', 'error');
    }
  };

  // Row Edit & Delete Handlers
  const handleOpenEditRow = (row: any) => {
    setEditRow(row);
    setEditFormData({ ...row });
  };

  const handleSaveRow = async () => {
    if (!editRow) return;
    setSavingRow(true);
    try {
      const keyField = selectedTable === 'attendance_logs' ? 'id' : selectedTable === 'departments' ? 'dept_id' : 'user_id';
      const keyValue = editRow[keyField];

      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/table-data/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_name: selectedTable,
          key_field: keyField,
          key_value: keyValue,
          data: editFormData
        })
      });

      if (res.ok) {
        showToast(`Record in ${selectedTable} updated successfully`, 'success', 'Row Saved');
        setEditRow(null);
        fetchTableData(selectedTable);
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to update record', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error saving record', 'error');
    } finally {
      setSavingRow(false);
    }
  };

  const handleDeleteRow = (row: any) => {
    const keyField = selectedTable === 'attendance_logs' ? 'id' : selectedTable === 'departments' ? 'dept_id' : 'user_id';
    const keyValue = row[keyField];

    confirmAction({
      title: `Delete Record from ${selectedTable}`,
      message: `Are you sure you want to permanently delete record ${keyField} = "${keyValue}"?`,
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete',
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://${window.location.hostname}:8000/api/admin/table-data/delete?table_name=${selectedTable}&key_field=${keyField}&key_value=${keyValue}`,
            { method: 'DELETE' }
          );
          if (res.ok) {
            showToast(`Deleted record ${keyValue} from ${selectedTable}`, 'success', 'Row Deleted');
            fetchTableData(selectedTable);
          } else {
            showToast('Failed to delete record', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'Error deleting record', 'error');
        }
      }
    });
  };

  // Filter Table Data
  const filteredTableData = tableData.filter((row) => {
    if (!dbSearch) return true;
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(dbSearch.toLowerCase())
    );
  });

  if (checkingAuth || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
        <p className="text-xs text-purple-300 font-bold uppercase tracking-wider animate-pulse">
          Verifying Master Admin Authorization...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-r from-[#0d1527] via-[#13102b] to-[#170a24]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              Master Project Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            System Modules, DB Inspector & Platform Governance
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl mt-1">
            Full master control over system modules, display order, database tables, user entitlements, and global feature settings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save System Config
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
            title="Log out from Master Admin Panel"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Admin Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MODULES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'MODULES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Modules & Display Ordering
        </button>

        <button
          onClick={() => {
            setActiveTab('DATABASE');
            setSelectedTable('users');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'DATABASE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Inspector & Editor
        </button>

        <button
          onClick={() => {
            setActiveTab('USERS');
            setSelectedTable('users');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'USERS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          User Roles & Entitlements
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'SETTINGS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          Global Settings & Thresholds
        </button>
      </div>

      {/* TAB 1: MODULES & DISPLAY ORDERING */}
      {activeTab === 'MODULES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Configure System Modules & Navigation Order
            </h3>
            <span className="text-xs text-gray-400">Order dictates display sequence on Modules Selection Page</span>
          </div>

          {loadingConfig ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : !config?.modules ? (
            <div className="p-8 text-center text-xs text-gray-400">No module configurations found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {config.modules.map((mod: any, index: number) => (
                <div
                  key={mod.id}
                  className={`glass-panel rounded-3xl p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    mod.enabled
                      ? 'border-purple-500/40 bg-purple-950/10'
                      : 'border-white/10 opacity-60 bg-gray-900/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-base shrink-0">
                      #{mod.order}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{mod.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {mod.badge}
                        </span>
                        {mod.enabled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 max-w-2xl">{mod.description}</p>
                    </div>
                  </div>

                  {/* Actions & Ordering */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {/* Move Up / Down */}
                    <div className="flex items-center gap-1 bg-dark-bg/60 p-1 rounded-xl border border-white/10">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMoveModule(index, 'UP')}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 disabled:opacity-30 transition-all"
                        title="Move Up in Order"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={index === config.modules.length - 1}
                        onClick={() => handleMoveModule(index, 'DOWN')}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 disabled:opacity-30 transition-all"
                        title="Move Down in Order"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Enable / Disable Toggle */}
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        mod.enabled
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                      }`}
                    >
                      {mod.enabled ? 'Disable Module' : 'Enable Module'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATABASE INSPECTOR & LIVE TABLE EDITOR */}
      {(activeTab === 'DATABASE' || activeTab === 'USERS') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Table Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-300">Select Database Table:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-3.5 py-2 bg-gray-900 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
              >
                {tables.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                placeholder={`Search records in ${selectedTable}...`}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {loadingTable ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : filteredTableData.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                No records found in table <code className="text-indigo-400">{selectedTable}</code>.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#0f172a] text-gray-400 font-bold uppercase text-[10px] tracking-wider z-10 border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Action</th>
                      {Object.keys(filteredTableData[0]).map((col) => (
                        <th key={col} className="py-3.5 px-4 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditRow(row)}
                              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                              title="Edit Row"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        {Object.entries(row).map(([k, v]: [string, any], cIdx) => (
                          <td key={cIdx} className="py-3 px-4 max-w-xs truncate font-mono text-[11px]">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL SETTINGS & THRESHOLDS */}
      {activeTab === 'SETTINGS' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Global System Settings & AI Biometrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">System Application Title</label>
              <input
                type="text"
                value={config?.system_title || 'MultiUtility Tracker'}
                onChange={(e) => setConfig({ ...config, system_title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Face Recognition Tolerance (Biometric Threshold)</label>
              <input
                type="number"
                step="0.05"
                min="0.3"
                max="0.9"
                value={config?.biometric_threshold || 0.60}
                onChange={(e) => setConfig({ ...config, biometric_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Default: 0.60. Lower values increase face match strictness.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Global Settings
            </button>
          </div>
        </div>
      )}

      {/* ROW EDIT MODAL */}
      {editRow && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Record in {selectedTable}
              </h3>
              <button onClick={() => setEditRow(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {Object.keys(editFormData).map((field) => (
                <div key={field}>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">{field}</label>
                  <input
                    type="text"
                    value={editFormData[field] ?? ''}
                    onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700 justify-end">
              <button
                disabled={savingRow}
                onClick={() => setEditRow(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-gray-300 font-semibold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={savingRow}
                onClick={handleSaveRow}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                {savingRow ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
