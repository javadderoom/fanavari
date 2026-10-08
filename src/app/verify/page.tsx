'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { ShieldCheck, Loader2, RotateCcw } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useUserSession();

  const identifier = searchParams.get('identifier') || '';
  const channel = searchParams.get('channel') === 'email' ? 'email' : 'sms';

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      notify.error('کد تأیید را کامل وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در تأیید');
      await refreshSession();
      notify.success('مشخصات تماس تأیید و حساب فعال شد.');
      router.push('/');
    } catch (err: any) {
      notify.error(err.message || 'خطا در تأیید');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در ارسال مجدد');
      notify.success(`کد جدید به ${data.masked} ارسال شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ارسال مجدد');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              تأیید مشخصات تماس
            </h1>
            <p className="text-xs text-slate-500" dir="auto">
              کد ۶ رقمی ارسال‌شده به {identifier} را وارد کنید
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            dir="ltr"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            className="w-full p-3 rounded-xl border text-sm outline-none text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-indigo-500"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تأیید و فعال‌سازی حساب</span>
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer disabled:opacity-50"
          >
            {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>ارسال مجدد کد</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
