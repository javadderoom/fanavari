'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserSession } from '@/components/user-session-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserSwitcher } from '@/components/user-switcher';
import { 
  LayoutDashboard, 
  Workflow, 
  Building2, 
  Laptop, 
  Megaphone, 
  FolderTree, 
  ShieldCheck, 
  ExternalLink, 
  GitBranch, 
  ChevronLeft,
  X,
  Award,
  Users
} from 'lucide-react';

interface AdminSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  href: string;
  exact?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  color: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function AdminSidebar({ isOpenMobile = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentUser, isSuperAdmin } = useUserSession();

  const navGroups: NavGroup[] = [
    {
      group: 'نظارت و مدیریت',
      items: [
        {
          href: '/dashboard',
          exact: true,
          label: 'نمای کلی داشبورد',
          icon: LayoutDashboard,
          badge: 'مرکزی',
          color: 'text-indigo-500',
        },
        {
          href: '/dashboard/runs',
          label: 'ممیزی و کارتابل ناظران',
          icon: Award,
          badge: 'ISO 9001',
          color: 'text-emerald-500',
        },
      ],
    },
    {
      group: 'دایرکتوری و سامانه‌ها',
      items: [
        {
          href: '/dashboard/processes',
          label: 'مدیریت فرایندها',
          icon: Workflow,
          color: 'text-blue-500',
        },
        {
          href: '/dashboard/organizations',
          label: 'سازمان‌ها و مراجع',
          icon: Building2,
          color: 'text-emerald-500',
        },
        {
          href: '/dashboard/systems',
          label: 'نرم‌افزارها و سامانه‌ها',
          icon: Laptop,
          color: 'text-purple-500',
        },
      ],
    },
    {
      group: 'محتوا و ساختار',
      items: [
        {
          href: '/dashboard/information',
          label: 'اطلاعیه‌ها و بخشنامه‌ها',
          icon: Megaphone,
          color: 'text-cyan-500',
        },
        {
          href: '/dashboard/scopes-categories',
          label: 'حوزه‌ها و دسته‌بندی‌ها',
          icon: FolderTree,
          color: 'text-amber-500',
        },
      ],
    },
    {
      group: 'دسترسی و امنیت',
      items: [
        {
          href: '/dashboard/users',
          label: 'کاربران سامانه',
          icon: Users,
          color: 'text-sky-500',
        },
        {
          href: '/dashboard/permissions',
          label: 'نقش‌ها و دسترسی‌ها',
          icon: ShieldCheck,
          color: 'text-rose-500',
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 lg:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                پنل مدیریت
              </span>
              <span 
                className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-primary)',
                }}
              >
                ADMIN
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">
              سامانه یکپارچه فرایندهای فناوری
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="بستن سایدبار"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Status Card */}
      <div className="p-4 border-b mx-3 my-2 rounded-2xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-400">کاربر لاگین شده:</span>
          <span 
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{
              background: isSuperAdmin ? 'var(--badge-rose-bg)' : 'var(--accent-soft)',
              color: isSuperAdmin ? 'var(--badge-rose-text)' : 'var(--accent-primary)',
            }}
          >
            {isSuperAdmin ? '👑 مدیر ارشد' : currentUser.roleName}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {currentUser.name}
        </div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono" dir="ltr">
          {currentUser.email}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1.5">
              {group.group}
            </span>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span 
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t space-y-2 mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Switcher & Theme */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0 flex-1">
            <UserSwitcher dropdownAlign="right" dropdownDirection="up" compact />
          </div>
          <ThemeToggle />
        </div>

        {/* Return to Public Portal */}
        <Link
          href="/"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>مشاهده پرتال عمومی</span>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside 
        className="hidden lg:flex flex-col w-64 shrink-0 border-l h-screen sticky top-0 transition-colors z-30"
        style={{
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={onCloseMobile}
        >
          <aside 
            className="w-72 max-w-[85vw] h-full border-l transition-transform animate-in slide-in-from-right duration-200"
            style={{
              borderColor: 'var(--border-glass)',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
