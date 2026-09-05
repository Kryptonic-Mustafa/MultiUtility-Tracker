'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCheck, UserPlus, Lock, User, ArrowRight, KeyRound, AlertCircle, Sparkles, GraduationCap, Briefcase, Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';

function SmsLoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login State
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('password');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration State
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'HOD' | 'SUB_TEACHER' | 'STAFF'>('STUDENT');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deptId, setDeptId] = useState('CSE');
  const [imageBase64, setImageBase64] = useState('');
  
  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [academicYear, setAcademicYear] = useState(1);
  const [section, setSection] = useState('A');

  // Faculty fields
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Computer Science');

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const snapshotParam = searchParams.get('snapshot');

    if (tabParam === 'register') {
      setTab('REGISTER');
    }
    if (snapshotParam) {
      setImageBase64(snapshotParam);
    }
  }, [searchParams]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id_or_email: accountId,
          password: password,
          is_admin: false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "SMS Module Login failed");
      }

      localStorage.setItem('multiutility_token', data.token);
      localStorage.setItem('multiutility_user', JSON.stringify(data.user));

      router.push('/sms');

    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials. Try default password 'password'.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    if (!userId || !name || !imageBase64) {
      setRegError("Please fill in User ID, Name, and capture/upload a face photo.");
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/register/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name,
          role,
          email,
          phone,
          dept_id: deptId,
          image_base64: imageBase64,
          roll_number: rollNumber || userId,
          academic_year: Number(academicYear),
          section,
          designation,
          specialization
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      setRegSuccess(`Successfully registered ${name} (${userId})! Redirecting to Biometric Kiosk...`);
      
      // Auto-redirect back to Biometric Kiosk after registration
      setTimeout(() => {
        router.push('/sms');
      }, 1200);

    } catch (err: any) {
      setRegError(err.message || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center relative py-6">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
        
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 mb-3">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">SMS Module Gateway</h2>
          <p className="text-xs text-gray-400 mt-1">School Management & Biometric Attendance System</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-dark-card/60 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'LOGIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Module Login
          </button>
          
          <button
            type="button"
            onClick={() => setTab('REGISTER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'REGISTER'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Self Register
          </button>
        </div>

        {/* Tab 1: Module Login Form */}
        {tab === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                User ID, Roll Number, or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="STU-1001 or FAC-2001"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
              <KeyRound className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Default testing password is <strong className="text-white">password</strong></span>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              <span>{loginLoading ? 'Authenticating...' : 'Enter SMS Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        ) : (
          /* Tab 2: Self Registration Form (Embedded Directly, No Modal) */
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-200">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                  { id: 'TEACHER', label: 'Teacher', icon: Briefcase },
                  { id: 'HOD', label: 'HOD', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-md'
                          : 'bg-dark-card/50 border-white/5 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Capture / Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Biometric Photo</label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {imageBase64 ? (
                    <img src={imageBase64} alt="Face Snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-gray-400">Clear front-facing image with single visible face.</p>
                </div>
              </div>
            </div>

            {/* User ID & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">User ID / Roll No *</label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'STU-1001' : 'FAC-2001'}
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Department & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CSE">Computer Science & Eng (CSE)</option>
                  <option value="ECE">Electronics & Comm (ECE)</option>
                  <option value="MECH">Mechanical Eng (MECH)</option>
                  <option value="CIVIL">Civil Eng (CIVIL)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@institution.edu"
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Role specific fields */}
            {role === 'STUDENT' ? (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Academic Year</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="A"
                    className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Assistant Lecturer"
                    className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Machine Learning"
                    className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {regError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
            >
              {regLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Biometrics & Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register & Open Biometric Kiosk</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

export default function SmsLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <SmsLoginComponent />
    </Suspense>
  );
}
