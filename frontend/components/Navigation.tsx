'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

interface NavLink {
  href?: string;
  label: string;
  children?: { href: string; label: string }[];
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 👇 Detect public routes (NO auth calls here)
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/solutions') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/use-cases') ||
   
    pathname.startsWith('/blog') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/consultation') ||
    pathname.startsWith("/admin/login");

  // 👇 Only load auth for non-public pages
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const logout = auth?.logout;


  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/solutions', label: 'Solutions' },
    {
      label: 'Company',
      children: [
        { href: '/about', label: 'About' },
        { href: '/careers', label: 'Careers' },
        { href: '/use-cases', label: 'Use Cases' },
      ],
    },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/consultation', label: 'Consultation' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">

     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            DATAVEX.ai
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-6">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative group inline-flex items-center">
  <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer">
    {link.label}
  </span>

  {/* Dropdown */}
  <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-md rounded-md py-2 w-44 z-50">

                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                link.href && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )
            )}
          </div>

          {/* Right side (Login / User Info) */}
          

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <div key={link.label} className="px-3 py-2 text-base font-medium text-gray-700">
                  {link.label}
                  {(link.children || []).map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block pl-6 py-1 text-sm text-gray-600 hover:text-primary-600"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="pt-4 space-y-2 border-t">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-primary-600"
            >
              Get Started
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-md text-center"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
