'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { LogOut, Bell, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply auth guard to login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Only redirect if not on login page and not authenticated
    if (!isLoginPage && !loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router, isLoginPage]);

  // Show loading only for protected pages
  if (!isLoginPage && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
          />
          <p className="mt-4 text-gray-600 font-medium tracking-wide">Loading Archive Matrix...</p>
        </div>
      </div>
    );
  }

  // Block access to protected pages if not authenticated
  if (!isLoginPage && !isAuthenticated) {
    return null;
  }

  // Login page doesn't need sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fixed Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search across sectors..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white"></div>
              <Bell size={20} />
            </button>
            
            <div className="h-6 w-[1px] bg-gray-100 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">
                  {user?.role}
                </p>
              </div>
              
              <div className="group relative">
                <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || '?'}
                </button>
                
                {/* Actions Dropdown */}
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Operator</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <button className="w-full px-4 py-3 text-left text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-3">
                    <User size={16} /> Strategy Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut size={16} /> Disconnect Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Global Content View */}
        <main className="flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
