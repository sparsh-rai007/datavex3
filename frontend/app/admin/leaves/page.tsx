'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Calendar, CheckCircle2, XCircle, Clock, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h1>
        <p className="text-slate-500 font-medium">Review and manage employee leave requests.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest">Loading Requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-6 bg-slate-50 rounded-full text-slate-300">
              <Calendar size={64} />
            </div>
            <p className="text-xl font-black text-slate-900">No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Dates</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                          {req.first_name[0]}{req.last_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{req.first_name} {req.last_name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{req.department} • {req.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 text-sm">
                        {new Date(req.start_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        to {new Date(req.end_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-sm text-slate-600 font-medium line-clamp-2">{req.reason}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {req.status === 'approved' ? <CheckCircle2 size={12} /> :
                          req.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={!!processingId}
                            onClick={() => handleStatusUpdate(req.id, 'approved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Approve"
                          >
                            {processingId === req.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          </button>
                          <button
                            disabled={!!processingId}
                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Reject"
                          >
                            {processingId === req.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                          </button>
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
