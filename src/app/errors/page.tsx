import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbErrorGuides } from '@/lib/db-service';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'بانک جامع خطایابی و عیب‌یابی فرایندها | سامانه فرآیندنما',
  description: 'فهرست کامل کدهای خطا، علل وقوع و راه‌حل‌های تست‌شده برای فرایندهای اداری و نرم‌افزاری',
};

export default async function ErrorsDirectoryPage() {
  const allErrors = await getDbErrorGuides();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600">بانک خطایابی و استثناها</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'var(--badge-rose-bg)', color: 'var(--badge-rose-text)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>پایگاه دانش جامع عیب‌یابی</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            بانک کدهای خطا و راهنمای رفع مشکلات
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            اگر حین کار در سامانه‌ها یا نرم‌افزارها با ارور، عدم دسترسی یا خطای ناشناخته مواجه شده‌اید، کد ارور را بیابید و راه‌حل گام‌به‌گام را مشاهده کنید.
          </p>
        </div>

        {/* Empty State */}
        {allErrors.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-40 text-rose-500" />
            <h3 className="text-lg font-bold">هیچ راهنمای خطایی ثبت نشده است</h3>
            <p className="text-sm text-gray-500 mt-1">خطاها همراه با مراحل فرایند از دیتابیس بارگذاری می‌شوند.</p>
          </div>
        )}

        {/* Error Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allErrors.map((err) => (
            <div
              key={err.id}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {err.errorCode}
                    </span>
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      {err.errorTitle}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                    سامانه: {err.targetSystem}
                  </span>
                </div>

                <div className="text-xs sm:text-sm space-y-2.5 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  <p className="whitespace-pre-line">
                    <span className="font-bold text-slate-500 ml-1">علت وقوع:</span>
                    {err.cause}
                  </p>
                  <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">راه‌حل:</span>
                    {err.solution}
                  </p>
                </div>
              </div>

              {/* Direct Jump to Process */}
              <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-slate-500">
                  مربوط به: {err.processTitle} (گام {err.stepIndex})
                </span>
                <Link
                  href={`/process/${err.processSlug}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>مشاهده در فلوچارت</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
