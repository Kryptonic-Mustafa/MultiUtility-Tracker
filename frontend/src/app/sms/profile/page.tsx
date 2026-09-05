'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Edit3, ArrowLeft, Save, X, CheckCircle2, Shield, Camera, Mail, Phone, Building2, GraduationCap, Briefcase, Calendar, Hash, Lock, Upload } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Photo Change Modal & Camera State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLiveCam, setShowLiveCam] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Editable Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deptId, setDeptId] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [academicYear, setAcademicYear] = useState(1);
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');

  // Faculty fields
  const [designation, setDesignation] = useState('');
  const [specialization, setSpecialization] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowLiveCam(false);
  };

  const startCamera = async () => {
    try {
      stopCamera();
      setShowLiveCam(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 200);

    } catch (err) {
      console.error("Camera error:", err);
      showToast("Could not access camera for live capture. Please allow camera permissions.", "error");
      setShowLiveCam(false);
    }
  };

  const snapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const b64 = canvas.toDataURL('image/jpeg', 0.85);
    setProfileImageUrl(b64);
    stopCamera();
  };

  useEffect(() => {
    const saved = localStorage.getItem('multiutility_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        fetchProfile(u.user_id);
      } catch (e) {
        setLoading(false);
      }
    } else {
      router.push('/sms/login');
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/auth/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        populateForm(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: any) => {
    setName(data.name || '');
    setEmail(data.email || '');
    setPhone(data.phone || '');
    setDeptId(data.dept_id || 'CSE');
    setProfileImageUrl(data.profile_image_url || '');

    setRollNumber(data.roll_number || '');
    setAcademicYear(data.academic_year || 1);
    setSection(data.section || 'A');
    setParentName(data.parent_name || '');
    setParentContact(data.parent_contact || '');
    setGuardianName(data.guardian_name || '');
    setGuardianContact(data.guardian_contact || '');

    setDesignation(data.designation || '');
    setSpecialization(data.specialization || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          name,
          email,
          phone,
          dept_id: deptId,
          profile_image_url: profileImageUrl,
          roll_number: rollNumber,
          academic_year: academicYear,
          section,
          parent_name: parentName,
          parent_contact: parentContact,
          guardian_name: guardianName,
          guardian_contact: guardianContact,
          designation,
          specialization
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || 'Failed to update profile');
      }

      // Update localStorage with fresh user data
      const updatedUser = { ...currentUser, ...result.user };
      localStorage.setItem('multiutility_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Refresh profile data and exit edit mode
      fetchProfile(currentUser.user_id);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');

    } catch (err: any) {
      showToast(err.message || 'Error saving profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const isStudent = profileData?.role === 'STUDENT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Bar with Back Button & Edit Mode Toggle */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </button>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profileData) populateForm(profileData);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Profile Header Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/10 mb-6 text-center sm:text-left">
          
          {/* Avatar Block */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-500/40 shadow-xl flex items-center justify-center text-white font-extrabold text-3xl">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{name ? name[0].toUpperCase() : 'U'}</span>
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all hover:bg-black/80"
              >
                <Camera className="w-6 h-6 mb-1 text-indigo-400" />
                <span>Change Photo</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{name || 'User Profile'}</h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {profileData?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400">
              {isStudent ? 'Roll Number / User ID: ' : 'Staff ID / User ID: '}
              <span className="text-indigo-400 font-bold">{profileData?.user_id}</span>
            </p>
            <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Department: <strong className="text-white">{deptId || 'CSE'}</strong></span>
            </p>
          </div>
        </div>

        {/* Read-Only View vs Editable Form */}
        {!isEditing ? (
          /* READ-ONLY VIEW */
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </p>
                <p className="text-xs font-bold text-white">{name || 'Not set'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
                </p>
                <p className="text-xs font-bold text-white">
                  {email ? email : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Student Contact Phone
                </p>
                <p className="text-xs font-bold text-white">
                  {phone ? phone : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Department ID
                </p>
                <p className="text-xs font-bold text-indigo-300">{deptId || 'CSE'}</p>
              </div>

            </div>

            {/* Role Specific Read-Only Details */}
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300 pt-2">
              {isStudent ? 'Academic, Parent & Guardian Details' : 'Faculty Designation & Shift Details'}
            </h3>

            {isStudent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" /> System Roll Number
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-300">{rollNumber || profileData?.user_id}</p>
                </div>

                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Year & Division
                  </p>
                  <p className="text-xs font-bold text-white">
                    Year {academicYear} • Div {section} ({section === 'A' ? 'Girls' : section === 'B' ? 'Boys' : 'Co-ed / Combined'})
                  </p>
                </div>

                {/* Parent Information */}
                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Parent Name</p>
                  <p className="text-xs font-bold text-white">
                    {parentName ? parentName : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Parent Contact Phone</p>
                  <p className="text-xs font-bold text-white">
                    {parentContact ? parentContact : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>

                {/* Guardian Information (Optional) */}
                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Guardian Name (Optional)</p>
                  <p className="text-xs font-bold text-white">
                    {guardianName ? guardianName : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Guardian Contact Phone (Optional)</p>
                  <p className="text-xs font-bold text-white">
                    {guardianContact ? guardianContact : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Designation
                  </p>
                  <p className="text-xs font-bold text-white">
                    {designation ? designation : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dark-bg/40 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Specialization
                  </p>
                  <p className="text-xs font-bold text-white">
                    {specialization ? specialization : <span className="text-gray-500 italic">Not set (click Edit to add)</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EDITABLE FORM MODE */
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Edit Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@university.edu"
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Student Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CSE">CSE - Computer Science</option>
                  <option value="ECE">ECE - Electronics & Comm</option>
                  <option value="MECH">MECH - Mechanical Engg</option>
                  <option value="IT">IT - Information Tech</option>
                  <option value="CIVIL">CIVIL - Civil Engineering</option>
                </select>
              </div>

            </div>

            {/* Role Specific Editable Form */}
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider pt-2">
              {isStudent ? 'Edit Student Details' : 'Edit Faculty Details'}
            </h3>

            {isStudent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Roll Number (System Generated)</label>
                  <div className="w-full px-3.5 py-2.5 bg-dark-bg/60 border border-white/10 rounded-xl text-xs font-mono font-bold text-indigo-300 flex items-center justify-between cursor-not-allowed">
                    <span>{rollNumber || profileData?.user_id}</span>
                    <span className="text-[10px] uppercase font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read Only
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Academic Year & Division</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(Number(e.target.value))}
                      className="px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>

                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="A">Div A (Girls)</option>
                      <option value="B">Div B (Boys)</option>
                      <option value="C">Div C (Co-ed / Extra fit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Enter parent's full name"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Parent Contact Phone</label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="Enter parent contact number"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Guardian Name (Optional)</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Enter guardian name (optional)"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Guardian Contact Phone (Optional)</label>
                  <input
                    type="text"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="Enter guardian contact number (optional)"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Assistant Professor"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (profileData) populateForm(profileData);
                }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Photo Change Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Update Profile Photo</h3>
                  <p className="text-xs text-gray-400">Capture live photo or upload image file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setShowPhotoModal(false);
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {showLiveCam ? (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-indigo-500/50 shadow-xl aspect-video flex items-center justify-center mb-4">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={snapPhoto}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2 bg-gray-900/80 hover:bg-red-500/80 text-white rounded-full text-xs transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-900 border-2 border-indigo-500/40 flex items-center justify-center shadow-inner">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-2xl text-xs font-bold text-indigo-300 transition-all hover:scale-[1.02]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Live</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-gray-300 cursor-pointer transition-all hover:scale-[1.02]">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(e);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setShowPhotoModal(false);
                }}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-lg hover:bg-indigo-500 transition-all"
              >
                Apply & Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
