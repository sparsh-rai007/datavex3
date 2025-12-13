'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/posts', label: 'Posts', icon: '📝' },
    { href: '/admin/leads', label: 'Leads', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '💼' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { href: '/admin/blogs', label: 'Blogs', icon: '📚' },
    { href: '/admin/settings/social', label: 'Social Integrations', icon: '🌐' },
    { href: '/admin/users', label: 'Users', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-4">
        <Link href="/admin/dashboard" className="text-2xl font-bold text-primary-600">
          DATAVEX
        </Link>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
              isActive(item.href) ? 'bg-primary-50 border-r-2 border-primary-600 text-primary-600' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}




