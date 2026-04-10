'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployeeLoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'employee') {
      router.push('/employee/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);

    try {
      await login(data.email, data.password);
      // Redirect is handled by auth context or useEffect above
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600 rounded-3xl text-white mb-6 shadow-xl shadow-indigo-100">
            <Lock size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Staff Portal
          </h1>
          <p className="text-slate-500 font-medium">
            Enter your employee credentials to continue
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium outline-none"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          Forgot your credentials? Contact your <span className="font-bold text-slate-600 underline cursor-pointer">HR Administrator</span>
        </p>
      </motion.div>
    </div>
  );
}
