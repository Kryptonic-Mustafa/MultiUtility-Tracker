'use client';

import React, { useState } from 'react';
import { X, Camera, Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, User, Briefcase, GraduationCap } from 'lucide-react';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSnapshot?: string;
  onSuccess?: () => void;
}

export default function RegisterUserModal({ isOpen, onClose, initialSnapshot, onSuccess }: RegisterUserModalProps) {
  if (!isOpen) return null;

  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'HOD' | 'SUB_TEACHER' | 'STAFF'>('STUDENT');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deptId, setDeptId] = useState('CSE');
  const [imageBase64, setImageBase64] = useState(initialSnapshot || '');
  
  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [academicYear, setAcademicYear] = useState(1);
  const [section, setSection] = useState('A');

  // Faculty fields
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Computer Science');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!userId || !name || !imageBase64) {
      setError("Please fill in User ID, Name, and capture/upload a face photo.");
      setLoading(false);
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

      setSuccessMsg(`Successfully registered ${name} (${userId})! Default password is 'password'.`);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dynamic User Registration</h3>
              <p className="text-xs text-gray-400">Register Students, Faculty & Staff with real-time biometric encoding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">

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
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md'
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

          {/* Photo Capture / Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Biometric Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 flex items-center justify-center">
                {imageBase64 ? (
                  <img src={imageBase64} alt="Face Snapshot" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-600" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-indigo-400" />
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
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
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
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
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
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
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
                className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
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
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A"
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
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
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Machine Learning"
                  className="w-full px-3.5 py-2 bg-dark-bg/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing Face Encoding & Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Register User & Activate Biometrics</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
