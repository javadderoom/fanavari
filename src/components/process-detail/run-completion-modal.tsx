'use client';

import React from 'react';
import Link from 'next/link';
import { WorkflowRun } from '@/types/process';
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Printer, 
  FileText, 
  X, 
  ShieldCheck, 
  Sparkles,
  RotateCcw,
  Workflow,
  ArrowLeft
} from 'lucide-react';

interface RunCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: WorkflowRun;
  processSlug: string;
  onViewAuditDetails: (run: WorkflowRun) => void;
  onRestartNewRun: () => void;
  nextProcess?: {
    id: string;
    title: string;
    slug: string;
    departmentName?: string;
    targetSystem?: string;
  } | null;
  nextProcessNote?: string | null;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return 'کمتر از ۱ دقیقه';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} ثانیه`;
  if (secs === 0) return `${mins} دقیقه`;
  return `${mins} دقیقه و ${secs} ثانیه`;
}

export function RunCompletionModal({
  isOpen,
  onClose,
  run,
  processSlug,
  onViewAuditDetails,
  onRestartNewRun,
  nextProcess,
  nextProcessNote,
}: RunCompletionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div 
        className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 glass-panel-strong text-center"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-surface)' }}
      >
        {/* Header Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <Trophy className="w-10 h-10 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
            ✓
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ثبت نهایی در لاگ ممیزی ISO 9001</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
            اجرای رسمی با موفقیت پایان یافت!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            کلیه گام‌های اجرایی و تاییدات فرآیندی با موفقیت ثبت شدند و سند ممیزی آن ایجاد گردید.
          </p>
        </div>

        {/* Execution Summary Breakdown Card */}
        <div 
          className="p-4 rounded-2xl border text-xs space-y-2.5 text-right"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-slate-500 font-bold">شناسه و عنوان اجرا:</span>
            <span className="font-black" style={{ color: 'var(--text-primary)' }}>
              اجرای #{run.runNumber}: {run.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">مجری عملیات:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {run.operatorName} {run.operatorRole ? `(${run.operatorRole})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">مدت زمان کل عملیات:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(run.totalDurationSeconds)}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">مراحل انجام‌شده:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{run.completedStepsCount} از {run.totalStepsCount} مرحله</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-slate-500 font-bold">زمان پایان:</span>
            <span className="text-slate-500 font-mono text-[11px]" dir="ltr">
              {run.completedAt ? new Date(run.completedAt).toLocaleTimeString('fa-IR') : 'اکنون'}
            </span>
          </div>
        </div>

        {/* Sibling / Next Process Recommendation Card */}
        {nextProcess && (
          <div 
            className="p-4 rounded-2xl border text-right space-y-2.5 bg-gradient-to-l from-teal-500/10 via-emerald-500/5 to-transparent border-teal-500/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>فرایند مکمل و گام بعدی در زنجیره:</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                پیشنهاد سیستم
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {nextProcess.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {nextProcess.targetSystem && (
                  <span className="text-[10px] text-slate-500">
                    سامانه: {nextProcess.targetSystem}
                  </span>
                )}
                {nextProcess.departmentName && (
                  <span className="text-[10px] text-slate-500">
                    • {nextProcess.departmentName}
                  </span>
                )}
              </div>
            </div>
            {nextProcessNote && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-teal-500/20">
                {nextProcessNote}
              </p>
            )}
            <div className="pt-1 flex justify-end">
              <Link
                href={`/process/${nextProcess.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all hover:scale-102"
              >
                <span>شروع فرایند مکمل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewAuditDetails(run);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
          >
            <FileText className="w-4 h-4" />
            <span>مشاهده کارنامه ممیزی رسمی</span>
          </button>

          <Link
            href={`/process/${processSlug}/print?runId=${run.id}`}
            target="_blank"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ گواهینامه رسمی ISO</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRestartNewRun();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>اجرای جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
}
