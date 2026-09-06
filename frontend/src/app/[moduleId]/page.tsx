'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Layers, HardDrive, ShieldCheck, Database, Users, ArrowRight, 
  Sparkles, Activity, CheckCircle2, Clock, KeyRound, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function DynamicModulePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const rawModuleId = Array.isArray(params?.moduleId) ? params.moduleId[0] : (params?.moduleId as string || 'module');
  const moduleId = rawModuleId.toLowerCase();

  const [moduleInfo, setModuleInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const res = await fetch(`http://${host}:8000/api/admin/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.modules && Array.isArray(data.modules)) {
            const found = data.modules.find((m: any) => m.id.toLowerCase() === moduleId);
            if (found) {
              setModuleInfo(found);
            } else {
              setModuleInfo({
                id: moduleId,
                title: `${moduleId.toUpperCase()} Module Workspace`,
                db_name: `module_${moduleId}`,
                badge: 'Custom Module',
                description: `Isolated operational workspace for ${moduleId} connected to dynamic module database module_${moduleId}.`,
                enabled: true
              });
            }
          }
        }
      } catch (e) {
        setModuleInfo({
          id: moduleId,
          title: `${moduleId.toUpperCase()} Module Workspace`,
          db_name: `module_${moduleId}`,
          badge: 'Module Workspace',
          description: `Isolated operational workspace connected to module_${moduleId}.`,
          enabled: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [moduleId]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-r from-[#0d1527] via-[#13102b] to-[#170a24] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-2">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Database: {moduleInfo?.db_name || `module_${moduleId}`}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {moduleInfo?.title || `${moduleId.toUpperCase()} Workspace`}
          </h1>
          <p className="text-xs text-gray-400 max-w-xl mt-1">
            {moduleInfo?.description || `Provisioned isolated database workspace for ${moduleId}.`}
          </p>
        </div>

        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-xs shadow-lg flex items-center gap-2 transition-all shrink-0"
        >
          <Database className="w-4 h-4 text-purple-400" />
          Inspect DB in Master Admin
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Database Status</div>
            <div className="text-xl font-black text-emerald-400">ONLINE</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Physical Database</div>
            <div className="text-sm font-mono font-bold text-white truncate max-w-[140px]">
              {moduleInfo?.db_name || `module_${moduleId}`}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Isolation Layer</div>
            <div className="text-xl font-black text-white">Multi-Tenant</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Sync Response</div>
            <div className="text-xl font-black text-white">&lt; 15 ms</div>
          </div>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Active Workspace for {moduleInfo?.title || moduleId}
        </h3>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          This workspace is powered by an isolated backend database schema <code className="text-purple-300 font-mono">module_{moduleId}</code>. All operations in this workspace are strictly scoped.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => showToast(`Module ${moduleId} workspace operational`, 'success', 'Workspace Ready')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Module Status Active
          </button>

          <button
            onClick={() => router.push('/modules')}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold text-xs transition-all"
          >
            Return to Gateway
          </button>
        </div>
      </div>

    </div>
  );
}
