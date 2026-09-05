'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Camera, Users, UserCheck, Building2, Clock, LogOut, Grid, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const syncUser = () => {
      const saved = localStorage.getItem('multiutility_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    syncUser();
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined' && !window.confirm('Do you want to logout?')) {
      return;
    }
    localStorage.removeItem('multiutility_token');
    localStorage.removeItem('multiutility_user');
    setCurrentUser(null);
    router.push('/sms/login');
  };

  const isSmsModule = pathname.startsWith('/sms');
  const isLoginPage = pathname === '/sms/login';
  const isModulesPage = pathname === '/modules' || pathname === '/';

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <Link href="/modules" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-card rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-300">
                  MultiUtility Tracker
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                Module 1: <span className="text-indigo-400 font-medium">School Management (SMS)</span>
              </p>
            </div>
          </Link>

          {/* SMS Desktop Navigation Tabs - ONLY shown when authenticated */}
          {isSmsModule && currentUser && !isLoginPage && (
            <div className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-white/5">
              <Link
                href="/sms"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/sms'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Kiosk
              </Link>

              <Link
                href="/sms/students"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/sms/students'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                {currentUser.role === 'STUDENT' ? 'My Batchmates' : 'Students'}
              </Link>

              <Link
                href="/sms/faculty"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/sms/faculty'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Faculty & Staff
              </Link>

              {currentUser.role !== 'STUDENT' && (
                <Link
                  href="/sms/departments"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/sms/departments'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Departments
                </Link>
              )}

              {currentUser.role !== 'STUDENT' && (
                <Link
                  href="/sms/logs"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/sms/logs'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Logs
                </Link>
              )}

              <Link
                href="/sms/report"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/sms/report'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                {currentUser.role === 'STUDENT' ? 'Attendance Report' : 'Class Report'}
              </Link>
            </div>
          )}

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-3">
            {!isModulesPage && (
              <Link
                href="/modules"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                title="Module Switcher Gateway"
              >
                <Grid className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Modules</span>
              </Link>
            )}

            {currentUser?.is_admin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {currentUser.role || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              !isModulesPage && !isLoginPage && (
                <Link
                  href="/sms/login"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Login
                </Link>
              )
            )}
          </div>

        </div>
      </nav>

      {/* Mobile Bottom Navigation Shelf - ONLY shown when authenticated */}
      {isSmsModule && currentUser && !isLoginPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-3 py-2 flex items-center justify-around shadow-2xl backdrop-blur-xl bg-dark-bg/95">
          <Link
            href="/sms"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
              pathname === '/sms' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Kiosk</span>
          </Link>

          <Link
            href="/sms/students"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
              pathname === '/sms/students' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>{currentUser.role === 'STUDENT' ? 'Batchmates' : 'Students'}</span>
          </Link>

          <Link
            href="/sms/faculty"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
              pathname === '/sms/faculty' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Faculty</span>
          </Link>

          {currentUser.role !== 'STUDENT' && (
            <Link
              href="/sms/departments"
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                pathname === '/sms/departments' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Depts</span>
            </Link>
          )}

          {currentUser.role !== 'STUDENT' ? (
            <Link
              href="/sms/logs"
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                pathname === '/sms/logs' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Logs</span>
            </Link>
          ) : (
            <Link
              href="/sms/report"
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                pathname === '/sms/report' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Report</span>
            </Link>
          )}

          <Link
            href="/modules"
            className="flex flex-col items-center gap-1 p-1 text-[10px] font-semibold text-purple-400 hover:text-white"
          >
            <Grid className="w-5 h-5" />
            <span>Modules</span>
          </Link>
        </div>
      )}
    </>
  );
}
