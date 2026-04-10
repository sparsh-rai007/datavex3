'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Plus, Search, Building2, Mail, Hash, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CredentialsOverlay from '@/components/CredentialsOverlay';

interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  is_active: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Credentials Result
  const [credentials, setCredentials] = useState<{ id: string, pass: string } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
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
      setCredentials({ id: result.user.employeeId, pass: result.temporaryPassword });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', employeeId: '', department: '' });
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 font-medium">Manage your workforce and access levels.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} className="stroke-[3]" />
          ADD NEW EMPLOYEE
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Employees</p>
            <p className="text-2xl font-black text-slate-900">{employees.length}</p>
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full pl-16 pr-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest">Loading Employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-6 bg-slate-50 rounded-full text-slate-300">
              <Users size={64} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">No employees found</p>
              <p className="text-slate-500">Try adjusting your search or add a new employee.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">ID / Dept</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-sm text-slate-500 font-medium">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono font-bold text-slate-900">{emp.employee_id}</p>
                      <p className="text-sm text-slate-500 font-medium">{emp.department}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
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
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add New Employee</h2>
                  <p className="text-slate-500 font-medium mt-2">Create a new account for your staff member.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. john@datavex.ai"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Employee ID</label>
                      <input
                        required
                        type="text"
                        placeholder="EXP-001"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                      <input
                        required
                        type="text"
                        placeholder="Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-rose-600 bg-rose-50 p-4 rounded-xl text-sm font-bold text-center border border-rose-100">
                      {error}
                    </p>
                  )}

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
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'CREATE ACCOUNT'}
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
            employeeId={credentials.id}
            password={credentials.pass}
            onClose={() => setCredentials(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
