'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, Heart, Database, ShieldCheck, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t mt-20 transition-colors duration-200"
      style={{
        borderColor: 'var(--border-glass)',
        backgroundColor: 'var(--bg-glass-strong)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  سامانه فناوری
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  آماده برای Vercel & Neon
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مستندسازی و اجرای هوشمند و بصری فرایندهای سازمانی
              </p>
            </div>
          </div>

          {/* Technology Badges */}
          <div className="flex items-center flex-wrap gap-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>پایگاه داده: Neon Postgres</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>پیکربندی: Prisma 7</span>
            </span>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)'
            }}
          >
            <span>بازگشت به بالا</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Navigation Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-bold"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="text-slate-400 font-normal">دسترسی سریع:</span>
            <Link href="/information" className="hover:text-blue-600 transition-colors">
              اعلامیه‌ها و اطلاعیه‌ها
            </Link>
            <Link href="/systems" className="hover:text-blue-600 transition-colors">
              سامانه‌ها و نرم‌افزارها
            </Link>
            <Link href="/organizations" className="hover:text-blue-600 transition-colors">
              سازمان‌ها
            </Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              داشبورد مدیریت
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p>© {new Date().getFullYear()} سامانه فناوری. تمامی حقوق برای سازمان محفوظ است.</p>
          <div className="flex items-center gap-1">
            <span>طراحی شده با دقت و زیبایی بصری</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
