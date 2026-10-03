'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Megaphone, 
  Laptop, 
  Building2, 
  LayoutDashboard 
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'خانه', icon: Home, exact: true },
  { href: '/information', label: 'اعلامیه‌ها', icon: Megaphone, matchPrefix: '/information' },
  { href: '/systems', label: 'سامانه‌ها', icon: Laptop, matchPrefix: '/system' },
  { href: '/organizations', label: 'سازمان‌ها', icon: Building2, matchPrefix: '/organization' },
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard, matchPrefix: '/dashboard' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="منوی ناوبری موبایل"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-200 select-none"
      style={{
        borderColor: 'var(--border-glass)',
        backgroundColor: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 relative group ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span
                  className="absolute -top-1 w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm shadow-blue-500/50"
                  aria-hidden="true"
                />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/10 dark:bg-blue-400/15 scale-105 shadow-inner'
                    : 'bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
