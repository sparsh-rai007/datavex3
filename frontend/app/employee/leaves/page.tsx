'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronDown,
  X,
  AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Main Application Component
// ---------------------------------------------------------------------------

interface Leave {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  leave_type: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function LeaveAppPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState<Leave | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: ''
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLeaves();
      setLeaves(data.leaves);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.submitLeaveRequest(leaveForm);
      setLeaveForm({ startDate: '', endDate: '', reason: '', leaveType: '' });
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      console.error('Failed to submit leave:', err);
      alert(err.response?.data?.error || 'Failed to submit leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateClick = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    setLeaveForm({
      startDate: dateString,
      endDate: dateString,
      reason: '',
      leaveType: ''
    });
    setIsModalOpen(true);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const formatYMD = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border-r border-b border-indigo-100/30 bg-slate-50/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateTime = date.getTime();
      const dateString = formatYMD(date);

      const dayLeaves = leaves.filter(l => {
        const start = new Date(l.start_date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(l.end_date);
        end.setHours(0, 0, 0, 0);
        return start.getTime() <= dateTime && end.getTime() >= dateTime;
      });

      const isToday = todayTime === dateTime;
      const isPast = dateTime < todayTime;

      const hasLeave = dayLeaves.length > 0;

      days.push(
        <motion.div
          key={dateString}
          whileHover={{ backgroundColor: '#f5f7ff', opacity: 0.8 }}
          onClick={hasLeave ? () => setSelectedLeaveDetail(dayLeaves[0]) : () => handleDateClick(date)}
          className={`h-12 p-2 border-r border-b border-indigo-100/30 transition-colors relative group cursor-pointer ${hasLeave ? 'bg-rose-50/80' :
            isToday ? 'bg-indigo-50/50' : 'bg-white'
            }`}
        >
          <span className={`text-sm font-serif ${hasLeave ? 'text-rose-600 font-medium' :
            isToday ? 'text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-4' : 'text-slate-900/40'
            }`}>
            {day.toString().padStart(2, '0')}
          </span>

          <div className="mt-1 flex flex-wrap gap-1">
            {dayLeaves.map(l => (
              <div
                key={l.id}
                className={`w-1.5 h-1.5 rounded-full ${l.status === 'approved' ? 'bg-rose-600' :
                  l.status === 'rejected' ? 'bg-blue-600' : 'bg-amber-400'
                  }`}
              />
            ))}
          </div>

          {!hasLeave && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} className="text-indigo-600" />
            </div>
          )}
        </motion.div>
      );
    }

    return days;
  };

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const calculateDays = (start: string, end: string) => {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const yearLeaves = leaves.filter(l => new Date(l.start_date).getFullYear() === currentYear);
    const approvedYearLeaves = yearLeaves.filter(l => l.status === 'approved');

    return {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      pending: leaves.filter(l => l.status === 'pending').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      otherUsed: approvedYearLeaves
        .filter(l => l.leave_type !== 'Sick Leave')
        .reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0),
      sickUsed: approvedYearLeaves
        .filter(l => l.leave_type === 'Sick Leave')
        .reduce((acc, l) => acc + calculateDays(l.start_date, l.end_date), 0),
    };
  }, [leaves]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-950 font-sans selection:bg-indigo-600/20 pb-20">
      <main className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Branded Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >

            <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-950 mb-6 tracking-tight leading-[1.05]">
              Leave <span className="italic">Management</span>
            </h1>
            <p className="text-lg text-slate-900/60 font-serif italic leading-relaxed">
              {user?.firstName || 'Elena'}, request a leave by selecting a date on the calendar below.
            </p>
          </motion.div>

        </div>

        {/* Policy Alert System */}
        {(stats.otherUsed >= 12 || stats.sickUsed >= 5) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center gap-6"
          >
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
              <Info size={28} />
            </div>
            <div>
              <h4 className="text-xl font-serif font-medium text-rose-900 mb-1">Leave Limit Reached</h4>
              <p className="text-sm font-serif italic text-rose-600/80 leading-relaxed">
                {stats.otherUsed >= 12 && stats.sickUsed >= 5
                  ? "You have reached your annual limit for both Other Leaves (12 days) and Sick Leaves (5 days)."
                  : stats.otherUsed >= 12
                    ? "You have reached your annual limit of 12 days for other leaves."
                    : "You have reached your annual limit of 5 sick leave days."
                } Please consult your manager for further applications.
              </p>
            </div>
          </motion.div>
        )}

        {/* Editorial Calendar Architecture */}
        <div className="mb-24 bg-white border border-indigo-100 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100/50">
          <div className="flex items-center justify-between p-6 border-b border-indigo-50">
            <div className="flex items-center gap-6">
              <h3 className="text-2xl font-serif italic text-slate-950 tracking-tighter">
                {currentMonth.toLocaleString('default', { month: 'long' })} <span className="not-italic font-light text-slate-900/20">{currentMonth.getFullYear()}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="p-3 hover:bg-indigo-50 rounded-full transition-colors text-slate-900/40 hover:text-indigo-600"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="p-3 hover:bg-indigo-50 rounded-full transition-colors text-slate-900/40 hover:text-indigo-600"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-950/30 border-r border-b border-indigo-50/50 last:border-r-0 bg-slate-50/30">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          {/* Calendar Legend */}
          <div className="p-6 bg-slate-50/50 border-t border-indigo-50 flex flex-wrap gap-8 justify-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">On Leave (Approved)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending Request</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rejected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-rose-50 border border-rose-100" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past / Range</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Editorial Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[
            { label: 'Other Leaves', value: stats.otherUsed, limit: 12, unit: 'Days', icon: CheckCircle2, color: 'indigo-600' },
            { label: 'Sick Leave', value: stats.sickUsed, limit: 5, unit: 'Days', icon: Clock, color: 'indigo-600/40' },
            { label: 'Declined', value: stats.rejected, unit: 'Rec', icon: XCircle, color: 'rose-400' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-indigo-50 flex flex-col justify-between group hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-100/20"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-slate-950/40 uppercase tracking-[0.2em]">{stat.label}</span>
                <stat.icon size={16} className={`text-${stat.color.startsWith('indigo') ? 'indigo-600' : stat.color.startsWith('rose') ? 'rose-400' : 'slate-950'} opacity-40`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-serif font-light leading-none tracking-tighter ${stat.limit && stat.value >= stat.limit ? 'text-rose-600' : 'text-slate-950'}`}>
                  {stat.value.toString().padStart(2, '0')}
                  {stat.limit && <span className="text-2xl text-slate-200 ml-1">/{stat.limit.toString().padStart(2, '0')}</span>}
                </span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Feed - Technical List */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-8">
              <h2 className="text-3xl font-serif font-medium italic text-slate-950 tracking-tight">
                Leave History
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[10px] font-black text-slate-900/40 uppercase tracking-widest">Active</span>
              </div>
            </div>

            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6 border border-dashed border-indigo-200 rounded-[2.5rem] bg-indigo-50/10">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.3em]">Loading Records...</p>
              </div>
            ) : leaves.length === 0 ? (
              <div className="py-32 text-center border border-dashed border-indigo-200 rounded-[2.5rem] bg-indigo-50/10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <CalendarIcon size={32} className="text-slate-900/10" />
                </div>
                <h3 className="text-2xl font-serif italic text-slate-950 mb-2">No Leave Requests Found</h3>
                <p className="text-slate-900/40 font-serif italic max-w-xs mx-auto">You haven't made any leave requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave, index) => (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-8 rounded-[2rem] border border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/10 transition-all"
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${leave.status === 'approved' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                        leave.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                        {leave.status === 'approved' ? <CheckCircle2 size={24} /> :
                          leave.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-2xl font-serif font-medium text-slate-950 mb-2 group-hover:text-indigo-600 transition-colors break-all line-clamp-1">
                          <span className="text-indigo-600/50 mr-2">[{leave.leave_type}]</span>
                          {leave.reason}
                        </h4>
                        <p className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] flex items-center gap-2 flex-wrap">
                          <CalendarIcon size={12} className="text-indigo-600/40" />
                          {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <ArrowRight size={10} className="text-indigo-600/30 mx-1" />
                          {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full border ${leave.status === 'approved' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                        leave.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-50 border-slate-100 text-slate-900/30'
                        }`}>
                        {leave.status}
                      </span>
                      <button
                        onClick={() => setSelectedLeaveDetail(leave)}
                        className="w-10 h-10 flex border border-indigo-50 items-center justify-center rounded-full text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none"
                      >
                        <Info size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Policy & Insights */}
          <div className="lg:col-span-4 space-y-12">
            <section className="bg-slate-950 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full translate-x-16 -translate-y-16 blur-3xl group-hover:bg-indigo-600/30 transition-colors duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <ShieldCheck size={20} className="text-indigo-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Leave Policy</h3>
                </div>
                <p className="text-2xl font-serif italic leading-relaxed mb-12 text-white/90">
                  "All leave requests must be submitted 48 hours in advance."
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40 leading-relaxed">Annual leave allowance: 12 Days</p>
                  </li>

                </ul>
              </div>
            </section>


          </div>
        </div>
      </main>

      {/* Leave Request Modal - Editorial Style */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-indigo-50"
            >
              <div className="p-8 md:p-10">
                <div className="mb-10 text-center">

                  <h2 className="text-3xl font-serif font-medium text-slate-950 mb-3 tracking-tight leading-none">Request <span className="italic">Leave</span></h2>
                  <p className="text-slate-900/40 font-serif italic text-base">Specify your leave dates and the reason for your absence.</p>
                </div>

                <form onSubmit={handleLeaveSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 split-inputs">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Start Date</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-6 py-4 bg-indigo-50/30 rounded-xl border border-indigo-50 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-serif italic text-lg transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">End Date</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-6 py-4 bg-indigo-50/30 rounded-xl border border-indigo-50 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-serif italic text-lg transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Leave Type</label>
                    <div className="relative">
                      <select
                        required
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                        className="w-full px-6 py-4 bg-indigo-50/30 rounded-xl border border-indigo-50 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-serif italic text-lg transition-all appearance-none pr-12"
                      >
                        <option value="" disabled>Choose Leave Type</option>
                        <option value="Vacation">Vacation</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Personal">Personal</option>
                        <option value="Maternity/Paternity">Maternity/Paternity</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400/50" size={20} />
                    </div>
                  </div>

                  {leaveForm.leaveType !== '' && leaveForm.leaveType !== 'Sick Leave' && stats.otherUsed >= 12 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
                    >
                      <Info className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-[11px] font-serif italic text-rose-600 leading-relaxed">
                        Notice: You have reached your annual limit of 12 days for other leaves. Further requests may be subject to additional review or deduction from other allowances.
                      </p>
                    </motion.div>
                  )}

                  {leaveForm.leaveType === 'Sick Leave' && stats.sickUsed >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
                    >
                      <Info className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-[11px] font-serif italic text-rose-600 leading-relaxed">
                        Notice: You have reached your annual limit of 5 sick leave days. Please ensure you have a medical certificate ready for upload.
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Reason for Absence</label>
                    <textarea
                      required
                      placeholder="e.g. Vacation, Sick leave..."
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      rows={3}
                      className="w-full px-6 py-4 bg-indigo-50/30 rounded-[1.25rem] border border-indigo-50 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 font-serif italic text-lg transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-slate-950/40 font-black uppercase tracking-[0.3em] text-[10px] hover:text-slate-950 transition-all border border-transparent hover:border-indigo-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl hover:bg-slate-950 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                          Apply <ArrowRight size={18} className="stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Leave Detail Modal - Admin Style Sync */}
      <AnimatePresence>
        {selectedLeaveDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeaveDetail(null)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-[0_24px_54px_rgba(0,0,0,0.18)] border border-[#EEF2FF] overflow-hidden"
            >
              <div className="p-4 flex items-center justify-end border-b border-[#FBF9F7]">
                <button
                  onClick={() => setSelectedLeaveDetail(null)}
                  className="p-2 hover:bg-[#FBF9F7] rounded-full text-[#020617]/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start gap-5">
                  <div className={`w-4 h-4 rounded-sm mt-1.5 shrink-0 ${selectedLeaveDetail.status === 'approved' ? 'bg-[#4F46E5]' :
                    selectedLeaveDetail.status === 'rejected' ? 'bg-[#F43F5E]' :
                      'bg-[#D97706]'
                    }`} />
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-[#020617]">
                      {selectedLeaveDetail.leave_type || 'General Leave'} Details
                    </h3>
                    <p className="text-sm font-serif italic text-[#020617]/40 mt-1">
                      {new Date(selectedLeaveDetail.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {selectedLeaveDetail.start_date !== selectedLeaveDetail.end_date && ` — ${new Date(selectedLeaveDetail.end_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 py-6 border-y border-[#FBF9F7] my-2">
                  <div>
                    <p className="text-[9px] font-bold text-[#020617]/30 uppercase tracking-[0.2em] mb-1.5">Other Leaves</p>
                    <p className={`text-xl font-serif font-medium ${stats.otherUsed >= 12 ? 'text-rose-500' : 'text-[#4F46E5]'}`}>
                      {stats.otherUsed.toString().padStart(2, '0')} <span className="text-xs italic text-[#020617]/20">/ 12</span>
                    </p>
                  </div>
                  <div className="w-px h-10 bg-[#FBF9F7]" />
                  <div>
                    <p className="text-[9px] font-bold text-[#020617]/30 uppercase tracking-[0.2em] mb-1.5">Sick Absence</p>
                    <p className={`text-xl font-serif font-medium ${stats.sickUsed >= 5 ? 'text-rose-500' : 'text-[#D97706]'}`}>
                      {stats.sickUsed.toString().padStart(2, '0')} <span className="text-xs italic text-[#020617]/20">/ 05</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-5 text-sm text-[#020617]/60">
                    <AlignLeft size={18} className="shrink-0 text-[#020617]/20" />
                    <p className="font-serif italic leading-relaxed">
                      "{selectedLeaveDetail.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#020617]/40">
                    <CalendarIcon size={18} className="shrink-0 text-[#020617]/20" />
                    <span>{selectedLeaveDetail.leave_type || 'General Leave'} Category</span>
                  </div>

                  <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#020617]/40">
                    <Clock size={18} className="shrink-0 text-[#020617]/20" />
                    <span>Status: <span className={
                      selectedLeaveDetail.status === 'approved' ? 'text-[#4F46E5]' :
                        selectedLeaveDetail.status === 'rejected' ? 'text-[#F43F5E]' :
                          'text-[#D97706]'
                    }>{selectedLeaveDetail.status}</span></span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setSelectedLeaveDetail(null)}
                    className="w-full py-4 bg-[#FBF9F7] text-[#020617]/40 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-all"
                  >
                    Dismiss Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

