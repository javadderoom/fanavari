'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  ChevronLeft, 
  ExternalLink, 
  LayoutDashboard,
  Workflow,
  Building2,
  Laptop,
  Megaphone,
  FolderTree,
  ShieldCheck,
  Home
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  '/dashboard': {
    title: 'نمای کلی داشبورد',
    subtitle: 'آمار و شاخص‌های کلیدی پایگاه داده فرایندها و سامانه‌ها',
    icon: LayoutDashboard,
  },
  '/dashboard/processes': {
    title: 'مدیریت فرایندها',
    subtitle: 'کاتالوگ دستورالعمل‌ها، فلوچارت‌ها، مراحل و کدهای خطا',
    icon: Workflow,
  },
  '/dashboard/organizations': {
    title: 'سازمان‌ها و مراجع',
    subtitle: 'نهادها، وزارتخانه‌ها، ادارات متولی و اطلاعات تماس',
    icon: Building2,
  },
  '/dashboard/systems': {
    title: 'سامانه‌ها و نرم‌افزارها',
    subtitle: 'پرتال‌ها، وب‌سرویس‌ها، ابزارهای تخصصی و آدرس‌های رسمی',
    icon: Laptop,
  },
  '/dashboard/information': {
    title: 'مرکز اطلاع‌رسانی و بخشنامه‌ها',
    subtitle: 'اطلاعیه‌ها، بخشنامه‌های اداری، راهنماها و مقالات دانشی',
    icon: Megaphone,
  },
  '/dashboard/scopes-categories': {
    title: 'حوزه‌ها و دسته‌بندی‌های موضوعی',
    subtitle: 'مدیریت سطوح دسته‌بندی پویا، حوزه‌های سازمانی و دسته‌بندی عمومی',
    icon: FolderTree,
  },
  '/dashboard/permissions': {
    title: 'نقش‌ها و ماتریس دسترسی‌ها',
    subtitle: 'تنظیمات دسترسی مبتنی بر پرچم بیتی (Bitfield) و سوییچ نقش‌ها',
    icon: ShieldCheck,
  },
};

export function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const current = PAGE_TITLES[pathname] || {
    title: 'پنل مدیریت ادمین',
    subtitle: 'سامانه راهنمای جامع فرایندهای فناوری',
    icon: LayoutDashboard,
  };

  const IconComponent = current.icon;

  return (
    <header 
      className="sticky top-0 z-20 w-full border-b transition-colors"
      style={{
        borderColor: 'var(--border-glass)',
        backgroundColor: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left side: Hamburger button (mobile) + Breadcrumbs & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{ borderColor: 'var(--border-glass)' }}
            aria-label="باز کردن منوی سایدبار"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-8 h-8 rounded-xl hidden sm:flex items-center justify-center border shadow-xs shrink-0"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
            >
              <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="hidden md:inline">خانه</span>
                </Link>
                <ChevronLeft className="w-3 h-3" />
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  داشبورد
                </Link>
                {pathname !== '/dashboard' && (
                  <>
                    <ChevronLeft className="w-3 h-3" />
                    <span className="font-bold text-slate-600 dark:text-slate-200 truncate">
                      {current.title}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-black truncate" style={{ color: 'var(--text-primary)' }}>
                {current.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right side: Quick Action to Public Site */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs hover:scale-105"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-secondary)',
            }}
            title="مشاهده نمای عمومی پرتال در تب جدید"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>مشاهده پرتال عمومی</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
