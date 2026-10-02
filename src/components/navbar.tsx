'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { 
  Compass, 
  Search, 
  GitBranch, 
  ShieldAlert, 
  Laptop, 
  Building2, 
  Sparkles 
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
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
                نسخه ۱.۰
              </span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              ناوبری بصری و هوشمند فرایندهای سازمانی و نرم‌افزاری
            </p>
          </div>
        </Link>

        {/* Center / Multi-Page Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>کاتالوگ فرایندها</span>
          </Link>

          <Link href="/systems" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-purple-500" />
            <span>نرم‌افزارها و ابزارها</span>
          </Link>

          <Link href="/organizations" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>سازمان‌ها و ادارات</span>
          </Link>

          <Link href="/errors" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>بانک خطایابی</span>
          </Link>

          <a href="/#flow-simulator" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>شبیه‌ساز زنده</span>
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger Button */}
          <button
            onClick={onSearchClick}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
            }}
            title="جستجوی هوشمند در تمام فرایندها"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">جستجو...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono shadow-xs"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-faint)'
              }}
            >
              /
            </kbd>
          </button>

          {/* Theme Toggle Button (Light by default) */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
