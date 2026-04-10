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
  Binary
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

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-[#fcf8f7] border-r border-indigo-100/30 h-screen flex flex-col z-50 sticky top-0 shadow-2xl shadow-indigo-100/20"
    >
      {/* Header / Logo */}
      <div className="p-8 flex items-center justify-between overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Binary size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif font-medium text-slate-950 tracking-tight leading-none uppercase">
                  SYNTHESIS
                </span>
               
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-indigo-50 rounded-full transition-colors text-slate-900/20 hover:text-indigo-600"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-8 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all group
                ${active
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                  : 'text-slate-950/40 hover:bg-indigo-50/50 hover:text-slate-950'}
              `}
            >
              <item.icon
                size={18}
                className={`flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-950/20 group-hover:text-indigo-600'}`}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${active ? 'text-white' : ''}`}
                >
                  {item.label}
                </motion.span>
              )}

              {active && !isCollapsed && (
                <motion.div
                  layoutId="active-indicator-side"
                  className="absolute right-4 w-1 h-1 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-indigo-50">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-950/40 hover:bg-rose-50 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-[0.2em]
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Terminate Session</span>}
        </button>
      </div>
    </motion.aside>
  );
}

