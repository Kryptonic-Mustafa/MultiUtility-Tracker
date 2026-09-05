'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Search, CheckCircle2, XCircle, AlertCircle, GraduationCap, UserCheck, UserX, RotateCcw, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AttendanceReportPage() {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('multiutility_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const canMarkAttendance =
    currentUser?.role === 'TEACHER' ||
    currentUser?.role === 'SUB_TEACHER' ||
    currentUser?.role === 'HOD' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.is_admin;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students list
      const stuRes = await fetch(`http://${window.location.hostname}:8000/api/students`);
      let stuData = [];
      if (stuRes.ok) {
        stuData = await stuRes.json();
        setStudents(stuData);
      }

      // Fetch attendance logs for selected date
      const logRes = await fetch(`http://${window.location.hostname}:8000/api/attendance/logs?limit=500`);
      if (logRes.ok) {
        const logData = await logRes.json();
        
        // Filter logs by selected date (YYYY-MM-DD)
        const dateFiltered = logData.filter((log: any) => {
          if (!log.timestamp) return false;
          const logDate = new Date(log.timestamp).toISOString().split('T')[0];
          return logDate === selectedDate;
        });

        setAttendanceLogs(dateFiltered);
      }
    } catch (e) {
      console.error('Error fetching attendance report data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleMarkAttendance = async (userId: string, name: string, status: 'PRESENT' | 'ABSENT' | 'NOT_LOGGED_IN') => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          status,
          date_str: selectedDate,
          marked_by: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : currentUser?.role
        })
      });

      if (res.ok) {
        if (status === 'ABSENT') {
          showToast(`Student ${name} (${userId}) marked as Absent`, 'error', 'Student Marked Absent');
        } else if (status === 'PRESENT') {
          showToast(`Student ${name} (${userId}) marked as Present`, 'success', 'Student Marked Present');
        } else {
          showToast(`Attendance status reset for ${name} (${userId})`, 'info', 'Attendance Status Reset');
        }
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to update attendance status', 'error', 'Error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating attendance status', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Combine student details with check-in status
  const combinedReport = students.map((stu) => {
    const studentLogs = attendanceLogs.filter((log) => log.user_id === stu.user_id);
    const latestLog = studentLogs.length > 0 ? studentLogs[0] : null;

    let status: 'PRESENT' | 'ABSENT' | 'NOT_LOGGED_IN' = 'NOT_LOGGED_IN';
    if (latestLog) {
      if (latestLog.entry_type === 'ABSENT') {
        status = 'ABSENT';
      } else {
        status = 'PRESENT';
      }
    }

    return {
      ...stu,
      status,
      logTime: latestLog && status === 'PRESENT' ? new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      deviceInfo: latestLog ? latestLog.device_info : null,
      confidence: latestLog ? latestLog.confidence_score : null
    };
  });

  const isStudent = currentUser?.role === 'STUDENT';

  const filteredReport = combinedReport.filter(stu => {
    if (isStudent && currentUser?.dept_id) {
      const studentDept = (stu.dept_id || 'CSE').toUpperCase();
      const userDept = currentUser.dept_id.toUpperCase();
      if (studentDept !== userDept) return false;
    }
    return (
      stu.name.toLowerCase().includes(search.toLowerCase()) ||
      stu.user_id.toLowerCase().includes(search.toLowerCase()) ||
      stu.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      (stu.dept_id && stu.dept_id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const presentCount = filteredReport.filter(s => s.status === 'PRESENT').length;
  const absentCount = filteredReport.filter(s => s.status === 'ABSENT').length;
  const notLoggedCount = filteredReport.filter(s => s.status === 'NOT_LOGGED_IN').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Student Attendance Report & Marking
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Daily Class Attendance Register</h1>
          <p className="text-xs text-gray-400">
            {canMarkAttendance
              ? 'Mark students Present or Absent manually, or view automated face kiosk check-ins.'
              : 'Day-wise check-in logs and attendance status for your batchmates.'}
          </p>
        </div>

        {/* Date Selector & Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border border-white/10 rounded-xl text-xs text-white">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400">
            <span>Present: {presentCount}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400">
            <span>Absent: {absentCount}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
            <span>Not Logged: {notLoggedCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by student name, roll number, ID, or department..."
          className="w-full pl-11 pr-4 py-3 bg-dark-card/60 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filteredReport.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Student Records Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No students registered in the database match your criteria.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Dept / Class</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  {canMarkAttendance && <th className="py-3.5 px-5 text-center">Mark Attendance (Teacher)</th>}
                  <th className="py-3.5 px-4">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReport.map((stu) => {
                  const isUpdating = updatingUserId === stu.user_id;

                  return (
                    <tr key={stu.user_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-800 border border-white/10 flex-shrink-0">
                            {stu.profile_image_url ? (
                              <img src={stu.profile_image_url} alt={stu.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                                {stu.name[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{stu.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {stu.user_id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                        {stu.roll_number || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-gray-300">
                        {stu.dept_id || 'CSE'} • Yr {stu.academic_year} (Div {stu.section})
                      </td>

                      <td className="py-3.5 px-4">
                        {stu.status === 'PRESENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PRESENT
                          </span>
                        ) : stu.status === 'ABSENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            ABSENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-white/5">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                            NOT LOGGED IN
                          </span>
                        )}
                      </td>

                      {/* Teacher Interactive Marking Buttons */}
                      {canMarkAttendance && (
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-2 bg-dark-bg/60 p-1 rounded-xl border border-white/10 w-fit mx-auto">
                            {/* If currently PRESENT: allow teacher to Mark Absent or Reset */}
                            {stu.status === 'PRESENT' && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'ABSENT')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 flex items-center gap-1.5 transition-all"
                                  title="Mark Student as Absent"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  Mark Absent
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'NOT_LOGGED_IN')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-white/5 flex items-center gap-1 transition-all"
                                  title="Reset to Not Logged In"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Reset
                                </button>
                              </>
                            )}

                            {/* If currently ABSENT: allow teacher to Mark Present or Reset */}
                            {stu.status === 'ABSENT' && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'PRESENT')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 transition-all"
                                  title="Mark Student as Present"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Mark Present
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'NOT_LOGGED_IN')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-white/5 flex items-center gap-1 transition-all"
                                  title="Reset to Not Logged In"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Reset
                                </button>
                              </>
                            )}

                            {/* If NOT LOGGED IN: allow teacher to Mark Present or Mark Absent */}
                            {stu.status === 'NOT_LOGGED_IN' && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'PRESENT')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 transition-all"
                                  title="Mark Student as Present"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Present
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleMarkAttendance(stu.user_id, stu.name, 'ABSENT')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 flex items-center gap-1.5 transition-all"
                                  title="Mark Student as Absent"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  Absent
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4 font-mono text-gray-300">
                        {stu.logTime ? (
                          <span className="flex items-center gap-1 text-emerald-300">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {stu.logTime}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
