'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { 
  Permissions, 
  PERMISSION_LABELS, 
  ROLE_PRESETS, 
  PermissionKey, 
  hasPermission,
  addPermission,
  removePermission
} from '@/lib/permissions';
import { 
  Code2, 
  Database, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Layers, 
  Binary, 
  GitBranch, 
  Server, 
  Workflow, 
  CheckCircle2, 
  Home, 
  ArrowLeft,
  Lock,
  ExternalLink,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useUserSession } from '@/components/user-session-provider';

export default function DevDocsPage() {
  const { currentUser, switchUser, loginAsSuperAdmin, isSuperAdmin } = useUserSession();

  // Super Admin Login Gate State
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const success = loginAsSuperAdmin(passwordInput.trim());
    if (!success) {
      setError('رمز عبور مدیر ارشد نادرست است. لطفاً از رمز "admin" استفاده کنید یا روی ورود سریع کلیک نمایید.');
    } else {
      setPasswordInput('');
    }
    setIsSubmitting(false);
  };

  const handleQuickUnlock = () => {
    setError('');
    loginAsSuperAdmin('admin');
  };

  // Live Bitfield Playground State
  const [selectedBitfield, setSelectedBitfield] = useState<number>(
    Permissions.VIEW_PROCESSES | Permissions.CREATE_PROCESSES | Permissions.EDIT_PROCESSES
  );

  const toggleBit = (permValue: number) => {
    if ((selectedBitfield & permValue) === permValue) {
      setSelectedBitfield(removePermission(selectedBitfield, permValue));
    } else {
      setSelectedBitfield(addPermission(selectedBitfield, permValue));
    }
  };

  const applyPreset = (bitfield: number) => {
    setSelectedBitfield(bitfield);
  };

  const permissionKeys = Object.keys(Permissions).filter(
    (k) => k !== 'NONE'
  ) as PermissionKey[];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      {!isSuperAdmin ? (
        /* Super Admin Access Gate (Locked State) */
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-8" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>خانه</span>
            </Link>
            <span>/</span>
            <span className="text-amber-600 font-bold">منطقه حفاظت‌شده مهندسی (/dev)</span>
          </nav>

          {/* Super Admin Lock Gate Card */}
          <div className="glass-panel-strong rounded-3xl p-8 sm:p-12 border shadow-2xl relative overflow-hidden"
            style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}
          >
            {/* Ambient Lighting Accents */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto space-y-6">
              {/* Animated Lock Shield Badge */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-amber-300 border border-amber-500/30">
                  0x7FFFFFFF
                </div>
              </div>

              {/* Security Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>RESTRICTED ACCESS • SUPER ADMIN REQUIRED</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                  احراز هویت مدیر ارشد سامانه
                </h1>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  صفحه شناسنامه معماری، مشخصات کانتینر داکر، متغیرهای فنی دیتابیس و شبیه‌ساز بیت‌فیلد در محیط امنیتی سطح ۱ قرار دارند. دسترسی به این بخش مستلزم مجوز <strong>مدیر ارشد (Super Admin)</strong> است.
                </p>
              </div>

              {/* Current Active User Status Card */}
              <div className="w-full p-4 rounded-2xl border text-right space-y-2 text-xs"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">کاربر و نشست جاری:</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {currentUser.roleName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>{currentUser.name}</span>
                  <span className="font-mono text-[11px]">{currentUser.email}</span>
                </div>
                <div className="pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-slate-500">مجوز دیسکورد (Bitfield):</span>
                  <span className="font-mono font-bold text-rose-500 flex items-center gap-1">
                    <span>0x{currentUser.permissions.toString(16).toUpperCase()} (فاقد بیت 30 ADMINISTRATOR)</span>
                  </span>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordLogin} className="w-full space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="رمز عبور مدیر ارشد (پیش‌فرض: admin)"
                    className="w-full px-4 py-3 pl-11 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: error ? '#ef4444' : 'var(--border-glass)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? "مخفی‌سازی رمز" : "نمایش رمز"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold text-right">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff'
                    }}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>تأیید و ورود با رمز عبور</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickUnlock}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all border hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>ورود مستقیم (1-Click Super Admin)</span>
                  </button>
                </div>
              </form>

              {/* Back to Home Link */}
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  <span>بازگشت به کاتالوگ عمومی فرایندها</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Super Admin Authenticated State */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>خانه</span>
            </Link>
            <span>/</span>
            <span className="text-blue-600">کنسول توسعه و معماری (/dev)</span>
          </nav>

          {/* Super Admin Session Toolbar & Lock Tester */}
          <div className="mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>احراز هویت شده به عنوان مدیر ارشد (Super Admin)</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20">0x7FFFFFFF</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  تمامی ابزارهای معماری، مانیتور داکر، کدهای دیتابیس و شبیه‌ساز دسترسی فعال هستند.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => switchUser('usr-viewer')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                title="تست قفل صفحه با تغییر نقش به پرسنل عادی"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>تست قفل صفحه (سوییچ به Viewer)</span>
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl mb-12"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>ENVIRONMENT: DEVELOPMENT • ROUTE: /dev</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                  شناسنامه فنی، معماری و تصمیمات مهندسی سامانه فناوری
                </h1>
                <p className="text-sm sm:text-base font-medium leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
                  مستندات شفاف تمام تکنولوژی‌های زیرساخت، کدنویسی، امنیت بیتی دیسکورد، داکر، پایگاه داده PostgreSQL و استدلال انتخاب هر فناوری.
                </p>
              </div>

              <div className="p-4 rounded-2xl border text-xs space-y-1.5 shrink-0"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>داکر دیتابیس: متصل و فعال (Port 5433)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono">
                  <span>Postgres 16 Alpine • Prisma 7.10.0</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono">
                  <span>Next.js 16.3.8 • React 19 • TypeScript</span>
                </div>
              </div>
            </div>
          </div>

        {/* Section 1: Discord-Style Bitwise Permission System (Live Interactive Playground) */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
                مدل امنیت و سطوح دسترسی (Security Architecture)
              </span>
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                سیستم دسترسی بیتی (Discord-Style Bitfield Permissions)
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/10 text-rose-600">
              پیاده‌سازی شده با عملگرهای Bitwise
            </span>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 border shadow-lg space-y-6"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="text-xs sm:text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong>دلیل انتخاب سیستم بیتی دیسکورد:</strong> در معماری سنتی RBAC، برای اتصال هر کاربر به نقش‌ها و دسترسی‌ها به ۳ تا ۴ جدول مجزا با JOINهای سنگین دیتابیس نیاز است. در مدل دیسکورد، تمام دسترسی‌ها داخل <strong>یک عدد صحیح ۳۱ بیتی</strong> فشرده می‌شوند. بررسی دسترسی در کسری از نانوثانیه با عملگر <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">(user.permissions & bit) === bit</code> انجام شده و هیچ سرباری به سرور تحمیل نمی‌کند. بیت ۳۰ ام (<code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">ADMINISTRATOR</code>) تمام محدودیت‌ها را به صورت خودکار Bypass می‌کند.
              </p>
            </div>

            {/* Role Preset Quick Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-bold text-slate-500">پری‌ست‌های نقش:</span>
              <button
                type="button"
                onClick={() => applyPreset(ROLE_PRESETS.SUPER_ADMIN.bitfield)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                👑 Super Admin (0x7FFFFFFF)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(ROLE_PRESETS.PROCESS_MANAGER.bitfield)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                💼 Process Manager (0xDF)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(ROLE_PRESETS.PROCESS_EDITOR.bitfield)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                ✏️ Editor (0x37)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                👁️ Viewer (0x01)
              </button>
            </div>

            {/* Bitfield Status Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Decimal (مقدار عددی در دیتابیس):</span>
                <span className="text-base font-bold text-emerald-400">{selectedBitfield}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Hexadecimal (مبنای ۱۶):</span>
                <span className="text-base font-bold text-amber-400">0x{selectedBitfield.toString(16).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Binary (بیت‌های فعال):</span>
                <span className="text-xs font-bold text-cyan-300 break-all">
                  0b{selectedBitfield.toString(2).padStart(31, '0')}
                </span>
              </div>
            </div>

            {/* Bit Checkboxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissionKeys.map((key) => {
                const permValue = Permissions[key];
                const isSet = (selectedBitfield & permValue) === permValue;
                const meta = PERMISSION_LABELS[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleBit(permValue)}
                    className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isSet ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: isSet ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSet}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {meta.fa}
                        </span>
                        <code className="text-[10px] text-slate-400 font-mono">
                          (1 &lt;&lt; {Math.log2(permValue)})
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Technology Stack & Engineering Rationale */}
        <section className="mb-14">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              انتخاب‌های فنی و معماری نرم‌افزار
            </span>
            <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              پشته تکنولوژی (Technology Stack) و دلایل مهندسی
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tech 1: Next.js 16 + React 19 */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm space-y-3" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                    N
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      Next.js 16 (App Router) + React 19
                    </h3>
                    <span className="text-xs text-slate-400">فریم‌ورک اصلی فرانت‌اند و بک‌اند</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600">
                  Core Framework
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                <strong>دلایل انتخاب:</strong> سازگاری نیتیو با سرورلس Vercel، رندر چندصفحه‌ای ترکیبی (Server Components برای لود بدون تاخیر صفحات و Client Components برای فلوچارت‌های تعاملی)، بهینه‌سازی خودکار فونت و تصاویر، و سئو عالی.
              </p>
            </div>

            {/* Tech 2: PostgreSQL in Docker Container */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm space-y-3" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      PostgreSQL 16 (Docker Container)
                    </h3>
                    <span className="text-xs text-slate-400">پایگاه داده رابطه‌ای ایزوله روی پورت ۵۴۳۳</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600">
                  DevOps & Data
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                <strong>دلایل انتخاب:</strong> قابلیت اطمینان ACID کامل برای روابط فرایندها، مراحل و ماتریس خطایابی. راه‌اندازی با کانتینر مجزای <code className="px-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">fanavari-postgres</code> روی پورت ۵۴۳۳ تا تداخلی با سایر پروژه‌های سیستم ایجاد نکند و در دپلوی Vercel به راحتی به Neon Postgres متصل شود.
              </p>
            </div>

            {/* Tech 3: Prisma 7 ORM with Driver Adapter */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm space-y-3" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    ▲P
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      Prisma 7 + Driver Adapter Pattern
                    </h3>
                    <span className="text-xs text-slate-400">دسترسی به داده و مایگریشن با @prisma/adapter-pg</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-600">
                  ORM & Migrations
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                <strong>دلایل انتخاب:</strong> تایپ‌سیفتی ۱۰۰ درصدی در کدهای TypeScript، تولید خودکار مایگریشن‌ها، و استفاده از الگوی جدید Driver Adapter که در پریزما ۷ جایگزین اتصال مستقیم شده و سرعت فوق‌العاده‌ای در محیط‌های Serverless دارد.
              </p>
            </div>

            {/* Tech 4: Tailwind CSS v4 + Glassmorphism */}
            <div className="glass-card rounded-3xl p-6 border shadow-sm space-y-3" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      Tailwind CSS v4 & Glassmorphism Design
                    </h3>
                    <span className="text-xs text-slate-400">طراحی شیشه‌ای، دوحالته (لایت و دارک)، RTL کامل</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600">
                  Design System
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                <strong>دلایل انتخاب:</strong> تم دیفالت لایت با شیشه‌های کریستالی روشن و تم شب با افکت نئونی، متغیرهای استاندارد CSS، تایپوگرافی زیبا با فونت وزیرمتن و جداسازی جهات علائم ریاضی و کدها در محیط راست‌چین.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Database Models & ERD Summary */}
        <section className="mb-14">
          <div className="mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              مدل‌سازی داده‌ها (Entity Architecture)
            </span>
            <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              جداول دیتابیس در PostgreSQL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-blue-600 block mb-1">Table: User</span>
              <p className="text-xs text-slate-500">
                مدیریت کاربران، ایمیل یکتا، رول و فیلد <code className="font-mono text-slate-700 dark:text-slate-300">permissions (Int)</code> بیتی دیسکورد.
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-purple-600 block mb-1">Table: Process</span>
              <p className="text-xs text-slate-500">
                رکورد اصلی هر فرایند اداری یا نرم‌افزاری، متادیتا، اسکوپ، دسته‌بندی و اتصال به مراحل.
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-emerald-600 block mb-1">Table: Step</span>
              <p className="text-xs text-slate-500">
                مراحل متوالی یا انشعابی فلوچارت، متن مارک‌داون، مسیر منوها، فیلدهای کپی‌پیست و موقعیت بوم.
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-rose-600 block mb-1">Table: ErrorGuide</span>
              <p className="text-xs text-slate-500">
                ماتریس خطایابی هر گام: کدهای ارور، علت ریشه‌ای، راه‌حل گام‌به‌گام و واحد پاسخگو.
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-cyan-600 block mb-1">Table: SystemTool</span>
              <p className="text-xs text-slate-500">
                کاتالوگ نرم‌افزارها (فیگما، گیت، اکسل) و پرتال‌های حاکمیتی (مودیان، تأمین اجتماعی).
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
              <span className="text-xs font-mono font-bold text-amber-600 block mb-1">Table: SavedSession</span>
              <p className="text-xs text-slate-500">
                ذخیره سشن کاربر، داده‌های Scratchpad موقت و مراحل تکمیل‌شده برای پیگیری مجدد.
              </p>
            </div>
          </div>
        </section>
      </main>
      )}

      <Footer />
    </div>
  );
}
