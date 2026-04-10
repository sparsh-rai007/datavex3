'use client';

import { useState, useEffect } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Leave {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function LeaveAppPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
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
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err) {
      console.error('Failed to submit leave:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 font-medium">Apply for time off and track your absences.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} className="stroke-[3]" />
          APPLY FOR LEAVE
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: stats.total, icon: FileText, color: 'indigo' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'emerald' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'rose' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarDays className="text-indigo-600" />
            Applied Leaves
          </h2>

          {loading ? (
            <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Fetching history...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
              <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                <CalendarIcon size={64} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">No leaves on record</p>
                <p className="text-slate-500">Your absence history will appear here once you apply.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave, index) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${
                      leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      leave.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {leave.status === 'approved' ? <CheckCircle2 size={24} /> :
                        leave.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 truncate max-w-[200px]">{leave.reason}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                        {new Date(leave.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date(leave.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                        leave.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        leave.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {leave.status}
                      </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Mini-Calendar / Info */}
        <div className="space-y-6">
           <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-x-10 -translate-y-10" />
              <h3 className="text-xl font-black mb-2 relative z-10">Policy Notice</h3>
              <p className="text-slate-400 text-sm font-medium relative z-10 leading-relaxed mb-6">
                All leave requests must be submitted at least 48 hours in advance for approval.
              </p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  Max 15 annual leaves
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  Medical leaves require proof
                </li>
              </ul>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 mb-6">Absence Insights</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-600">Approved rate</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000" 
                    style={{ width: `${stats.total ? (stats.approved / stats.total) * 100 : 0}%` }} 
                  />
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="mb-10 text-center">
                  <div className="inline-flex p-4 bg-indigo-50 rounded-3xl text-indigo-600 mb-4">
                    <Plus size={32} className="stroke-[3]" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Request Leave</h2>
                  <p className="text-slate-500 font-medium mt-2">Specify your dates and reason for leave.</p>
                </div>

                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Leave</label>
                    <textarea
                      required
                      placeholder="e.g. Family vacation, medical appointment, etc."
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      rows={4}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium resize-none outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'SUBMIT REQUEST'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
