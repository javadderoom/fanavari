'use client';

import React from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { ErrorGuideItem } from '@/types/process';

interface StepErrorGuidesProps {
  errorGuides: ErrorGuideItem[];
  onAddErrorGuide: () => void;
  onUpdateErrorGuide: (errorIndex: number, updated: Partial<ErrorGuideItem>) => void;
  onRemoveErrorGuide: (errorIndex: number) => void;
}

export function StepErrorGuides({
  errorGuides,
  onAddErrorGuide,
  onUpdateErrorGuide,
  onRemoveErrorGuide,
}: StepErrorGuidesProps) {
  return (
    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>راهنمای خطاها و اشکالات این مرحله ({errorGuides.length} خطا)</span>
        </div>
        <button
          type="button"
          onClick={onAddErrorGuide}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition-colors cursor-pointer border border-rose-500/20"
        >
          <Plus className="w-3 h-3" />
          <span>افزودن خطا به این گام</span>
        </button>
      </div>

      {errorGuides.length > 0 ? (
        <div className="space-y-3">
          {errorGuides.map((err, errIdx) => (
            <div
              key={err.id || errIdx}
              className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      کد اختصاصی خطا (Error Code)
                    </label>
                    <input
                      type="text"
                      value={err.errorCode || ''}
                      onChange={(e) => onUpdateErrorGuide(errIdx, { errorCode: e.target.value })}
                      placeholder="مثلاً: ERR-403 یا LTMS-ERR-01"
                      dir="ltr"
                      className="w-full p-2 text-xs rounded-lg border font-mono font-bold text-rose-600 dark:text-rose-400 outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      عنوان و شرح خطای دریافتی
                    </label>
                    <input
                      type="text"
                      value={err.errorTitle || ''}
                      onChange={(e) => onUpdateErrorGuide(errIdx, { errorTitle: e.target.value })}
                      placeholder="مثلاً: عدم یافتن ابلاغ تدریس در سرور پایگاه مرکزی"
                      className="w-full p-2 text-xs rounded-lg border font-medium outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveErrorGuide(errIdx)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer mt-5"
                  title="حذف این راهنمای خطا"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  دستورالعمل و راهکار تست‌شده رفع خطا (Solution)
                </label>
                <textarea
                  rows={2}
                  value={err.solution || ''}
                  onChange={(e) => onUpdateErrorGuide(errIdx, { solution: e.target.value })}
                  placeholder="راهکار گام‌به‌گام برای کاربر یا پرسنل جهت برطرف کردن این مشکل..."
                  className="w-full p-2.5 text-xs rounded-lg border outline-none leading-relaxed"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
          هیچ خطایی برای این مرحله ثبت نشده است. در صورت نیاز با زدن «افزودن خطا به این گام» آن را اضافه نمایید.
        </p>
      )}
    </div>
  );
}
