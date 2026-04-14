'use client';

import { useState, ElementType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Calendar,
  Library,
  Globe,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/newsletter', label: 'Daily Newsletter', icon: Mail },
  { href: '/admin/blogs', label: 'Blogs', icon: Library },
  { href: '/admin/settings/social', label: 'Social Integrations', icon: Globe },
  { href: '/admin/users', label: 'Users', icon: User },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/leaves', label: 'Leaves', icon: Calendar },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white shadow-sm border-r sticky top-0 h-screen flex flex-col z-50 selection:bg-indigo-100 selection:text-indigo-900"
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

              <span className="text-xl font-black text-gray-900 tracking-tight">
                DATAVEX
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

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                />
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>


    </motion.aside>
  );
}
