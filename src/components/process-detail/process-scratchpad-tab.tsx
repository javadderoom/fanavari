'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface ProcessScratchpadTabProps {
  note: string;
  onChangeNote: (val: string) => void;
  onSave: () => void;
  isSavedNotice: boolean;
}

export function ProcessScratchpadTab({
  note,
  onChangeNote,
  onSave,
  isSavedNotice,
}: ProcessScratchpadTabProps) {
  return (
    <div className="space-y-4">
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'var(--badge-amber-bg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
      >
        <h3 className="text-base font-black" style={{ color: 'var(--badge-amber-text)' }}>
          جعبه‌ابزار و یادداشت‌های موقت (Scratchpad)
        </h3>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          کدهای پرسنلی، شماره تراکنش، ایمیل‌ها یا نکاتی که حین اجرای این فرایند به آن نیاز دارید را اینجا بنویسید. این اطلاعات در مرورگر شما باقی می‌ماند.
        </p>
      </div>

      <textarea
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        placeholder="یادداشت‌های موقت خود را برای این فرایند اینجا وارد نمایید..."
        rows={10}
        className="w-full p-5 rounded-2xl text-sm font-medium leading-relaxed border outline-none resize-y"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-glass)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {isSavedNotice ? '✅ یادداشت شما با موفقیت ذخیره شد' : 'داده‌ها به صورت امن در مرورگر ذخیره می‌شوند.'}
        </span>

        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
          style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
        >
          <Save className="w-4 h-4" />
          <span>ذخیره در مرورگر</span>
        </button>
      </div>
    </div>
  );
}
