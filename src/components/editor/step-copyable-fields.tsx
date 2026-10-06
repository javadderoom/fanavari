'use client';

import React from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { CopyableField } from '@/types/process';

interface StepCopyableFieldsProps {
  fields: CopyableField[];
  onAddField: () => void;
  onUpdateField: (fieldIndex: number, updated: Partial<CopyableField>) => void;
  onRemoveField: (fieldIndex: number) => void;
}

export function StepCopyableFields({
  fields,
  onAddField,
  onUpdateField,
  onRemoveField,
}: StepCopyableFieldsProps) {
  return (
    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Copy className="w-3.5 h-3.5" />
          <span>فیلدهای نمونه و داده‌های قابل کپی ({fields.length})</span>
        </div>
        <button
          type="button"
          onClick={onAddField}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer border border-blue-500/20"
        >
          <Plus className="w-3 h-3" />
          <span>افزودن فیلد نمونه</span>
        </button>
      </div>

      {fields.length > 0 ? (
        <div className="space-y-2">
          {fields.map((field, fIdx) => (
            <div
              key={fIdx}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    عنوان فیلد (برچسب)
                  </label>
                  <input
                    type="text"
                    value={field.label || ''}
                    onChange={(e) => onUpdateField(fIdx, { label: e.target.value })}
                    placeholder="مثلاً: آدرس سامانه یا کد پیگیری"
                    className="w-full p-2 text-xs rounded-lg border font-medium outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    مقدار قابل کپی (Value)
                  </label>
                  <input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) => onUpdateField(fIdx, { value: e.target.value })}
                    placeholder="مثلاً: 12345678 یا https://..."
                    dir="auto"
                    className="w-full p-2 text-xs rounded-lg border font-mono outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveField(fIdx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer self-center"
                title="حذف این فیلد"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
          فیلد یا دیتای نمونه‌ای برای کپی مستقیم در این گام تعریف نشده است.
        </p>
      )}
    </div>
  );
}
