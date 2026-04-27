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
  ArrowRight,
  List as ListIcon,
  LayoutGrid as GridIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarView from './CalendarView';

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
    <div className="bg-white p-6 rounded-[4px] border border-[#EEF2FF] shadow-[0_30px_60px_rgba(0,0,0,0.1)] w-[240px]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.2em] leading-none">
          {monthName} {currentYear}
        </p>
        <span className="text-[#4F46E5] text-[10px]">◈</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[9px] font-bold text-[#020617]/20 uppercase py-1">{d}</span>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(d => {
          const date = new Date(currentYear, currentMonth, d);
          const isSelected = date >= start && date <= end;
          return (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center text-[10px] rounded-full transition-all py-1.5 ${
                isSelected 
                  ? 'bg-[#4F46E5] text-white font-bold' 
                  : 'text-[#020617] font-medium'
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-[#FBF9F7] flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
        <p className="text-[8px] font-bold text-[#020617]/30 uppercase tracking-[0.1em]">Selected Absence Span</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Admin Leaves Component
// ---------------------------------------------------------------------------

export interface LeaveRequest {
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

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
      await fetchRequests();
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
    <div className="min-h-screen bg-[#FBF9F7] selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <header className="pt-[60px] px-8 md:px-20 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
              <CalendarIcon size={16} />
            </div>
            <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.4em] leading-none">Absence Matrix</span>
          </div>
          <h1 className="text-5xl md:text-[64px] font-serif font-normal text-[#020617] tracking-[-0.02em] leading-none">
            {viewMode === 'list' ? 'Leave' : 'Absence'} <span className="italic text-[#4F46E5]">{viewMode === 'list' ? 'Requests' : 'Registry'}</span>
          </h1>
          <p className="text-base md:text-[18px] text-[#020617]/40 font-serif italic mt-4 max-w-xl">
            {viewMode === 'list' 
              ? 'Review and synchronize personnel departure requests.' 
              : 'Chronological mapping of organizational absence across the timeline.'}
          </p>
        </motion.div>

        <div className="flex items-center gap-1 p-1 bg-[#EEF2FF]/50 rounded-full border border-[#EEF2FF]">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-[#020617] text-white shadow-lg' : 'text-[#4F46E5] hover:bg-[#EEF2FF]'}`}
          >
            <GridIcon size={14} />
            Registry
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-[#020617] text-white shadow-lg' : 'text-[#4F46E5] hover:bg-[#EEF2FF]'}`}
          >
            <ListIcon size={14} />
            Archive
          </button>
        </div>
      </header>

      <div className="px-8 md:px-20 pb-10">
        <div className="relative group max-w-[600px]">
          <Search className="absolute left-[24px] top-1/2 -translate-y-1/2 text-[#020617]/20 group-focus-within:text-[#4F46E5] transition-colors pointer-events-none" size={20} />
          <input
            type="text"
            placeholder="Search by identity or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white rounded-[4px] border border-[#EEF2FF] focus:border-[#4F46E5] focus:outline-none font-serif italic text-xl transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      <div className="px-8 md:px-20">
        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <CalendarView leaves={filteredRequests} loading={loading} />
            </motion.div>
          ) : (
            <motion.main 
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[4px] border border-[#EEF2FF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
            >
              {loading ? (
                <div className="p-32 flex flex-col items-center justify-center gap-8">
                  <Loader2 className="animate-spin text-[#4F46E5]" size={40} />
                  <p className="text-[10px] font-bold text-[#020617]/30 uppercase tracking-[0.4em]">Synchronizing Records...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-32 flex flex-col items-center justify-center text-center gap-8">
                  <div className="w-24 h-24 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#020617]/5 rotate-12">
                    <CalendarIcon size={56} />
                  </div>
                  <p className="text-3xl font-serif italic text-[#020617]">No Active Departure Requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-[#EEF2FF]/30 border-b border-[#EEF2FF]">
                        <th className="px-10 py-5 text-[10px] font-bold text-[#020617]/40 uppercase tracking-[0.3em]">Employee Name</th>
                        <th className="px-10 py-5 text-[10px] font-bold text-[#020617]/40 uppercase tracking-[0.3em]">Dates</th>
                        <th className="px-10 py-5 text-[10px] font-bold text-[#020617]/40 uppercase tracking-[0.3em]">Reason</th>
                        <th className="px-10 py-5 text-[10px] font-bold text-[#020617]/40 uppercase tracking-[0.3em]">Status</th>
                        <th className="px-10 py-5 text-[10px] font-bold text-[#020617]/40 uppercase tracking-[0.3em] text-right">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2FF]/50 text-[#020617]">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-[#EEF2FF]/5 transition-colors group">
                          <td className="px-10 py-6">
                            <div 
                              className="flex items-center gap-6 cursor-pointer relative"
                              onMouseEnter={() => setHoveredRequestId(req.id)}
                              onMouseLeave={() => setHoveredRequestId(null)}
                            >
                              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-serif italic text-xl border border-[#E0E7FF] group-hover:scale-105 transition-transform">
                                {req.first_name[0]}{req.last_name[0]}
                              </div>
                              <div>
                                <p className="text-xl font-serif font-medium text-[#020617]">{req.first_name} {req.last_name}</p>
                                <p className="text-[10px] font-bold text-[#020617]/30 uppercase tracking-[0.1em] mt-1">{req.employee_id} / {req.department.toUpperCase()}</p>
                              </div>
                              
                              <AnimatePresence>
                                {hoveredRequestId === req.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                    className="absolute left-full ml-10 top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
                                  >
                                    <MiniCalendar startDate={req.start_date} endDate={req.end_date} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col gap-0.5">
                              <p className="font-mono text-[13px] font-bold tracking-[0.1em]">
                                {new Date(req.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                              <div className="text-[10px] text-[#E0E7FF] leading-none ml-1">↓</div>
                              <p className="font-mono text-[13px] font-bold tracking-[0.1em]">
                                {new Date(req.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            </div>
                          </td>
                          <td className="px-10 py-6 max-w-[240px]">
                            <p className="text-sm text-[#020617]/60 font-serif italic leading-[1.5] line-clamp-2">
                              {req.reason}
                            </p>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                              req.status === 'approved' ? 'bg-[#EEF2FF] border-[#E0E7FF] text-[#4F46E5]' :
                              req.status === 'rejected' ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#F43F5E]' : 
                              'bg-[#F8F7F4] border-[#F1F1EF] text-[#020617]/30'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            {req.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  disabled={!!processingId}
                                  onClick={() => handleStatusUpdate(req.id, 'approved')}
                                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[#020617] text-white hover:bg-[#4F46E5] transition-all disabled:opacity-50"
                                >
                                  {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                </button>
                                <button
                                  disabled={!!processingId}
                                  onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                  className="w-12 h-12 flex items-center justify-center rounded-full border border-[#FFE4E6] text-[#F43F5E] hover:bg-[#FFF1F2] transition-all disabled:opacity-50"
                                >
                                  {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={20} />}
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F8F7F4] text-[#020617]/10 ml-auto">
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
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
