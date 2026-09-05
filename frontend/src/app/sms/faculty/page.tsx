'use client';

import React, { useState, useEffect } from 'react';
import RegisterUserModal from '@/components/RegisterUserModal';
import { UserCheck, UserPlus, Search, Briefcase, Clock, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function FacultyPage() {
  const { showToast, confirmAction } = useToast();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('multiutility_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const isStudent = currentUser?.role === 'STUDENT';
  const canManage = currentUser?.role === 'ADMIN' || currentUser?.is_admin;

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty`);
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleDelete = (userId: string, name?: string) => {
    if (!canManage) return;
    confirmAction({
      title: 'Delete Faculty Member',
      message: `Are you sure you want to delete faculty member ${name ? `${name} (${userId})` : userId}? This action cannot be undone.`,
      confirmText: 'Delete Faculty',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://${window.location.hostname}:8000/api/faculty/${userId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast(`Faculty member ${userId} deleted successfully`, 'success');
            fetchFaculty();
          } else {
            showToast(`Failed to delete faculty member ${userId}`, 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'Error deleting faculty member', 'error');
        }
      }
    });
  };

  const filtered = faculty.filter(f => {
    if (currentUser?.dept_id && currentUser?.dept_id !== 'ALL') {
      const facultyDept = (f.dept_id || 'CSE').toUpperCase();
      const userDept = currentUser.dept_id.toUpperCase();
      if (facultyDept !== userDept) return false;
    }
    return (
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.user_id.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {isStudent
                ? 'My Teachers & HOD'
                : canManage
                ? `Department Admin (${currentUser?.dept_id || 'CSE'})`
                : `Department Faculty (${currentUser?.dept_id || 'CSE'})`}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {isStudent
              ? 'Department Faculty & HOD'
              : canManage
              ? `Manage Faculty & HOD (${currentUser?.dept_id || 'CSE'})`
              : `Faculty & Teachers in ${currentUser?.dept_id || 'Department'}`}
          </h1>
          <p className="text-xs text-gray-400">
            {isStudent
              ? 'View institutional teachers, HODs, and faculty details for your department'
              : canManage
              ? 'Register, manage, and update department teachers, HODs, and faculty biometrics'
              : `View faculty members, designations, and shifts in ${currentUser?.dept_id || 'your department'}`}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty / Staff</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search faculty by name, ID, or designation..."
          className="w-full pl-11 pr-4 py-3 bg-dark-card/60 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Faculty Members Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            No faculty or staff records match your search query.
          </p>
          {!canManage ? null : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Register Faculty
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f) => (
            <div key={f.user_id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-white/10 flex-shrink-0">
                      {f.profile_image_url ? (
                        <img src={f.profile_image_url} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500/10 text-purple-400 font-bold text-sm">
                          {f.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{f.name}</h3>
                        {f.role === 'HOD' && (
                          <span title="Head of Department">
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-purple-400 font-mono">ID: {f.user_id}</p>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleDelete(f.user_id, f.name)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-gray-300 bg-dark-bg/40 p-3 rounded-xl border border-white/5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role / Title:</span>
                    <span className="font-bold text-purple-300 uppercase">{f.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Designation:</span>
                    <span className="font-semibold text-white">{f.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shift Timings:</span>
                    <span className="text-gray-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {f.shift_start} - {f.shift_end}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-gray-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Shift Check-In Enabled
                </span>
                <span>{f.dept_id || 'CSE'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegisterUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchFaculty}
      />

    </div>
  );
}
