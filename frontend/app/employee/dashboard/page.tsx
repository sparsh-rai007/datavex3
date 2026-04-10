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
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Leave {
  id: string;
  start_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Howdy, {user?.firstName}!</h1>
                <p className="text-indigo-100 font-medium opacity-80 uppercase tracking-widest text-[10px]">Matrix Operator: {user?.employeeId}</p>
              </div>
            </div>
            
            <p className="text-xl font-medium text-indigo-50 max-w-md leading-relaxed mb-auto">
              Your workstation is optimized. You have <span className="font-black text-white decoration-4 underline decoration-white/20 underline-offset-4">{pendingLeaves.length} pending requests</span> awaiting admin synthesis.
            </p>

            <div className="flex gap-4 mt-8">
              <Link
                href="/employee/leaves"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-transform"
              >
                Go to Leave App
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="flex flex-col gap-6">
           <div className="flex-1 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                <p className="text-2xl font-black text-slate-900 leading-none mb-2">OPERATIONAL</p>
                <p className="text-xs text-emerald-600 font-bold">System synced 100%</p>
              </div>
           </div>

           <div className="flex-1 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sector</p>
                <p className="text-2xl font-black text-slate-900 leading-none mb-2">{user?.department}</p>
                <p className="text-xs text-slate-500 font-bold">Data Management Division</p>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Upcoming Leave', value: leaves.find(l => l.status === 'approved' && new Date(l.start_date) > new Date())?.start_date || 'None', icon: CalendarIcon, color: 'indigo' },
          { label: 'Performance', value: '98%', icon: TrendingUp, color: 'emerald' },
          { label: 'Total Leaves', value: leaves.length, icon: Clock, color: 'slate' },
          { label: 'Sync Score', value: 'A+', icon: Activity, color: 'indigo' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
              <p className="text-xl font-black text-slate-900 leading-none truncate max-w-[120px]">
                {typeof item.value === 'string' && item.value.includes('-') ? new Date(item.value).toLocaleDateString() : item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
