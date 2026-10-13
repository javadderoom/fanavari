'use client';

import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Sparkles, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface ProcessFeedbackWidgetProps {
  processId: string;
  processTitle: string;
  currentStepKey?: string;
}

const REASONS = [
  { key: 'ui_changed', label: 'منوها یا دکمه‌های سامانه تغییر کرده' },
  { key: 'incomplete_steps', label: 'مراحل یا تصاویر ناقص است' },
  { key: 'new_error', label: 'کد خطای متفاوتی دریافت کردم' },
  { key: 'other', label: 'سایر موارد' },
];

export function ProcessFeedbackWidget({
  processId,
  processTitle,
  currentStepKey,
}: ProcessFeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showNegativeForm, setShowNegativeForm] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string>('ui_changed');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const storageKey = `farayandnama_feedback_${processId}`;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
        setSubmitted(true);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const handleSubmitPositive = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/processes/${processId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHelpful: true,
          stepKey: currentStepKey,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        try {
          localStorage.setItem(storageKey, 'helpful');
        } catch {}
        notify.success('ممنون از بازخورد شما! ثبت گردید.');
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error(data.error || 'خطا در ثبت بازخورد.');
      }
    } catch {
      notify.error('خطای شبکه در ارسال بازخورد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNegative = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/processes/${processId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHelpful: false,
          reason: selectedReason,
          comment: comment.trim() || undefined,
          stepKey: currentStepKey,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        try {
          localStorage.setItem(storageKey, 'unhelpful');
        } catch {}
        notify.success('گزارش شما با موفقیت ثبت شد و به تیم بازبینی ارجاع گردید.');
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error(data.error || 'خطا در ثبت گزارش.');
      }
    } catch {
      notify.error('خطای شبکه در ارسال گزارش.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div 
        className="rounded-2xl p-5 border text-center transition-all bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 mt-8 mb-4 animate-in fade-in"
      >
        <div className="flex items-center justify-center gap-2 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>بازخورد شما برای این راهنما قبلاً ثبت شده است. از همکاری شما سپاسگزاریم!</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-sm mt-8 mb-4 transition-all"
      style={{ borderColor: 'var(--border-glass)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm sm:text-base font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>آیا این راهنما برای شما مفید بود؟</span>
          </h4>
          <p className="text-xs font-medium mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            بازخورد شما مستقیماً به تیم مستندسازی جهت به‌روزرسانی سریع منوها و رفع تغییرات سامانه‌ها کمک می‌کند.
          </p>
        </div>

        {/* Thumbs Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitPositive}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="بله، راهنما مشکلم را حل کرد"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5" />
            )}
            <span>بله، مفید بود</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowNegativeForm((prev) => !prev)}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
              showNegativeForm
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-xs'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
            }`}
            title="نیاز به به‌روزرسانی یا اصلاح دارد"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>نیاز به تغییر دارد</span>
          </button>
        </div>
      </div>

      {/* Expandable Negative Form */}
      {showNegativeForm && (
        <form onSubmit={handleSubmitNegative} className="mt-5 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              علت اصلی نیاز به به‌روزرسانی یا مشکل راهنما:
            </label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => {
                const isSelected = selectedReason === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedReason(r.key)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-comment" className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              توضیحات تکمیلی (اختیاری):
            </label>
            <textarea
              id="feedback-comment"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="مثال: دکمه مورد نظر در نسخه جدید سامانه به تب «تنظیمات» منتقل شده است..."
              className="w-full rounded-xl p-3 text-xs border bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                background: 'var(--bg-input)',
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNegativeForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-500/10 transition-colors"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>ارسال گزارش به کارشناسان</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
