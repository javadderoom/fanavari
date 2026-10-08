'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { UserPlus, Loader2, Phone, Mail } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserSession();

  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/');
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      notify.error('نام و نام خانوادگی را کامل وارد کنید.');
      return;
    }
    if (!contact.trim()) {
      notify.error(contactType === 'phone' ? 'شماره موبایل را وارد کنید.' : 'ایمیل را وارد کنید.');
      return;
    }
    if (password.length < 8) {
      notify.error('گذرواژه باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    if (password !== confirm) {
      notify.error('تکرار گذرواژه مطابقت ندارد.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), contactType, contact: contact.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت‌نام');
      notify.success(`کد تأیید به ${data.masked} ارسال شد.`);
      router.push(`/verify?identifier=${encodeURIComponent(contact.trim())}&channel=${data.channel}`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت‌نام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              ثبت‌نام در سامانه فناوری
            </h1>
            <p className="text-xs text-slate-500">حساب شما پس از تأیید مشخصات تماس فعال می‌شود</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              نام و نام خانوادگی *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: علی رضایی"
              className={inputClass}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              ثبت‌نام با
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { key: 'phone', label: 'شماره موبایل', icon: Phone },
                  { key: 'email', label: 'ایمیل', icon: Mail },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setContactType(opt.key)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    contactType === opt.key
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  style={contactType === opt.key ? undefined : { borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {contactType === 'phone' ? 'شماره موبایل *' : 'نشانی ایمیل *'}
            </label>
            <input
              type="text"
              dir="auto"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={contactType === 'phone' ? '0912...' : 'name@mail.com'}
              className={inputClass}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                گذرواژه *
              </label>
                <input
                  dir="ltr"
                  type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                تکرار گذرواژه *
              </label>
                <input
                  dir="ltr"
                  type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="تکرار گذرواژه"
                className={inputClass}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>ثبت‌نام و دریافت کد تأیید</span>
          </button>

          <p className="text-xs text-center text-slate-500 font-bold">
            حساب کاربری دارید؟{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              وارد شوید
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
