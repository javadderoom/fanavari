'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { UserSwitcher } from './user-switcher';
import { useUserSession } from './user-session-provider';
import { Permissions } from '@/lib/permissions';
import { 
  Search, 
  GitBranch, 
  Laptop, 
  Building2, 
  LayoutDashboard,
  Megaphone
} from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  return (
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

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs xl:text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/information" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>اطلاعات و بخشنامه‌ها</span>
          </Link>

          <Link href="/systems" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-purple-500" />
            <span>نرم‌افزارها و ابزارها</span>
          </Link>

          <Link href="/organizations" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>سازمان‌ها</span>
          </Link>

          <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>داشبورد مدیریت</span>
          </Link>
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
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
              }}
              title="جستجوی سریع"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="px-1 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                /
              </kbd>
            </button>
          )}

          {/* User Session Switcher (Discord Bitfield) */}
          <UserSwitcher />

          {/* Theme Toggle Button (Light by default) */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
