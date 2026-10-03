'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { UserSwitcher } from './user-switcher';
import { MobileBottomNav } from './mobile-bottom-nav';
import { 
  Search, 
  GitBranch, 
  Laptop, 
  Building2, 
  LayoutDashboard,
  Megaphone,
  Menu,
  X,
  Home
} from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: '/information',
      label: 'اعلامیه‌ها و اطلاعیه‌ها',
      icon: Megaphone,
      iconColor: 'text-indigo-500',
      isActive: pathname.startsWith('/information'),
    },
    {
      href: '/systems',
      label: 'سامانه‌ها و ابزارها',
      icon: Laptop,
      iconColor: 'text-purple-500',
      isActive: pathname.startsWith('/system'),
    },
    {
      href: '/organizations',
      label: 'سازمان‌ها',
      icon: Building2,
      iconColor: 'text-blue-500',
      isActive: pathname.startsWith('/organization'),
    },
    {
      href: '/dashboard',
      label: 'داشبورد مدیریت',
      icon: LayoutDashboard,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      isActive: pathname.startsWith('/dashboard'),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200"
        style={{
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-glass-strong)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  فناوری
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
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

          {/* Center Navigation Links (Visible on desktop & tablet screens) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-xs xl:text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-150 ${
                    link.isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-black shadow-xs'
                      : 'hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.iconColor}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Trigger */}
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-muted)',
                }}
                title="جستجوی سریع"
              >
                <Search className="w-3.5 h-3.5" />
                <kbd className="px-1 py-0.5 rounded text-[10px] font-mono"
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

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/'
                    ? 'text-blue-600 bg-blue-500/10 font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 text-blue-500" />
                <span>صفحه اصلی</span>
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      link.isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-black'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${link.iconColor}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Floating Mobile Bottom Navigation Bar (Visible only on < lg screens) */}
      <MobileBottomNav />
    </>
  );
}
