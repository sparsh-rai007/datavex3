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
  Briefcase
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
  { href: '/employee/leaves', label: 'Leave App', icon: Calendar },
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
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white shadow-sm border-r sticky top-0 h-screen flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                DX
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tight">
                STAFF
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Profile Summary if not collapsed */}
      {!isCollapsed && (
        <div className="px-6 py-4 mb-4">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Active Operator</p>
            <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] font-bold text-indigo-600 truncate">{user?.employeeId}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3.5 py-3.5 rounded-xl transition-all group
                ${active
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon
                size={20}
                className={`flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold whitespace-nowrap text-xs tracking-wide uppercase"
                >
                  {item.label}
                </motion.span>
              )}

              {active && (
                <motion.div
                  layoutId="active-pill-employee"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-xs uppercase tracking-widest
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
