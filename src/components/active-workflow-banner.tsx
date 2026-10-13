'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, ArrowLeft, X, RotateCcw, Building2, Laptop, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActiveWorkflowSession } from '@/types/process';
import { notify } from '@/lib/notify';

const STORAGE_KEY = 'farayandnama_active_session';
const DISMISSED_SESSION_KEY = 'farayandnama_dismissed_active_session';
const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function ActiveWorkflowBanner() {
  const [session, setSession] = useState<ActiveWorkflowSession | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const loadSession = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setSession(null);
        return;
      }
      const parsed: ActiveWorkflowSession = JSON.parse(raw);
      
      const isExpired = Date.now() - parsed.updatedAt > MAX_SESSION_AGE_MS;
      const isFinished = parsed.totalSteps > 0 && parsed.completedCount >= parsed.totalSteps;
      const dismissedId = typeof window !== 'undefined' ? sessionStorage.getItem(DISMISSED_SESSION_KEY) : null;

      if (isExpired || isFinished || (dismissedId && dismissedId === parsed.processId)) {
        setSession(null);
        return;
      }

      setSession(parsed);
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    loadSession();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSession]);

  const handleDismiss = () => {
    if (session) {
      try {
        sessionStorage.setItem(DISMISSED_SESSION_KEY, session.processId);
      } catch {
        // ignore
      }
    }
    setIsDismissed(true);
  };

  const handleAbandon = async () => {
    const confirmed = await notify.confirm({
      title: 'انصراف از فرایند نیمه‌کاره',
      message: 'آیا مایلید این فرایند از حالت در حال اجرا خارج شده و پیشرفت آن پاک شود؟',
      confirmText: 'بله، پاک شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (confirmed) {
      if (session) {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(`fanavari-completed-${session.processId}`);
        } catch {
          // ignore
        }
      }
      setSession(null);
      notify.info('پیشرفت فرایند با موفقیت پاک شد.');
    }
  };

  if (!session || isDismissed) return null;

  const currentStepNumber = Math.min(session.lastStepIndex + 1, session.totalSteps);
  const percent = session.totalSteps > 0 
    ? Math.round((session.completedCount / session.totalSteps) * 100) 
    : 0;

  return (
    <aside 
      aria-label="ادامه فرایند نیمه‌کاره"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 mb-8 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.25)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Subtle ambient corner glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status pill & Info */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>فرایند در حال اجرا</span>
            </span>

            {session.officialRunNumber ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                اجرای رسمی #{session.officialRunNumber}
              </span>
            ) : null}

            {session.departmentName && (
              <span className="text-xs px-2 py-0.5 rounded-md font-bold text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-500" />
                <span>{session.departmentName}</span>
              </span>
            )}

            {session.targetSystem && (
              <span className="text-xs px-2 py-0.5 rounded-md font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40">
                {session.targetSystem}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {session.processTitle}
          </h3>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>
                آخرین موقعیت: گام {currentStepNumber} از {session.totalSteps}
                {session.lastStepTitle ? ` (${session.lastStepTitle})` : ''}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {session.completedCount} از {session.totalSteps} گام ({percent}٪)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-300/40 dark:border-slate-700/40">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(6, percent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons & Controls */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0 self-stretch md:self-center">
          <Link
            href={`/process/${session.processSlug}?step=${session.lastStepIndex}`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="whitespace-nowrap">ادامه فرایند</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-0 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleAbandon}
            className="p-2.5 rounded-xl border text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
            title="انصراف از اجرا و پاک کردن پیشرفت"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2.5 rounded-xl border text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition-all cursor-pointer"
            title="بستن این کادر برای این نشست"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
