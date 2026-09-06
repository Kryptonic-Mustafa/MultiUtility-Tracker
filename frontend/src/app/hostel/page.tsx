'use client';

import React, { useState } from 'react';
import { 
  Bus, Home, Utensils, ShieldCheck, Plus, Search, MapPin, 
  UserCheck, AlertCircle, CheckCircle2, Clock, Navigation, Compass, FileText
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function HostelWorkspacePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'HOSTEL' | 'FLEET' | 'MESS' | 'GATE'>('HOSTEL');
  const [search, setSearch] = useState('');

  // Sample Hostel & Fleet Data
  const [rooms, setRooms] = useState([
    { roomNo: 'A-201', block: 'Alpha Block (Men)', type: 'Double Sharing', occupancy: '2/2 Full', status: 'Occupied' },
    { roomNo: 'A-202', block: 'Alpha Block (Men)', type: 'Double Sharing', occupancy: '1/2 Available', status: 'Partial' },
    { roomNo: 'B-104', block: 'Beta Block (Women)', type: 'Single Suite', occupancy: '1/1 Full', status: 'Occupied' },
    { roomNo: 'B-105', block: 'Beta Block (Women)', type: 'Double Sharing', occupancy: '0/2 Available', status: 'Vacant' },
  ]);

  const [busRoutes, setBusRoutes] = useState([
    { routeId: 'BUS-01', routeName: 'North City Express', driver: 'James Wilson', capacity: '42/45 Seats', status: 'On Route', nextStop: 'Central Junction' },
    { routeId: 'BUS-02', routeName: 'South Campus Shuttle', driver: 'David Sterling', capacity: '38/45 Seats', status: 'At Terminal', nextStop: 'Main Gate' },
    { routeId: 'BUS-03', routeName: 'Metro Link Direct', driver: 'Michael Chang', capacity: '45/45 Full', status: 'On Route', nextStop: 'Tech Park Metro' }
  ]);

  const [visitorPasses, setVisitorPasses] = useState([
    { passId: 'GP-901', visitor: 'Arthur Pendelton', resident: 'STU-1001 (Alex Johnson)', purpose: 'Family Visit', inTime: '10:15 AM', status: 'Active' },
    { passId: 'GP-902', visitor: 'Maintenance Tech', resident: 'A-201 Dorm', purpose: 'AC Repair', inTime: '11:30 AM', status: 'Checked Out' }
  ]);

  const handleAction = (msg: string) => {
    showToast(msg, 'success', 'Logistics Action');
  };

  const handleAllocateRoom = (roomNo: string) => {
    showToast(`Opening Bed Allocation Form for Room ${roomNo}`, 'info', 'Room Allocation');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-r from-[#061c16] via-[#0d2e24] to-[#12361d] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Module #4 Workspace (module_hostel)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Hostel & Fleet Logistics Management
          </h1>
          <p className="text-xs text-gray-400 max-w-xl mt-1">
            Dormitory bed allocation, live bus fleet route tracking, mess meal subscriptions, and campus visitor gate passes.
          </p>
        </div>

        <button
          onClick={() => handleAction('Opening Gate Pass Issuance Modal...')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-2 hover:opacity-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Issue Visitor Gate Pass
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Hostel Occupancy</div>
            <div className="text-xl font-black text-white">412 / 450 Beds</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Active Bus Fleet</div>
            <div className="text-xl font-black text-white">12 Buses Live</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Mess Meals Served</div>
            <div className="text-xl font-black text-white">1,240 Today</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Active Gate Passes</div>
            <div className="text-xl font-black text-white">8 On Campus</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('HOSTEL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'HOSTEL'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4" />
          Dormitory Allocation ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'FLEET'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bus className="w-4 h-4" />
          Fleet & Bus Routes
        </button>

        <button
          onClick={() => setActiveTab('MESS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'MESS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Mess Meal Passes
        </button>

        <button
          onClick={() => setActiveTab('GATE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'GATE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Visitor Gate Passes
        </button>
      </div>

      {/* TAB 1: HOSTEL */}
      {activeTab === 'HOSTEL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div key={room.roomNo} className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {room.block}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">Room {room.roomNo}</h3>
                  <p className="text-xs text-gray-400">{room.type}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  room.status === 'Vacant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : room.status === 'Partial' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-800 text-gray-400 border border-white/10'
                }`}>
                  {room.occupancy}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] font-bold text-gray-400">Status: {room.status}</span>
                <button
                  disabled={room.status === 'Occupied'}
                  onClick={() => handleAllocateRoom(room.roomNo)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md disabled:opacity-40 hover:opacity-95 transition-all"
                >
                  Allocate Bed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FLEET */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {busRoutes.map((bus) => (
              <div key={bus.routeId} className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{bus.routeName}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">{bus.routeId} • Driver: {bus.driver}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-dark-bg/60 border border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Next Stop:</span>
                    <strong className="text-emerald-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {bus.nextStop}
                    </strong>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Capacity:</span>
                    <strong className="font-mono">{bus.capacity}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleAction(`Viewing Live GPS Track for ${bus.routeId}...`)}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  View Live GPS Track
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MESS */}
      {activeTab === 'MESS' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" />
              Mess Meal Subscription & Meal Counter
            </h3>
            <button
              onClick={() => handleAction('Generating Daily Mess Meal Pass QR...')}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs"
            >
              Generate Meal QR Pass
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 text-center space-y-1">
              <div className="text-xs text-gray-400 font-bold">Breakfast Served</div>
              <div className="text-2xl font-black text-amber-400">412 Meals</div>
              <p className="text-[10px] text-gray-500">Completed (7:30 AM - 9:30 AM)</p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 text-center space-y-1">
              <div className="text-xs text-gray-400 font-bold">Lunch Counter</div>
              <div className="text-2xl font-black text-emerald-400">430 Meals</div>
              <p className="text-[10px] text-gray-500">Active (12:30 PM - 2:30 PM)</p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-white/10 text-center space-y-1">
              <div className="text-xs text-gray-400 font-bold">Dinner Upcoming</div>
              <div className="text-2xl font-black text-gray-300">415 Expected</div>
              <p className="text-[10px] text-gray-500">Scheduled (7:30 PM - 9:30 PM)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GATE */}
      {activeTab === 'GATE' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0f172a] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Visiting Resident / Dorm</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {visitorPasses.map((pass) => (
                <tr key={pass.passId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-300">{pass.passId}</td>
                  <td className="py-3 px-4 font-bold text-white">{pass.visitor}</td>
                  <td className="py-3 px-4">{pass.resident}</td>
                  <td className="py-3 px-4">{pass.purpose}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{pass.inTime}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      pass.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-white/10'
                    }`}>
                      {pass.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {pass.status === 'Active' ? (
                      <button
                        onClick={() => handleAction(`Marked Visitor Pass ${pass.passId} as CHECKED OUT`)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition-all"
                      >
                        Check-Out
                      </button>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Checked Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
