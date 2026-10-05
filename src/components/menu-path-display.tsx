'use client';

import React from 'react';
import { 
  MousePointerClick, 
  ChevronLeft, 
  Navigation, 
  CheckCircle2, 
  FolderTree 
} from 'lucide-react';

interface MenuPathDisplayProps {
  path?: string | null;
  variant?: 'interactive' | 'modal' | 'print';
  className?: string;
}

/**
 * Splits a menu path string by common delimiters (>, ->, ›, », /)
 * into an array of cleaned, trimmed menu level names.
 */
export function parseMenuPath(path?: string | null): string[] {
  if (!path || typeof path !== 'string') return [];
  
  // Standardize delimiters
  const clean = path
    .replace(/->/g, '>')
    .replace(/›/g, '>')
    .replace(/»/g, '>')
    .replace(/→/g, '>');

  // Split by '>' or '/' if '>' is not present
  const delimiter = clean.includes('>') ? '>' : clean.includes('/') ? '/' : '>';
  return clean
    .split(delimiter)
    .map((seg) => seg.trim())
    .filter((seg) => seg.length > 0);
}

export function MenuPathDisplay({ path, variant = 'interactive', className = '' }: MenuPathDisplayProps) {
  const segments = parseMenuPath(path);

  if (segments.length === 0) return null;

  // -------------------------------------------------------------
  // PRINT VARIANT: High contrast, clean bordered sequence on paper
  // -------------------------------------------------------------
  if (variant === 'print') {
    return (
      <div className={`my-4 p-3.5 bg-slate-50 border-2 border-slate-700 rounded-2xl print:border-black ${className}`}>
        <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-2.5 pb-1.5 border-b border-slate-300">
          <Navigation className="w-4 h-4 text-blue-700" />
          <span>مسیر کلیک و انتخاب در نرم‌افزار / سامانه (به ترتیب گام‌ها):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            return (
              <React.Fragment key={idx}>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-black ${
                    isLast
                      ? 'bg-blue-600 text-white border-blue-800 shadow-xs print:bg-slate-900 print:text-white'
                      : 'bg-white text-slate-900 border-slate-400 print:border-black'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                      isLast
                        ? 'bg-white text-blue-700 print:text-black'
                        : 'bg-slate-200 text-slate-800 print:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="whitespace-nowrap">{seg}</span>
                  {isLast && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-700/60 text-white font-normal mr-1 print:bg-black">
                      (کلیک نهایی)
                    </span>
                  )}
                </div>

                {!isLast && (
                  <ChevronLeft className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // INTERACTIVE & MODAL VARIANT: Ultra-prominent, eye-catching UI
  // -------------------------------------------------------------
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-md ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04), var(--bg-surface))',
        borderColor: 'var(--border-glow)',
      }}
    >
      {/* Header Label */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-glass)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-xs">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block">
              مسیر منو و محل کلیک در سامانه:
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
              جهت انجام این گام، مراحل زیر را در نرم‌افزار به ترتیب دنبال کنید
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
          {segments.length} سطح منو
        </span>
      </div>

      {/* Sequential Breadcrumb Sequence Cards */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;

          return (
            <React.Fragment key={idx}>
              <div
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 ${
                  isLast
                    ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-400'
                }`}
              >
                {/* Level Index Badge */}
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isLast
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {idx + 1}
                </span>

                <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">{seg}</span>

                {isLast && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-700 text-white/95 mr-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>کلیک نهایی</span>
                  </span>
                )}
              </div>

              {!isLast && (
                <div className="flex items-center text-blue-500 dark:text-blue-400 px-0.5 shrink-0 animate-pulse">
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
