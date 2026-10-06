'use client';

import React from 'react';

export interface FlattenedErrorGuide {
  id: string;
  errorCode: string;
  errorTitle: string;
  cause: string;
  solution: string;
  escalationContact?: string;
  stepTitle: string;
  stepIndex: number;
}

interface ProcessErrorMatrixTabProps {
  errors: FlattenedErrorGuide[];
}

export function ProcessErrorMatrixTab({ errors }: ProcessErrorMatrixTabProps) {
  return (
    <div className="space-y-4">
      <div
        className="p-5 rounded-2xl flex items-center justify-between"
        style={{ background: 'var(--badge-rose-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
      >
        <div>
          <h3 className="text-base font-black" style={{ color: 'var(--badge-rose-text)' }}>
            ماتریس جامع رفع خطاهای فرایند
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            تمام کدهای خطا و راه‌حل‌های تست‌شده برای پیشگیری از گیر افتادن کاربر
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
          {errors.length} خطا
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {errors.map((err) => (
          <div
            key={err.id}
            className="p-5 rounded-2xl border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {err.errorCode}
                </span>
                <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {err.errorTitle}
                </h4>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                گام {err.stepIndex}: {err.stepTitle}
              </span>
            </div>

            <div className="text-xs sm:text-sm space-y-2.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <p className="whitespace-pre-line">
                <span className="font-bold text-slate-500 ml-1">علت بروز:</span>
                {err.cause}
              </p>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">راه‌حل گام‌به‌گام:</span>
                {err.solution}
              </p>
            </div>

            {err.escalationContact && (
              <div className="mt-3 text-xs font-semibold text-slate-400">
                <span>واحد پشتیبان: </span>
                <span className="text-blue-500">{err.escalationContact}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
