'use client';

import React from 'react';
import { AlertTriangle, Link2Off, Trash2, CheckCircle2, Loader2, X, Archive, Info } from 'lucide-react';

export interface DeleteImpactItem {
  label: string;
  count: number;
  hint?: string;
}

interface DeleteImpactDialogProps {
  isOpen: boolean;
  /** e.g. «سازمان»، «سامانه»، «فرایند» */
  entityKindLabel: string;
  entityName: string;
  /** Relations that survive but become unlinked (DB ON DELETE SET NULL) */
  survivors: DeleteImpactItem[];
  /** Relations that are permanently destroyed (DB ON DELETE CASCADE) */
  destroyed: DeleteImpactItem[];
  isLoading?: boolean;
  isConfirming?: boolean;
  confirmText?: string;
  /** Optional softer alternative shown in a blue notice box (e.g. archive instead of delete) */
  notice?: string;
  /** Optional secondary action button in the footer (e.g. «بایگانی به‌جای حذف») */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Shared delete-impact preview dialog, reusable for every entity.
 * Shows honestly what a delete will orphan vs permanently destroy,
 * based on live counts from the server — not static guesses.
 */
export function DeleteImpactDialog({
  isOpen,
  entityKindLabel,
  entityName,
  survivors,
  destroyed,
  isLoading = false,
  isConfirming = false,
  confirmText = 'بله، حذف شود',
  notice,
  secondaryAction,
  onCancel,
  onConfirm,
}: DeleteImpactDialogProps) {
  if (!isOpen) return null;

  const totalRelations =
    survivors.reduce((acc, i) => acc + i.count, 0) +
    destroyed.reduce((acc, i) => acc + i.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={isConfirming ? undefined : onCancel} />

      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden glass-panel-strong z-10 shadow-2xl animate-in zoom-in-95"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                حذف {entityKindLabel} از پایگاه داده
              </h2>
              <span className="text-[11px] text-slate-500 font-bold truncate block max-w-55">
                «{entityName}»
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="w-7 h-7 mx-auto animate-spin text-rose-500 mb-2" />
              <p className="text-xs text-slate-500 font-bold">در حال بررسی وابستگی‌ها...</p>
            </div>
          ) : totalRelations === 0 ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed text-emerald-700 dark:text-emerald-300">
                هیچ وابستگی ثبت‌شده‌ای وجود ندارد — حذف این مورد امن است و چیز دیگری تحت تأثیر قرار نمی‌گیرد.
              </p>
            </div>
          ) : (
            <>
              {/* Softer alternative notice (e.g. archive instead of delete) */}
              {notice && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/5">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed text-blue-700 dark:text-blue-300">
                    {notice}
                  </p>
                </div>
              )}

              {/* Survivors: kept but unlinked */}
              {survivors.some((i) => i.count > 0) && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Link2Off className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      می‌مانند ولی ارتباطشان قطع می‌شود
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {survivors
                      .filter((i) => i.count > 0)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5"
                        >
                          <div>
                            <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                              {item.label}: {item.count} مورد
                            </span>
                            {item.hint && (
                              <span className="text-[10px] text-slate-500">{item.hint}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Destroyed: cascade deleted */}
              {destroyed.some((i) => i.count > 0) && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
                      برای همیشه و غیرقابل بازگشت حذف می‌شوند
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {destroyed
                      .filter((i) => i.count > 0)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-rose-500/25 bg-rose-500/5"
                        >
                          <div>
                            <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                              {item.label}: {item.count} مورد
                            </span>
                            {item.hint && (
                              <span className="text-[10px] text-slate-500">{item.hint}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2 flex-wrap" style={{ borderColor: 'var(--border-subtle)' }}>
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={isLoading || isConfirming}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-40"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{secondaryAction.label}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            style={{ color: 'var(--text-secondary)' }}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || isConfirming}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-40"
          >
            {isConfirming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
