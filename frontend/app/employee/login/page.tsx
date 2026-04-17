'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

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
      await login(data.email, data.password, 'employee');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] px-4 font-sans selection:bg-indigo-600/20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Editorial Header */}
        <div className="text-center mb-12">
          
          
          <h1 className="text-5xl md:text-6xl font-serif font-medium text-slate-950 tracking-tight leading-none mb-6">
            Staff <span className="italic">Login</span>
          </h1>
          
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-indigo-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full translate-x-16 -translate-y-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2"
              >
                Mail-ID
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-950/10 group-focus-within:text-indigo-600 transition-colors" size={20} />
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
                  className="w-full pl-16 pr-8 py-5 bg-indigo-50/20 border border-indigo-50/50 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all font-serif italic text-lg"
                  placeholder="name@datavex.ai"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[10px] text-rose-600 font-black uppercase tracking-widest ml-2">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <label
                htmlFor="password"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950/30 ml-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-950/10 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className="w-full pl-16 pr-8 py-5 bg-indigo-50/20 border border-indigo-50/50 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all font-serif italic text-lg"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[10px] text-rose-600 font-black uppercase tracking-widest ml-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform stroke-[3]" />
                </>
              )}
            </button>
          </form>
        </div>
        
       
      </motion.div>
    </div>
  );
}
