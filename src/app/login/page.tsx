'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { LogIn, KeyRound, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshSession } = useUserSession();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState<'credentials' | 'otp'>('credentials');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');
  const [otpMasked, setOtpMasked] = useState('');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/');
  }, [isLoading, isAuthenticated, router]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      notify.error('مشخصات ورود را کامل وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && data.needVerification) {
          notify.info('حساب شما هنوز فعال نشده است. کد تأیید را وارد کنید.');
          router.push(`/verify?identifier=${encodeURIComponent(data.identifier)}&channel=${data.channel}`);
          return;
        }
        throw new Error(data.error || 'خطا در ورود');
      }
      if (data.otpRequired) {
        setOtpChannel(data.channel);
        setOtpMasked(data.masked || '');
        setOtpIdentifier(data.identifier || identifier.trim());
        if (data.notice) notify.info(data.notice);
        setStage('otp');
        return;
      }
      await refreshSession();
      notify.success('با موفقیت وارد شدید.');
      router.push('/');
    } catch (err: any) {
      notify.error(err.message || 'خطا در ورود');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      notify.error('کد تأیید را کامل وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: otpIdentifier, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در تأیید کد');
      await refreshSession();
      notify.success('با موفقیت وارد شدید.');
      router.push('/');
    } catch (err: any) {
      notify.error(err.message || 'خطا در تأیید کد');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
            {stage === 'otp' ? <ShieldCheck className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              {stage === 'otp' ? 'تأیید دومرحله‌ای' : 'ورود به سامانه فناوری'}
            </h1>
            <p className="text-xs text-slate-500">
              {stage === 'otp'
                ? `کد ارسال‌شده به ${otpMasked} را وارد کنید`
                : 'با شماره موبایل یا ایمیل و گذرواژه وارد شوید'}
            </p>
          </div>
        </div>

        {stage === 'credentials' ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                شماره موبایل یا ایمیل
              </label>
              <input
                type="text"
                dir="auto"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="0912... یا name@mail.com"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                گذرواژه
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="گذرواژه حساب"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>ورود</span>
            </button>
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <Link href="/signup" className="text-blue-600 hover:underline">
                ثبت‌نام حساب جدید
              </Link>
              <Link href="/forgot-password" className="text-slate-500 hover:underline">
                فراموشی گذرواژه
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                کد {otpChannel === 'sms' ? 'پیامکی' : 'ایمیلی'} (۶ رقم)
              </label>
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className={`${inputClass} text-center tracking-[0.5em] font-mono`}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تأیید و ورود</span>
            </button>
            <button
              type="button"
              onClick={() => setStage('credentials')}
              className="w-full text-xs font-bold text-slate-500 hover:underline cursor-pointer"
            >
              بازگشت به ورود با گذرواژه
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
