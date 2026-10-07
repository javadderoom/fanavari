'use client';

import React, { useState } from 'react';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { 
  Play, 
  X, 
  ShieldCheck, 
  Clock, 
  FileText, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { Process, WorkflowRun } from '@/types/process';

interface QuickStartRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: Process;
  onRunStarted: (run: WorkflowRun) => void;
}

export function QuickStartRunModal({
  isOpen,
  onClose,
  process,
  onRunStarted,
}: QuickStartRunModalProps) {
  const { currentUser } = useUserSession();
  const [title, setTitle] = useState(`اجرای رسمی — ${new Date().toLocaleDateString('fa-IR')}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notify.error('لطفاً عنوان اجرای رسمی را مشخص فرمایید.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/processes/${process.slug}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'خطا در آغاز اجرای رسمی');
      }

      const data = await res.json();
      if (data.run) {
        notify.success(`اجرای رسمی #${data.run.runNumber} با موفقیت آغاز شد!`);
        onRunStarted(data.run);
        onClose();
      }
    } catch (err: any) {
      console.error('Error starting workflow run:', err);
      notify.error(err.message || 'خطا در ثبت و آغاز اجرای رسمی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div 
        className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                آغاز اجرای رسمی و رهگیری زنده
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت لاگ ممیزی ایزو و پایش گام‌به‌گام عملیات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Process Overview Card */}
        <div 
          className="p-4 rounded-2xl border text-xs space-y-2"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">فرایند هدف:</span>
            <span className="font-black text-blue-600 dark:text-blue-400">{process.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">مجری عملیات:</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentUser.name} ({currentUser.roleName || 'کاربر سازمانی'})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">تعداد گام‌ها / زمان تخمینی:</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {process.totalSteps} گام • حدود {process.estimatedMinutes} دقیقه
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStartRun} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              عنوان این اجرای رسمی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: صدور حکم کارگزینی آقای رضایی - دوره مهرماه"
              className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              توضیحات مقدماتی یا شماره پرونده / تیکت (اختیاری)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت‌های مربوط به پرونده، شماره نامه، شناسه پیگیری ارباب رجوع یا نکات حین اقدام..."
              className="w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-glass)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>در حال ایجاد ران...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>شروع رهگیری زنده فرایند</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
