'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/employee/login';

  useEffect(() => {
    if (!isLoginPage && !loading) {
      if (!isAuthenticated) {
        router.push('/employee/login');
      } else if (user?.role !== 'employee' && user?.role !== 'admin') {
         // If for some reason they have an invalid role, boot them
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, router, isLoginPage, user]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        <main className="flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
