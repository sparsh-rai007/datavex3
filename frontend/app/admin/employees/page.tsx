'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import {
  Plus,
  Search,
  Hash,
  Loader2,
  Users,
  Info,
  ArrowRight,
  ShieldCheck,
  Binary
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CredentialsOverlay from '@/components/CredentialsOverlay';
import PersonnelCalendarModal from '@/components/PersonnelCalendarModal';

// ---------------------------------------------------------------------------
// Employees Page Component
// ---------------------------------------------------------------------------

interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  is_active: boolean;
}

interface Leave {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function EmployeesPage() {
  const { user: adminUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ id: string, pass: string } | null>(null);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await apiClient.getLeaves();
      setAllLeaves(data.leaves);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getEmployees();
      setEmployees(data.employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await apiClient.createEmployee(formData);
      setCredentials({ id: formData.email, pass: result.temporaryPassword });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', department: '' });
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-950 font-sans selection:bg-indigo-600/20 pb-20">
      <main className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-950 tracking-tight leading-none">
              Personnel <span className="italic text-indigo-600">Archive</span>
            </h1>
            <p className="text-lg text-slate-900/40 font-serif italic mt-4 leading-relaxed">
              Synchronize new neural records and manage architecture access levels.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-4 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500 stroke-[3]" />
            Synchronize Personnel
          </motion.button>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-900/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-20 pr-8 py-5 bg-white rounded-2xl border border-indigo-100/50 focus:border-indigo-600 focus:outline-none font-serif italic text-lg transition-all shadow-sm focus:shadow-xl focus:shadow-indigo-100/30"
            />
          </div>
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-indigo-100/50 shadow-sm flex items-center gap-6 px-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Hash size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-950/30 uppercase tracking-widest leading-none">Total Records</p>
              <p className="text-3xl font-serif font-medium text-slate-950 leading-none mt-1 tracking-tighter">{employees.length.toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[2rem] border border-indigo-100/50 shadow-xl shadow-indigo-100/50 overflow-hidden">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-[0.4em] animate-pulse">Synchronizing Matrix...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-32 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-slate-900/5 shadow-inner">
                <Users size={48} />
              </div>
              <div>
                <p className="text-2xl font-serif italic text-slate-950">No Personnel Found</p>
                <p className="text-slate-900/40 font-serif italic mt-2 max-w-sm mx-auto">Adjust your search parameters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-indigo-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-950/40 uppercase tracking-[0.3em]">Employee Name</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-950/40 uppercase tracking-[0.3em]">Department</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-950/40 uppercase tracking-[0.3em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-950/40 uppercase tracking-[0.3em]">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/50">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-serif italic text-xl border border-indigo-100 relative group-hover:scale-105 transition-transform">
                            {emp.first_name[0]}{emp.last_name[0]}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                          </div>
                          <div>
                            <p className="text-lg font-serif font-medium text-slate-950 group-hover:text-indigo-600 transition-colors tracking-tight">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[10px] font-black text-slate-950/30 uppercase tracking-widest mt-1">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1.5 underline decoration-indigo-200 underline-offset-4">{emp.department}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border ${
                          emp.is_active ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-400'
                        }`}>
                          {emp.is_active ? 'Synchronized' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsCalendarOpen(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-indigo-50 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-90"
                        >
                          <Info size={18} className="stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Employee Modal - Reusing the "Leave Modal" compact architecture */}
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
                  <div className="mb-8 text-center">
                    
                    <h2 className="text-3xl font-serif font-medium text-slate-950 mb-3 tracking-tight leading-none uppercase">Add <span className="italic text-indigo-600">Employee</span></h2>
                    <p className="text-slate-900/40 font-serif italic text-base">Establish a new record in the matrix.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Full Name Identity</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-indigo-50/30 rounded-xl border border-indigo-50 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 font-serif italic text-lg transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Email Horizon</label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. john@synthesis.arch"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-6 py-4 bg-indigo-50/30 rounded-xl border border-indigo-50 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 font-serif italic text-lg transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2">Deployment Sector</label>
                      <input
                        required
                        type="text"
                        placeholder="Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-8 py-6 bg-indigo-50/30 rounded-xl border border-indigo-100 focus:border-indigo-600 focus:outline-none font-serif italic text-lg transition-all"
                      />
                    </div>

                    {error && (
                      <p className="text-rose-600 bg-rose-50 p-4 rounded-xl text-[10px] font-black border border-rose-100 uppercase tracking-widest text-center">
                        {error}
                      </p>
                    )}

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
                        className="flex-[2] py-4 bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                          <>
                            Confirm Record <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
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

        {/* Success Credentials Overlay */}
        <AnimatePresence>
          {credentials && (
            <CredentialsOverlay
              email={credentials.id}
              password={credentials.pass}
              onClose={() => setCredentials(null)}
            />
          )}
        </AnimatePresence>

        {/* Personnel Calendar Modal */}
        <PersonnelCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => {
            setIsCalendarOpen(false);
            setSelectedEmployee(null);
          }}
          employeeName={selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : ''}
          leaves={allLeaves.filter(l => l.user_id === selectedEmployee?.id)}
        />
      </main>
    </div>
  );
}

