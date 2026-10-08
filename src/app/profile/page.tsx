'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { notify } from '@/lib/notify';
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Loader2,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, isAuthenticated, isLoading, refreshSession } = useUserSession();

  const [name, setName] = useState('');
  const [personnelCode, setPersonnelCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newContactType, setNewContactType] = useState<'phone' | 'email'>('phone');
  const [newContact, setNewContact] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [otpPassword, setOtpPassword] = useState('');
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);

  useEffect(() => {
    setName(currentUser.name === 'کاربر مهمان' ? '' : currentUser.name);
  }, [currentUser.name]);

  const inputClass =
    'w-full p-2.5 rounded-xl border text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500';
  const inputStyle = {
    background: 'var(--bg-surface)',
    borderColor: 'var(--border-glass)',
    color: 'var(--text-primary)',
  } as const;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), personnelCode: personnelCode.trim(), avatarUrl: avatarUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در ذخیره‌سازی');
      await refreshSession();
      notify.success('مشخصات با موفقیت ذخیره شد.');
    } catch (err: any) {
      notify.error(err.message || 'خطا در ذخیره‌سازی');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.trim()) {
      notify.error('مشخصات تماس را وارد کنید.');
      return;
    }
    setIsAddingContact(true);
    try {
      const res = await fetch('/api/auth/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactType: newContactType, contact: newContact.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در افزودن');
      notify.success(`کد تأیید به ${data.masked} ارسال شد.`);
      window.location.href = `/verify?identifier=${encodeURIComponent(data.identifier)}&channel=${data.channel}`;
    } catch (err: any) {
      notify.error(err.message || 'خطا در افزودن');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      notify.error('گذرواژه جدید باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('تکرار گذرواژه مطابقت ندارد.');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در تغییر گذرواژه');
      await refreshSession();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notify.success('گذرواژه با موفقیت تغییر کرد.');
    } catch (err: any) {
      notify.error(err.message || 'خطا در تغییر گذرواژه');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleOtp = async (enable: boolean) => {
    if (!otpPassword) {
      notify.error('برای این تغییر، گذرواژه فعلی را وارد کنید.');
      return;
    }
    setIsTogglingOtp(true);
    try {
      const res = await fetch('/api/auth/otp/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable, password: otpPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در تغییر وضعیت');
      await refreshSession();
      setOtpPassword('');
      notify.success(enable ? 'ورود دومرحله‌ای فعال شد.' : 'ورود دومرحله‌ای غیرفعال شد.');
    } catch (err: any) {
      notify.error(err.message || 'خطا در تغییر وضعیت');
    } finally {
      setIsTogglingOtp(false);
    }
  };

  const contactRow = (
    icon: React.ReactNode,
    label: string,
    value: string | null | undefined,
    verified: boolean | undefined,
    emptyHint: string
  ) => (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-slate-400 shrink-0">{icon}</span>
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 block">{label}</span>
          <span className="text-xs font-bold truncate block" dir="auto" style={{ color: 'var(--text-primary)' }}>
            {value || emptyHint}
          </span>
        </div>
      </div>
      {value ? (
        verified ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>تأیید شده</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
            <AlertCircle className="w-3 h-3" />
            <span>تأیید نشده</span>
          </span>
        )
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">حساب کاربری من</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">مشخصات فردی، راه‌های تماس، گذرواژه و ورود دومرحله‌ای</p>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
          </div>
        ) : !isAuthenticated ? (
          <div className="glass-card rounded-3xl p-8 text-center">
            <User className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-bold mb-4">برای مدیریت حساب، ابتدا وارد شوید.</p>
            <Link href="/login" className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700">
              ورود به سامانه
            </Link>
          </div>
        ) : (
          <>
            {/* Identity */}
            <form onSubmit={handleSaveProfile} className="glass-card rounded-3xl p-5 space-y-4">
              <h2 className="text-sm font-black">مشخصات فردی</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>نام و نام خانوادگی</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>کد پرسنلی (اختیاری)</label>
                  <input type="text" value={personnelCode} onChange={(e) => setPersonnelCode(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>نشانی تصویر (اختیاری)</label>
                <input type="text" dir="ltr" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={inputClass} style={inputStyle} />
              </div>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>ذخیره مشخصات</span>
              </button>
            </form>

            {/* Contacts */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-black">راه‌های تماس</h2>
              {contactRow(<Phone className="w-4 h-4" />, 'شماره موبایل', currentUser.phone, currentUser.phoneVerified, 'ثبت نشده')}
              {contactRow(<Mail className="w-4 h-4" />, 'ایمیل', currentUser.email, currentUser.emailVerified, 'ثبت نشده')}

              {(!currentUser.phone || !currentUser.email) && (
                <form onSubmit={handleAddContact} className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    افزودن {currentUser.phone ? 'ایمیل' : 'شماره موبایل'} دوم
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex rounded-xl border overflow-hidden shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                      {(['phone', 'email'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewContactType(t)}
                          className={`px-3 py-2 text-xs font-bold cursor-pointer ${newContactType === t ? 'bg-blue-600 text-white' : ''}`}
                          style={newContactType === t ? undefined : { color: 'var(--text-secondary)' }}
                        >
                          {t === 'phone' ? 'موبایل' : 'ایمیل'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      dir="auto"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      placeholder={newContactType === 'phone' ? '0912...' : 'name@mail.com'}
                      className={`${inputClass} flex-1`}
                      style={inputStyle}
                    />
                    <button type="submit" disabled={isAddingContact} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 shrink-0">
                      {isAddingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'افزودن و تأیید'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password */}
            <form onSubmit={handleChangePassword} className="glass-card rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-black flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>تغییر گذرواژه</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input dir="ltr" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="گذرواژه فعلی" className={inputClass} style={inputStyle} />
                <input dir="ltr" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="گذرواژه جدید" className={inputClass} style={inputStyle} />
                <input dir="ltr" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تکرار جدید" className={inputClass} style={inputStyle} />
              </div>
              <button type="submit" disabled={isChangingPassword} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer disabled:opacity-50">
                {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'تغییر گذرواژه'}
              </button>
            </form>

            {/* 2FA */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-black flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ورود دومرحله‌ای (پیامکی/ایمیلی)</span>
              </h2>
              <p className="text-xs text-slate-500">
                وضعیت فعلی: <strong>{currentUser.otpEnabled ? 'فعال' : 'غیرفعال'}</strong>
                {!currentUser.phoneVerified && !currentUser.emailVerified && ' — ابتدا یک راه تماس را تأیید کنید.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input dir="ltr" type="password" value={otpPassword} onChange={(e) => setOtpPassword(e.target.value)} placeholder="گذرواژه فعلی جهت تأیید" className={`${inputClass} flex-1`} style={inputStyle} />
                {currentUser.otpEnabled ? (
                  <button type="button" onClick={() => handleToggleOtp(false)} disabled={isTogglingOtp} className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-600 cursor-pointer disabled:opacity-50 shrink-0">
                    غیرفعال‌سازی
                  </button>
                ) : (
                  <button type="button" onClick={() => handleToggleOtp(true)} disabled={isTogglingOtp} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 shrink-0">
                    فعال‌سازی
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
