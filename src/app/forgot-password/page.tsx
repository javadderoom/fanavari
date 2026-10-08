'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/notify';
import { KeyRound, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'request' | 'confirm'>('request');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      notify.error('شماره موبایل یا ایمیل را وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در درخواست');
      notify.success(data.message || 'کد بازیابی ارسال شد.');
      setStage('confirm');
    } catch (err: any) {
      notify.error(err.message || 'خطا در درخواست');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      notify.error('کد بازیابی را کامل وارد کنید.');
      return;
    }
    if (newPassword.length < 8) {
      notify.error('گذرواژه جدید باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirm) {
      notify.error('تکرار گذرواژه مطابقت ندارد.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), code: code.trim(), newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در بازیابی');
      notify.success('گذرواژه تغییر کرد. وارد شوید.');
      router.push('/login');
    } catch (err: any) {
      notify.error(err.message || 'خطا در بازیابی');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-amber-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              بازیابی گذرواژه
            </h1>
            <p className="text-xs text-slate-500">
              {stage === 'request' ? 'مشخصات حساب را وارد کنید' : 'کد بازیابی و گذرواژه جدید را وارد کنید'}
            </p>
          </div>
        </div>

        {stage === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <input
              type="text"
              dir="auto"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="شماره موبایل یا ایمیل"
              className={inputClass}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>ارسال کد بازیابی</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="کد ۶ رقمی"
              className={`${inputClass} text-center tracking-[0.5em] font-mono`}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="گذرواژه جدید"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="تکرار گذرواژه"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تغییر گذرواژه</span>
            </button>
          </form>
        )}

        <p className="text-xs text-center text-slate-500 font-bold mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            بازگشت به ورود
          </Link>
        </p>
      </div>
    </div>
  );
}
