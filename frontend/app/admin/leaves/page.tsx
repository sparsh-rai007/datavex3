'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Mini Calendar Component
// ---------------------------------------------------------------------------

const MiniCalendar = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentMonth = start.getMonth();
  const currentYear = start.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(start);

  return (
    <div className="bg-white p-6 rounded-sm shadow-2xl border border-indigo-50 w-64">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
          {monthName} {currentYear}
        </p>
        <CalendarIcon size={14} className="text-slate-200" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-[8px] font-bold text-slate-300 uppercase">{d}</span>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(d => {
          const date = new Date(currentYear, currentMonth, d);
          const isSelected = date >= start && date <= end;
          return (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center text-[10px] rounded-full transition-all ${
                isSelected 
                  ? 'bg-indigo-600 text-white font-bold scale-110 z-10' 
                  : 'text-slate-400 font-medium'
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-indigo-50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
        <p className="text-[9px] font-bold text-slate-900/30 uppercase tracking-widest">Active Leave Period</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Admin Leaves Component
// ---------------------------------------------------------------------------

interface LeaveRequest {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminLeavesPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hoveredRequestId, setHoveredRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLeaves();
      setRequests(data.leaves);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await apiClient.updateLeaveStatus(id, status);
      fetchRequests();
    } catch (err) {
      console.error(`Failed to ${status} leave:`, err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req =>
    `${req.first_name} ${req.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full space-y-12 md:space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarIcon size={16} />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.4em]">Absence Synthesis Matrix</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-950 tracking-tight leading-none">
            Leave <span className="italic text-indigo-600">Archive</span>
          </h1>
          <p className="text-base md:text-lg text-slate-950/40 font-serif italic mt-4">Review and synchronize personnel departure requests.</p>
        </motion.div>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-950/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by identity or sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-20 pr-8 py-5 md:py-6 bg-white rounded-sm border border-indigo-50 focus:border-indigo-600 focus:outline-none font-serif italic text-lg md:text-xl transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-sm border border-indigo-50 shadow-sm">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-[10px] font-bold text-slate-950/30 uppercase tracking-[0.4em]">Synchronizing Records...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-32 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-slate-950/10">
              <CalendarIcon size={48} />
            </div>
            <p className="text-2xl font-serif italic text-slate-950">No Active Departure Requests</p>
          </div>
        ) : (
          <div className="overflow-x-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/30 border-b border-indigo-50">
                  <th className="px-6 md:px-10 py-6 text-[10px] font-bold text-slate-950/40 uppercase tracking-[0.3em]">Personnel Identity</th>
                  <th className="px-6 md:px-10 py-6 text-[10px] font-bold text-slate-950/40 uppercase tracking-[0.3em]">Absence Protocol</th>
                  <th className="px-6 md:px-10 py-6 text-[10px] font-bold text-slate-950/40 uppercase tracking-[0.3em]">Reason Horizon</th>
                  <th className="px-6 md:px-10 py-6 text-[10px] font-bold text-slate-950/40 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-6 md:px-10 py-6 text-[10px] font-bold text-slate-950/40 uppercase tracking-[0.3em] text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50/50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 md:px-10 py-8 relative">
                      <div 
                        className="flex items-center gap-6 cursor-help"
                        onMouseEnter={() => setHoveredRequestId(req.id)}
                        onMouseLeave={() => setHoveredRequestId(null)}
                      >
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-serif italic text-lg md:text-xl border border-indigo-100 group-hover:scale-110 transition-transform">
                          {req.first_name[0]}{req.last_name[0]}
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-serif font-medium text-slate-950 group-hover:text-indigo-600 transition-colors">{req.first_name} {req.last_name}</p>
                          <p className="text-[10px] font-bold text-slate-950/30 uppercase tracking-widest mt-1">{req.employee_id}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {hoveredRequestId === req.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute left-8 md:left-10 top-full z-[60] pointer-events-none"
                          >
                            <MiniCalendar startDate={req.start_date} endDate={req.end_date} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                    <td className="px-6 md:px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-xs md:text-sm text-slate-950 tracking-widest font-bold">
                          {new Date(req.start_date).toLocaleDateString('en-GB')}
                        </p>
                        <div className="flex items-center gap-2">
                          <ArrowRight size={10} className="text-indigo-200" />
                          <p className="font-mono text-xs md:text-sm text-slate-950 tracking-widest font-bold">
                            {new Date(req.end_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-8 max-w-xs">
                      <p className="text-sm text-slate-950/60 font-serif italic line-clamp-2 leading-relaxed">{req.reason}</p>
                    </td>
                    <td className="px-6 md:px-10 py-8">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] border ${
                        req.status === 'approved' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                        req.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-400' : 
                        'bg-indigo-50 border-indigo-50 text-slate-950/30'
                      }`}>
                        {req.status === 'approved' ? <CheckCircle2 size={12} /> :
                          req.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-10 py-8 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            disabled={!!processingId}
                            onClick={() => handleStatusUpdate(req.id, 'approved')}
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-950 text-white hover:bg-indigo-600 transition-all shadow-lg active:scale-90 disabled:opacity-50"
                            title="Approve Protocol"
                          >
                            {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={20} />}
                          </button>
                          <button
                            disabled={!!processingId}
                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-rose-100 text-rose-400 hover:bg-rose-50 transition-all active:scale-90 disabled:opacity-50"
                            title="Reject Protocol"
                          >
                            {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={20} />}
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-indigo-50 text-slate-950/10 ml-auto">
                          <Info size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

