'use client';

import React from 'react';
import { useUserSession, DEMO_USERS } from '@/components/user-session-provider';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Shield, 
  KeyRound,
  Sparkles,
  Info
} from 'lucide-react';

export default function DashboardPermissionsPage() {
  const { currentUser, switchUser, isSuperAdmin } = useUserSession();

  const permissionItems = [
    { bit: Permissions.VIEW_PROCESSES, label: 'مشاهده فرایندها (VIEW)', code: '1 << 0', desc: 'دسترسی خواندن تمام کاتالوگ و گام‌های اجرایی' },
    { bit: Permissions.CREATE_PROCESSES, label: 'ثبت فرایند جدید (CREATE)', code: '1 << 1', desc: 'ایجاد فرایندهای جدید همراه با مراحل و فلوچارت' },
    { bit: Permissions.EDIT_PROCESSES, label: 'ویرایش فرایندها (EDIT)', code: '1 << 2', desc: 'تغییر محتوا، ویرایش مراحل، افزودن کدهای خطا و دیاگرام' },
    { bit: Permissions.DELETE_PROCESSES, label: 'حذف فرایندها (DELETE)', code: '1 << 3', desc: 'حذف دائمی فرایند از پایگاه داده سرور' },
    { bit: Permissions.MANAGE_STEPS, label: 'مدیریت مراحل و گام‌ها (STEPS)', code: '1 << 4', desc: 'جابجایی ترتیب گام‌ها، حذف و اضافه کردن مراحل' },
    { bit: Permissions.MANAGE_CATEGORIES, label: 'مدیریت سازمان‌ها (DEPARTMENTS)', code: '1 << 6', desc: 'ثبت، ویرایش و حذف نهادها و وزارتخانه‌ها' },
    { bit: Permissions.MANAGE_SYSTEMS, label: 'مدیریت سامانه‌ها (SYSTEMS)', code: '1 << 7', desc: 'ثبت و پیکربندی ابزارها و وب‌سایت‌های سازمانی' },
    { bit: Permissions.MANAGE_INFORMATION, label: 'مدیریت اطلاع‌رسانی (INFORMATION)', code: '1 << 10', desc: 'نوشتن و انتشار بخشنامه‌ها و دستورالعمل‌ها' },
    { bit: Permissions.ADMINISTRATOR, label: 'دسترسی کامل مدیر ارشد (ADMIN)', code: '1 << 30', desc: 'مجوز نامحدود و دسترسی سطح ریشه به تمام امکانات' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            نقش‌ها و ماتریس دسترسی‌های سازمانی
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مدیریت مجوزها بر پایه معماری پرچم بیتی سریع (Bitfield Flags) و تست زنده نقش‌ها
          </p>
        </div>
      </div>

      {/* Current Active User Status Card */}
      <div 
        className="glass-panel-strong rounded-3xl p-6 border shadow-lg"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{
                background: isSuperAdmin ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #2563eb, #7c3aed)'
              }}
            >
              {isSuperAdmin ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </span>
                <span 
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: isSuperAdmin ? 'var(--badge-rose-bg)' : 'var(--accent-soft)',
                    color: isSuperAdmin ? 'var(--badge-rose-text)' : 'var(--accent-primary)',
                  }}
                >
                  {isSuperAdmin ? '👑 مدیر ارشد سامانه' : currentUser.roleName}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block" dir="ltr">
                {currentUser.email} • شناسه: {currentUser.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl border bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300" dir="ltr">
              Bitmask: 0x{currentUser.permissions.toString(16).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Bitfield Checklist Grid */}
        <div className="py-6">
          <span className="text-xs font-bold text-slate-400 block mb-3">
            مجوزهای فعال برای حساب فعلی:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionItems.map((item) => {
              const hasPerm = hasPermission(currentUser.permissions, item.bit);
              return (
                <div 
                  key={item.bit}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                    hasPerm 
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 shadow-xs' 
                      : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-slate-900/30'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1" dir="ltr">{item.code}</div>
                  </div>
                  {hasPerm ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Role Switcher for Testing */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              تغییر سریع نقش جهت بررسی رفتار سامانه (User Switching):
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            با انتخاب هر کاربر، سشن در حافظه مرورگر تغییر کرده و محدودیت‌های دسترسی فوراً اعمال می‌شوند:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_USERS.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => switchUser(user.id)}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-500/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {user.roleName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1" dir="ltr">
                    {user.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
