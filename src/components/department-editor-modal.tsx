'use client';

import React, { useState } from 'react';
import { useUserSession } from './user-session-provider';
import { 
  X, 
  Building2, 
  Save, 
  Landmark, 
  Shield, 
  Users, 
  Server, 
  Coins, 
  GraduationCap, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { OrganizationEntity } from '@/types/process';

interface DepartmentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrg: OrganizationEntity) => void;
}

const AVAILABLE_ICONS = [
  { key: 'Building2', label: 'ساختمان اداری', icon: Building2 },
  { key: 'GraduationCap', label: 'آموزش و پژوهش', icon: GraduationCap },
  { key: 'Landmark', label: 'وزارتخانه و امور دولتی', icon: Landmark },
  { key: 'Shield', label: 'بیمه و حاکمیتی', icon: Shield },
  { key: 'Users', label: 'امور کارکنان و اجتماعی', icon: Users },
  { key: 'Server', label: 'فناوری و زیرساخت', icon: Server },
  { key: 'Coins', label: 'امور مالی و اقتصادی', icon: Coins },
];

export function DepartmentEditorModal({
  isOpen,
  onClose,
  onSuccess,
}: DepartmentEditorModalProps) {
  const { currentUser } = useUserSession();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // If slug hasn't been manually edited or is empty, suggest a transliterated/clean slug
    if (!slug || slug.startsWith('org-')) {
      const generated = 'org-' + val.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '').slice(0, 20);
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('نام سازمان یا اداره الزامی است.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          icon,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطایی در ثبت سازمان رخ داد.');
      }

      onSuccess(data);
      onClose();
      // Reset form
      setName('');
      setSlug('');
      setIcon('Building2');
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در برقراری ارتباط با پایگاه داده.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel-strong w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs"
              style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}
            >
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                ثبت سازمان یا ارگان جدید
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ذخیره مستقیم در پایگاه داده جهت اتصال به فرایندهای رسمی
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              نام رسمی سازمان یا وزارتخانه <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: وزارت امور اقتصادی و دارایی"
              className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              شناسه یکتا لاتین (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="مثال: org-economy"
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl text-sm border font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              این شناسه در آدرس‌های اینترنتی و فیلترهای سامانه استفاده خواهد شد.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              آیکون نمادین سازمان
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIcon(item.key)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-xs'
                        : 'border-transparent bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] text-center truncate w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال ذخیره در دیتابیس...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>ثبت سازمان در پایگاه داده</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
