'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { UserSwitcher } from './user-switcher';
import { useUserSession } from './user-session-provider';
import { canAccessDashboard } from '@/lib/permissions';
import { MobileBottomNav } from './mobile-bottom-nav';
import { 
  Search, 
  GitBranch, 
  Laptop, 
  Building2, 
  LayoutDashboard,
  Megaphone,
  CalendarClock,
  Menu,
  X,
  Home,
  Workflow,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const pathname = usePathname();
  const { isAuthenticated, isDemoMode, currentUser } = useUserSession();
  // Dashboard is admins-and-authors only (demo mode bypasses for development);
  // the layout itself bounces everyone else.
  const showDashboard =
    isDemoMode || (isAuthenticated && canAccessDashboard(currentUser.permissions));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'processes' | 'operations' | null>(null);

  const navRef = useRef<HTMLDivElement>(null);

  // Close open dropdown when navigating or clicking outside
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isProcessesActive = 
    pathname === '/' || 
    pathname.startsWith('/process') || 
    pathname.startsWith('/system') || 
    pathname.startsWith('/organization');

  const isOperationsActive = 
    pathname.startsWith('/timeline') || 
    pathname.startsWith('/information');

  const isDashboardActive = pathname.startsWith('/dashboard');

  return (
    <>
      <header 
        className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200"
        style={{
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-glass-strong)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  فناوری
                </span>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--accent-border)'
                  }}
                >
                  MVP
                </span>
              </div>
            </div>
          </Link>

          {/* Categorized Desktop Navigation */}
          <nav 
            ref={navRef} 
            className="hidden md:flex items-center gap-1.5 lg:gap-2.5 text-xs lg:text-sm font-bold relative"
            style={{ color: 'var(--text-primary)' }}
          >
            {/* Category 1: فرایندها و سامانه‌ها (Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((prev) => (prev === 'processes' ? null : 'processes'))}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                  isProcessesActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/15 font-black shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-400/15'
                }`}
                aria-expanded={openDropdown === 'processes'}
              >
                <Workflow className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="whitespace-nowrap">فرایندها و سامانه‌ها</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                    openDropdown === 'processes' ? 'rotate-180 text-blue-600' : ''
                  }`} 
                />
              </button>

              {/* Processes Dropdown Card */}
              {openDropdown === 'processes' && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl p-2 z-50 border shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderColor: 'var(--border-glass)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="px-3 py-1.5 border-b mb-1" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-[11px] font-bold text-slate-400">
                      دایرکتوری دستورالعمل‌ها و ابزارها
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        pathname === '/' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 mt-0.5">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold whitespace-nowrap">کاتالوگ فرایندها</span>
                        <span className="block text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          فلوچارت‌ها، مستندات و گام‌های اجرایی
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/systems"
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        pathname.startsWith('/system') 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-600 mt-0.5">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold whitespace-nowrap">سامانه‌ها و نرم‌افزارها</span>
                        <span className="block text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          پرتال‌ها، وب‌سرویس‌ها و ابزارهای مهندسی
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/organizations"
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        pathname.startsWith('/organization') 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold whitespace-nowrap">سازمان‌ها و مراجع</span>
                        <span className="block text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          وزارتخانه‌ها، ادارات و ساختار سازمانی
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Category 2: رویدادها و اطلاعات (Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((prev) => (prev === 'operations' ? null : 'operations'))}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                  isOperationsActive
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/15 font-black shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-400/15'
                }`}
                aria-expanded={openDropdown === 'operations'}
              >
                <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">رویدادها و اطلاعات</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                    openDropdown === 'operations' ? 'rotate-180 text-amber-600' : ''
                  }`} 
                />
              </button>

              {/* Operations Dropdown Card */}
              {openDropdown === 'operations' && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl p-2 z-50 border shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderColor: 'var(--border-glass)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="px-3 py-1.5 border-b mb-1" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-[11px] font-bold text-slate-400">
                      تقویم اداری و انتشارات رسمی
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/timeline"
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        pathname.startsWith('/timeline') 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 mt-0.5">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold whitespace-nowrap">گاه‌شمار اجرایی سالانه</span>
                        <span className="block text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          تقویم جامع وظایف و فرایندهای ۱۲ ماه سال
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/information"
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        pathname.startsWith('/information') 
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/10 text-indigo-600 mt-0.5">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold whitespace-nowrap">اعلامیه‌ها و بخشنامه‌ها</span>
                        <span className="block text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          آخرین ابلاغیه‌ها، تغییرات سامانه‌ها و اسناد
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link: داشبورد مدیریت (authenticated/demo only) */}
            {showDashboard && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-150 whitespace-nowrap ${
                isDashboardActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/15 font-black shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/15'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">داشبورد</span>
            </Link>
            )}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search Trigger */}
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-muted)',
                }}
                title="جستجوی سریع"
              >
                <Search className="w-3.5 h-3.5" />
                <kbd 
                  className="px-1 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  /
                </kbd>
              </button>
            )}

            {/* User Session Switcher (Discord Bitfield) */}
            <UserSwitcher />

            {/* Theme Toggle Button (Light by default) */}
            <ThemeToggle />

            {/* Mobile Header Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              type="button"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-colors cursor-pointer"
              style={{
                background: isMobileMenuOpen ? 'var(--accent-soft)' : 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: isMobileMenuOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Categorized Drawer Panel */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          >
            {/* Section 1: فرایندها و دایرکتوری */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block px-2 mb-1.5">
                فرایندها و دایرکتوری سامانه‌ها
              </span>
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/15 font-black'
                      : 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'
                  }`}
                  style={{ color: pathname === '/' ? undefined : 'var(--text-primary)' }}
                >
                  <Home className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="whitespace-nowrap">کاتالوگ فرایندها</span>
                </Link>

                <Link
                  href="/systems"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname.startsWith('/system')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-400/15 font-black'
                      : 'hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10'
                  }`}
                  style={{ color: pathname.startsWith('/system') ? undefined : 'var(--text-primary)' }}
                >
                  <Laptop className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="whitespace-nowrap">سامانه‌ها و نرم‌افزارها</span>
                </Link>

                <Link
                  href="/organizations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname.startsWith('/organization')
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/15 font-black'
                      : 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'
                  }`}
                  style={{ color: pathname.startsWith('/organization') ? undefined : 'var(--text-primary)' }}
                >
                  <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="whitespace-nowrap">سازمان‌ها و مراجع</span>
                </Link>
              </div>
            </div>

            {/* Section 2: رویدادها و اطلاعات */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block px-2 mb-1.5">
                رویدادها، تقویم و اطلاعیه‌ها
              </span>
              <div className="flex flex-col gap-1">
                <Link
                  href="/timeline"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname.startsWith('/timeline')
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/15 font-black'
                      : 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                  style={{ color: pathname.startsWith('/timeline') ? undefined : 'var(--text-primary)' }}
                >
                  <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="whitespace-nowrap">گاه‌شمار اجرایی سالانه</span>
                </Link>

                <Link
                  href="/information"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname.startsWith('/information')
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/15 font-black'
                      : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10'
                  }`}
                  style={{ color: pathname.startsWith('/information') ? undefined : 'var(--text-primary)' }}
                >
                  <Megaphone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="whitespace-nowrap">اعلامیه‌ها و بخشنامه‌ها</span>
                </Link>
              </div>
            </div>

            {/* Section 3: مدیریت (authenticated/demo only) */}
            {showDashboard && (
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/dashboard')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/15 font-black'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
                style={{ color: pathname.startsWith('/dashboard') ? undefined : 'var(--text-primary)' }}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="whitespace-nowrap">داشبورد مدیریت</span>
              </Link>
            </div>
            )}
          </div>
        )}
      </header>

      {/* Floating Mobile Bottom Navigation Bar (Visible only on < lg screens) */}
      <MobileBottomNav />
    </>
  );
}
