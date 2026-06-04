'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '../app/public/datavex_Logo.png';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  ChevronDown, 
  Layers, 
  Anchor, 
  CreditCard, 
  Calculator, 
  Scale, 
  Users, 
  HeartPulse, 
  Compass, 
  CheckSquare, 
  Mic 
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface NavLink {
  href?: string;
  label: string;
  children?: { 
    href: string; 
    label: string;
    description?: string;
    icon?: any;
    iconBg?: string;
  }[];
  isMega?: boolean;
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProductsPageDelisted, setIsProductsPageDelisted] = useState(false);

  useEffect(() => {
    const checkPageVisibility = async () => {
      try {
        const response = await apiClient.getDelistedProducts();
        if (response?.success && response.delisted.includes('global_products_page')) {
          setIsProductsPageDelisted(true);
        }
      } catch (err) {
        console.error('Failed to verify products page visibility:', err);
      }
    };
    checkPageVisibility();
  }, []);

  // 👇 Detect public routes (NO auth calls here)
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/solutions') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/use-cases') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/newsletter') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/consultation') ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/employee/login");

  // 👇 Only load auth for non-public pages
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const logout = auth?.logout;


  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/solutions', label: 'Solutions' },
    {
      label: 'Company',
      children: [
        { href: '/about', label: 'About' },
        { href: '/careers', label: 'Careers' },
        { href: '/use-cases', label: 'Use Cases' },
      ],
    },
    { href: '/newsletter', label: 'Newsletter' },
    { href: '/blog', label: 'Blogs' },
    { href: '/contact', label: 'Contact' },
    { href: '/consultation', label: 'Consultation' },
  ];

  const activeNavLinks = navLinks.filter(
    (link) => !(link.label === 'Products' && isProductsPageDelisted)
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src={logo} 
              alt="Datavex Logo" 
              width={200} 
              height={56} 
              priority
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-6">
            {activeNavLinks.map((link) =>
              link.children ? (
                link.isMega ? (
                  <div key={link.label} className="relative group inline-flex items-center">
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer gap-1">
                      {link.label}
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:rotate-180 transition-transform duration-300" />
                    </span>

                    {/* Mega Dropdown Panel */}
                    <div className="absolute top-full -left-48 hidden group-hover:grid grid-cols-3 gap-3 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-100 rounded-2xl p-5 w-[760px] z-50 mt-1 origin-top transition-all duration-300 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                      <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-50 mb-1 text-left">
                        DataVex Product Ecosystem
                      </div>
                      {link.children.map((child) => {
                        const IconComponent = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group/item border border-transparent hover:border-slate-100 text-left"
                          >
                            {IconComponent && (
                              <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${child.iconBg} group-hover/item:scale-105 transition-transform duration-200`}>
                                <IconComponent className="w-4.5 h-4.5" />
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-gray-900 group-hover/item:text-primary-600 transition-colors">
                                {child.label}
                              </h4>
                              <p className="text-[10px] text-gray-500 leading-snug">
                                {child.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                      <div className="col-span-3 bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs mt-2 border border-slate-100/50 text-left">
                        <span className="text-slate-500 font-medium">Looking for customized AI solutions?</span>
                        <Link href="/contact" className="text-primary-600 font-bold hover:underline">
                          Talk to an expert &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={link.label} className="relative group inline-flex items-center">
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer gap-1">
                      {link.label}
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:rotate-180 transition-transform duration-300" />
                    </span>

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-md rounded-md py-2 w-44 z-50 mt-1 border border-gray-100 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                link.href && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href)
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
            {activeNavLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${isActive(link.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ) : (
                <div key={link.label} className="px-3 py-2 text-base font-medium text-gray-700 space-y-1">
                  <span className="block text-gray-900 font-semibold mb-1 text-left">{link.label}</span>
                  {(link.children || []).map((child: any) => {
                    const IconComp = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 pl-4 py-2 text-sm text-gray-600 hover:text-primary-600 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        {IconComp && (
                          <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${child.iconBg || 'bg-slate-50 text-slate-600'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-xs text-gray-900">{child.label}</span>
                          {child.description && (
                            <span className="text-[10px] text-gray-500 leading-tight">{child.description}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
