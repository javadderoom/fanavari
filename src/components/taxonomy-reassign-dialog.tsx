'use client';

import React from 'react';
import { FolderTree, Tag, CheckCircle2, Loader2, X, ArrowLeftRight } from 'lucide-react';

export interface TaxonomyReplacementOption {
  value: string;
  label: string;
  hint?: string;
}

interface TaxonomyReassignDialogProps {
  isOpen: boolean;
  kind: 'scope' | 'category';
  name: string;
  /** Processes still referencing this scope/category key */
  processesCount: number;
  /** Exclusive child categories that will move to the replacement (scopes only) */
  movedCount?: number;
  replacementLabel: string;
  replacementOptions: TaxonomyReplacementOption[];
  replacement: string;
  onReplacementChange: (value: string) => void;
  isLoading?: boolean;
  isWorking?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Delete-with-reassignment dialog for taxonomy (scopes & categories).
 * Processes reference these by plain string keys with no FK protection, so a
 * bare delete leaves dangling values. This dialog forces picking a
 * replacement when processes are affected and remaps before deleting.
 */
export function TaxonomyReassignDialog({
  isOpen,
  kind,
  name,
  processesCount,
  movedCount = 0,
  replacementLabel,
  replacementOptions,
  replacement,
  onReplacementChange,
  isLoading = false,
  isWorking = false,
  onCancel,
  onConfirm,
}: TaxonomyReassignDialogProps) {
  if (!isOpen) return null;

  const kindLabel = kind === 'scope' ? 'حوزه' : 'دسته‌بندی';
  const needsReplacement = processesCount > 0;
  const canConfirm = !needsReplacement || replacement !== '';
  const usableOptions = replacementOptions.filter((o) => o.value !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={isWorking ? undefined : onCancel} />

      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden glass-panel-strong z-10 shadow-2xl animate-in zoom-in-95"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {kind === 'scope' ? <FolderTree className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                حذف {kindLabel} با انتقال وابستگی‌ها
              </h2>
              <span className="text-[11px] text-slate-500 font-bold truncate block max-w-55">
                «{name}»
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isWorking}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="w-7 h-7 mx-auto animate-spin text-blue-500 mb-2" />
              <p className="text-xs text-slate-500 font-bold">در حال بررسی وابستگی‌ها...</p>
            </div>
          ) : (
            <>
              {needsReplacement ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/5">
                  <ArrowLeftRight className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed text-amber-700 dark:text-amber-300">
                    {processesCount} فرایند هنوز از این {kindLabel} استفاده می‌کنند. فرایندها با
                    شناسه متنی ذخیره می‌شوند و بدون انتقال، مقدار بدون‌صاحب می‌ماند — ابتدا
                    مقصد انتقال را انتخاب کنید.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed text-emerald-700 dark:text-emerald-300">
                    هیچ فرایندی از این {kindLabel} استفاده نمی‌کند — حذف امن است.
                  </p>
                </div>
              )}

              {movedCount > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/5">
                  <FolderTree className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed text-blue-700 dark:text-blue-300">
                    {movedCount} دسته‌بندی اختصاصی این حوزه به حوزه جایگزین منتقل می‌شوند و
                    حذف نمی‌گردند.
                  </p>
                </div>
              )}

              {needsReplacement && (
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {replacementLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={replacement}
                    onChange={(e) => onReplacementChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">— انتخاب کنید —</option>
                    {usableOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}{o.hint ? ` (${o.hint})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isWorking}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            style={{ color: 'var(--text-secondary)' }}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || isWorking || !canConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-40"
          >
            {isWorking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{needsReplacement ? 'انتقال و حذف' : 'بله، حذف شود'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
