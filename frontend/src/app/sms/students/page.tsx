'use client';

import React, { useState, useEffect } from 'react';
import RegisterUserModal from '@/components/RegisterUserModal';
import { Users, UserPlus, Search, GraduationCap, Trash2, CheckCircle2 } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete student ${userId}?`)) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/students/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {}
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.user_id.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Student Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Registered Students</h1>
          <p className="text-xs text-gray-400">View and manage enrolled students with biometric encodings</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students by name, ID, or roll number..."
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
          <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Students Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            No student records match your search query or no students have been registered yet.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            Register Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div key={s.user_id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-white/10 flex-shrink-0">
                      {s.profile_image_url ? (
                        <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 text-indigo-400 font-bold text-sm">
                          {s.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{s.name}</h3>
                      <p className="text-[11px] text-indigo-400 font-mono">ID: {s.user_id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(s.user_id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-gray-300 bg-dark-bg/40 p-3 rounded-xl border border-white/5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Roll No:</span>
                    <span className="font-bold text-white">{s.roll_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="font-semibold text-indigo-300">{s.dept_id || 'CSE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Year / Section:</span>
                    <span className="text-gray-200">Year {s.academic_year} • Sec {s.section}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-gray-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Biometric Encoded
                </span>
                <span>{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegisterUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchStudents}
      />

    </div>
  );
}
