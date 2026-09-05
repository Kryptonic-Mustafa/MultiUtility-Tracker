'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Search, CheckCircle2, AlertCircle, XCircle, Users, GraduationCap } from 'lucide-react';

export default function AttendanceReportPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const logRes = await fetch(`http://${window.location.hostname}:8000/api/attendance/logs?limit=200`);
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

  // Combine student details with their check-in status for the selected date
  const combinedReport = students.map((stu) => {
    // Find matching attendance log for this student on selectedDate
    const studentLogs = attendanceLogs.filter((log) => log.user_id === stu.user_id);
    const hasLogged = studentLogs.length > 0;
    const latestLog = hasLogged ? studentLogs[0] : null;

    return {
      ...stu,
      hasLogged,
      logTime: latestLog ? new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      confidence: latestLog ? latestLog.confidence_score : null
    };
  });

  const filteredReport = combinedReport.filter(stu =>
    stu.name.toLowerCase().includes(search.toLowerCase()) ||
    stu.user_id.toLowerCase().includes(search.toLowerCase()) ||
    stu.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    (stu.dept_id && stu.dept_id.toLowerCase().includes(search.toLowerCase()))
  );

  const presentCount = combinedReport.filter(s => s.hasLogged).length;
  const absentCount = combinedReport.length - presentCount;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Student Attendance Report
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Daily Class Attendance Status</h1>
          <p className="text-xs text-gray-400">Day-wise check-in logs and attendance status for your batchmates</p>
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
            <span>Not Logged: {absentCount}</span>
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
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-5 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReport.map((stu) => (
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
                      {stu.dept_id || 'CSE'} • Yr {stu.academic_year} ({stu.section})
                    </td>

                    <td className="py-3.5 px-4">
                      {stu.hasLogged ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          LOGGED & PRESENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-white/5">
                          <XCircle className="w-3.5 h-3.5 text-gray-500" />
                          NOT CHECKED IN
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {stu.hasLogged ? (
                        <span className="flex items-center gap-1 text-emerald-300">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {stu.logTime}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-gray-300">
                      {stu.hasLogged && stu.confidence ? (
                        <span className="text-indigo-400">{(stu.confidence * 100).toFixed(1)}%</span>
                      ) : (
                        <span className="text-gray-600">—</span>
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
