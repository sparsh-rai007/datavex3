'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import {
  Lock,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeSettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Neural key updated successfully. Your other sessions have been terminated for security.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-950 font-sans selection:bg-indigo-600/20 pb-20">
      <main className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-950 tracking-tight leading-none">
            Security <span className="italic text-indigo-600">Synthesis</span>
          </h1>
          <p className="text-lg text-slate-900/40 font-serif italic mt-4 leading-relaxed">
            Update your neural access keys and manage session architecture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Settings Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2.5rem] border border-indigo-100/50 shadow-xl shadow-indigo-100/30"
          >
            <div className="mb-10 flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <Lock size={20} className="stroke-[2.5]" />
               </div>
               <div>
                  <h2 className="text-xl font-serif font-medium text-slate-950">Rotate Access Key</h2>
                  <p className="text-[10px] font-black text-slate-950/30 uppercase tracking-[0.2em] mt-1">Personnel Authentication Update</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Current Access Key</label>
                <input
                  required
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-indigo-50/20 rounded-xl border border-indigo-50 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 font-serif italic transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">New Access Key</label>
                <input
                  required
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-indigo-50/20 rounded-xl border border-indigo-50 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 font-serif italic transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Confirm New Key</label>
                <input
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-indigo-50/20 rounded-xl border border-indigo-50 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 font-serif italic transition-all"
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-xl text-[10px] font-black border border-rose-100 uppercase tracking-widest"
                  >
                    <ShieldAlert size={16} />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl text-[10px] font-black border border-emerald-100 uppercase tracking-widest"
                  >
                    <CheckCircle2 size={16} />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-5 bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Confirm Rotation <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
             <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30">
                <ShieldCheck size={32} className="mb-6 opacity-40" />
                <h3 className="text-2xl font-serif italic mb-4">Security Protocol</h3>
                <p className="text-indigo-50/70 text-sm leading-relaxed mb-6">
                  Standard architecture rotation requires a secure 6+ character key. Updating your key will terminate all other active session tokens for this record.
                </p>
                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                   <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-300"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-200 text-indigo-600 flex items-center justify-center text-[10px] font-black">+4</div>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Verified Records</span>
                </div>
             </div>

             <div className="p-8 border border-indigo-100 rounded-[2.5rem] bg-indigo-50/30">
                <h4 className="text-[10px] font-black text-slate-950/20 uppercase tracking-[0.3em] mb-4">Access Level</h4>
                <div className="flex items-center gap-3">
                   <span className="text-xl font-serif font-medium text-slate-950 capitalize">{user?.role}</span>
                   <span className="px-3 py-1 bg-white border border-indigo-50 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">Verified</span>
                </div>
             </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
