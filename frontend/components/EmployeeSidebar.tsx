'use client';

import { useState, ElementType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Binary,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

const navItems: NavItem[] = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/leaves', label: 'Leave Archive', icon: Calendar },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '88px' : '280px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white border-r border-indigo-50/50 h-screen flex flex-col z-50 sticky top-0 shadow-[20px_0_50px_-30px_rgba(79,70,229,0.05)]"
    >
      {/* Editorial Header */}
      <div className="p-8 pb-12 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 group"
              >
                
                <div className="flex flex-col">
                  <span className="text-xl font-serif font-medium text-slate-950 tracking-tighter leading-none">
                    Employee
                  </span>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-1 opacity-50"></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 flex items-center justify-center hover:bg-indigo-50 rounded-lg transition-all text-slate-300 hover:text-indigo-600 border border-transparent hover:border-indigo-100"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-2 py-4 bg-slate-50 rounded-2xl border border-indigo-50/50 flex items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black text-slate-950/20 uppercase tracking-widest leading-none mb-1">Authenticated As</p>
               <p className="text-sm font-serif font-medium text-slate-950 truncate capitalize">{user?.firstName || 'Personnel'}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group
                ${active
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20'
                  : 'text-slate-950/40 hover:bg-slate-50 hover:text-slate-950'}
              `}
            >
              <item.icon
                size={18}
                className={`flex-shrink-0 transition-colors stroke-[2.5] ${active ? 'text-white' : 'text-slate-950/20 group-hover:text-indigo-600'}`}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}

              {active && !isCollapsed && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Termination */}
      <div className="p-6 mt-auto">
        

        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-4 px-4 py-5 rounded-2xl text-slate-950/40 hover:bg-rose-50 hover:text-rose-500 transition-all group
            ${isCollapsed ? 'justify-center border border-transparent hover:border-rose-100' : 'border border-transparent hover:border-rose-100'}
          `}
        >
          <LogOut size={18} className="stroke-[2.5]" />
          {!isCollapsed && (
            <span className="font-black text-[10px] uppercase tracking-[0.3em]">Terminate Session</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
