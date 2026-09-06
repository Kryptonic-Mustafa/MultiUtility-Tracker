'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, Camera, Users, UserCheck, Building2, Clock, LogOut, Grid, Sparkles, 
  ChevronDown, User, Briefcase, BookOpen, Bus, Layers, FileText, CheckCircle2 
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast, confirmAction } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const savedAdmin = localStorage.getItem('master_admin_session');
      const savedUser = localStorage.getItem('multiutility_user');

      if (savedAdmin) {
        try {
          const admin = JSON.parse(savedAdmin);
          if (admin && (admin.user_id || admin.admin_id)) {
            setCurrentUser({
              user_id: admin.user_id || admin.admin_id || 'SUPER-ADMIN',
              name: admin.name || 'Master Admin',
              email: admin.email || 'superadmin@university.edu',
              role: admin.role || 'SUPER_ADMIN',
              is_admin: true,
              dept_id: 'ALL'
            });
            return;
          }
        } catch (e) {}
      }

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && (parsed.user_id || parsed.id)) {
            setCurrentUser(parsed);
            return;
          }
        } catch (e) {}
      }
      
      setCurrentUser(null);
    };

    syncUser();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    const isAdminPath = pathname.startsWith('/admin');
    
    confirmAction({
      title: 'Confirm Logout',
      message: isAdminPath ? 'Are you sure you want to log out of Master Admin Panel?' : 'Are you sure you want to log out of MultiUtility System?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'logout',
      onConfirm: () => {
        // Purge ALL sessions completely to prevent lingering credentials
        localStorage.removeItem('multiutility_token');
        localStorage.removeItem('multiutility_user');
        localStorage.removeItem('master_admin_session');
        localStorage.removeItem('master_admin_token');
        setCurrentUser(null);

        if (isAdminPath) {
          showToast('Logged out from Master Admin Panel', 'info', 'Admin Logout');
          window.location.href = '/admin/login';
        } else {
          showToast('Logged out of all sessions successfully', 'info', 'Logout Successful');
          window.location.href = '/modules';
        }
      }
    });
  };

  const isLoginPage = pathname.endsWith('/login') || pathname === '/login' || pathname.includes('/login');
  const isModulesPage = pathname === '/modules' || pathname === '/';

  // Do NOT render module navbar on Master Admin routes (/admin and /admin/login)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Dynamic Module Context Info based on Path
  const getModuleInfo = (path: string) => {
    if (path.startsWith('/sms')) {
      return { id: 'sms', title: 'School Management (SMS)', badge: 'Module #1', icon: Camera, color: 'text-indigo-400' };
    }
    if (path.startsWith('/hr')) {
      return { id: 'hr', title: 'HR & Payroll Management', badge: 'Module #2', icon: Briefcase, color: 'text-purple-400' };
    }
    if (path.startsWith('/library')) {
      return { id: 'library', title: 'Digital Library System', badge: 'Module #3', icon: BookOpen, color: 'text-blue-400' };
    }
    if (path.startsWith('/hostel')) {
      return { id: 'hostel', title: 'Hostel & Fleet Logistics', badge: 'Module #4', icon: Bus, color: 'text-emerald-400' };
    }
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0 && parts[0] !== 'modules') {
      return { id: parts[0], title: `Custom Module (${parts[0].toUpperCase()})`, badge: 'Module', icon: Layers, color: 'text-amber-400' };
    }
    return { id: 'gateway', title: 'Multi-Purpose Platform', badge: 'Gateway', icon: Sparkles, color: 'text-indigo-400' };
  };

  const currentMod = getModuleInfo(pathname);

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
        <div className="w-full max-w-[98%] xl:max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          
          {/* Dynamic Brand Logo & Module Title */}
          <Link href="/modules" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-dark-card rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-300">
                  MultiUtility Tracker
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                {currentMod.badge}: <span className={`${currentMod.color} font-semibold`}>{currentMod.title}</span>
              </p>
            </div>
          </Link>

          {/* Module-Specific Desktop Navigation Tabs */}
          {currentUser && !isLoginPage && currentMod.id !== 'gateway' && (
            <div className="hidden lg:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-white/5 max-w-full overflow-x-auto no-scrollbar">
              
              {/* SMS Tabs */}
              {currentMod.id === 'sms' && (
                <>
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

                  {(currentUser.role === 'ADMIN' || currentUser.is_admin) && (
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

                  {(currentUser.role === 'ADMIN' || currentUser.is_admin) && (
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
                </>
              )}

              {/* HR Tabs */}
              {currentMod.id === 'hr' && (
                <>
                  <Link
                    href="/hr"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/hr'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    HR Workspace
                  </Link>

                  <Link
                    href="/hr#employees"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    Employee Directory
                  </Link>

                  <Link
                    href="/hr#payroll"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Payslip Generator
                  </Link>
                </>
              )}

              {/* Library Tabs */}
              {currentMod.id === 'library' && (
                <>
                  <Link
                    href="/library"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/library'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Library Desk
                  </Link>

                  <Link
                    href="/library#catalog"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    Book Catalog
                  </Link>

                  <Link
                    href="/library#fines"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    Loan Ledger
                  </Link>
                </>
              )}

              {/* Hostel Tabs */}
              {currentMod.id === 'hostel' && (
                <>
                  <Link
                    href="/hostel"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/hostel'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Bus className="w-4 h-4" />
                    Hostel & Fleet Hub
                  </Link>

                  <Link
                    href="/hostel#dorms"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    Dorm Rooms
                  </Link>

                  <Link
                    href="/hostel#fleet"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bus className="w-4 h-4" />
                    Bus GPS Fleet
                  </Link>
                </>
              )}

              {/* Dynamic Module Tabs */}
              {!['sms', 'hr', 'library', 'hostel'].includes(currentMod.id) && (
                <Link
                  href={`/${currentMod.id}`}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white shadow-md transition-all"
                >
                  <Layers className="w-4 h-4" />
                  {currentMod.title} Workspace
                </Link>
              )}

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
              <div className="relative pl-2 border-l border-white/10" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    {currentUser.profile_image_url ? (
                      <img
                        src={currentUser.profile_image_url}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}</span>
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                      <span>{currentUser.name}</span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                      {isModulesPage && currentUser.active_module
                        ? `${currentUser.role || 'User'} • ${currentUser.active_module.toUpperCase()}`
                        : currentUser.role || 'User'}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-3 mb-1.5 border-b border-slate-700/60 bg-slate-800/80 rounded-xl">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{currentUser.user_id}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {currentUser.role || 'USER'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{currentUser.dept_id || 'CSE'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={currentMod.id === 'sms' ? '/sms/profile' : `/${currentMod.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>My Account Profile</span>
                      </Link>

                      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.is_admin) && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span>Master Admin Panel</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </nav>

      {/* Mobile & Tablet Bottom Navigation Shelf - ONLY shown when authenticated */}
      {currentUser && !isLoginPage && currentMod.id !== 'gateway' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-3 py-2 flex items-center justify-around shadow-2xl backdrop-blur-xl bg-dark-bg/95">
          
          {/* SMS Bottom Shelf */}
          {currentMod.id === 'sms' && (
            <>
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

              <Link
                href="/sms/report"
                className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                  pathname === '/sms/report' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Report</span>
              </Link>
            </>
          )}

          {/* HR Bottom Shelf */}
          {currentMod.id === 'hr' && (
            <>
              <Link
                href="/hr"
                className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                  pathname === '/hr' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>HR Hub</span>
              </Link>
              <Link
                href="/hr#payroll"
                className="flex flex-col items-center gap-1 p-1 text-[10px] font-semibold text-gray-400 hover:text-white"
              >
                <FileText className="w-5 h-5" />
                <span>Payroll</span>
              </Link>
            </>
          )}

          {/* Library Bottom Shelf */}
          {currentMod.id === 'library' && (
            <>
              <Link
                href="/library"
                className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                  pathname === '/library' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Desk</span>
              </Link>
              <Link
                href="/library#catalog"
                className="flex flex-col items-center gap-1 p-1 text-[10px] font-semibold text-gray-400 hover:text-white"
              >
                <Layers className="w-5 h-5" />
                <span>Catalog</span>
              </Link>
            </>
          )}

          {/* Hostel Bottom Shelf */}
          {currentMod.id === 'hostel' && (
            <>
              <Link
                href="/hostel"
                className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-all ${
                  pathname === '/hostel' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bus className="w-5 h-5" />
                <span>Hostel</span>
              </Link>
              <Link
                href="/hostel#fleet"
                className="flex flex-col items-center gap-1 p-1 text-[10px] font-semibold text-gray-400 hover:text-white"
              >
                <Bus className="w-5 h-5" />
                <span>GPS Fleet</span>
              </Link>
            </>
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
