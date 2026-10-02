'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Sparkles,
  Edit
} from 'lucide-react';
import { OrganizationEntity } from '@/types/process';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';

interface DepartmentEditorModalProps {
  isOpen: boolean;
  departmentToEdit?: OrganizationEntity | null;
  onClose: () => void;
  onSuccess: (org: OrganizationEntity) => void;
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
  departmentToEdit,
  onClose,
  onSuccess,
}: DepartmentEditorModalProps) {
  const { currentUser } = useUserSession();
  const isEditing = Boolean(departmentToEdit);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [icon, setIcon] = useState('Building2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (departmentToEdit) {
      setName(departmentToEdit.name);
      setSlug(departmentToEdit.slug);
      setIcon(departmentToEdit.icon || 'Building2');
      setIsSlugManuallyEdited(true);
    } else {
      setName('');
      setSlug('');
      setIcon('Building2');
      setIsSlugManuallyEdited(false);
    }
    setErrorMessage(null);
  }, [departmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited && !isEditing) {
      setSlug(formatToSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(formatToSlug(val));
  };

  const handleAutoGenerateSlug = () => {
    setIsSlugManuallyEdited(true);
    setSlug(formatToSlug(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('نام سازمان یا اداره الزامی است.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const finalSlug = cleanSlugForSubmit(slug || name, 'org');

    try {
      const endpoint = '/api/departments';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? {
            id: departmentToEdit?.id,
            currentSlug: departmentToEdit?.slug,
            name: name.trim(),
            slug: finalSlug,
            icon,
          }
        : {
            name: name.trim(),
            slug: finalSlug,
            icon,
          };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطایی در پردازش اطلاعات سازمان رخ داد.');
      }

      onSuccess(data);
      onClose();
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
              {isEditing ? (
                <Edit className="w-5 h-5 text-blue-600" />
              ) : (
                <Building2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? 'ویرایش اطلاعات سازمان' : 'ثبت سازمان یا ارگان جدید'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isEditing ? 'ویرایش مشخصات، نام و شناسه سازمانی در پایگاه داده' : 'ذخیره مستقیم در پایگاه داده جهت اتصال به فرایندهای رسمی'}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                شناسه یکتای URL (Slug)
              </label>
              {name.trim() && (
                <button
                  type="button"
                  onClick={handleAutoGenerateSlug}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>تولید از نام سازمان</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="مثال: org-medu یا اموزش-و-پرورش"
              dir="auto"
              className="w-full px-4 py-2.5 rounded-xl text-sm border font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 flex-wrap gap-1">
              <span className="font-mono truncate max-w-xs" dir="ltr">
                /?dept={slug || '...'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ فاصله‌ها خودکار به خط تیره (-) تبدیل می‌شوند
              </span>
            </div>
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
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'ذخیره تغییرات سازمان' : 'ثبت سازمان در پایگاه داده'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
