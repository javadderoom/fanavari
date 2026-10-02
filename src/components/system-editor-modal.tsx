'use client';

import React, { useState, useEffect } from 'react';
import { useUserSession } from './user-session-provider';
import { 
  X, 
  Laptop, 
  Save, 
  Globe, 
  Server, 
  Layers, 
  GitBranch, 
  Table, 
  Calculator, 
  Shield, 
  Key, 
  Container, 
  GraduationCap, 
  Building2, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Edit,
  ExternalLink
} from 'lucide-react';
import { SystemTool } from '@/types/process';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';

interface SystemEditorModalProps {
  isOpen: boolean;
  systemToEdit?: SystemTool | null;
  onClose: () => void;
  onSuccess: (tool: SystemTool) => void;
}

const AVAILABLE_ICONS = [
  { key: 'Laptop', label: 'سامانه نرم‌افزاری', icon: Laptop },
  { key: 'Globe', label: 'پرتال و وبگاه', icon: Globe },
  { key: 'GraduationCap', label: 'آموزش و پژوهش', icon: GraduationCap },
  { key: 'Server', label: 'سرور و زیرساخت', icon: Server },
  { key: 'Layers', label: 'طراحی و ابزار', icon: Layers },
  { key: 'GitBranch', label: 'سورس و توسعه', icon: GitBranch },
  { key: 'Table', label: 'اکسل و پایگاه داده', icon: Table },
  { key: 'Calculator', label: 'حسابداری و مالی', icon: Calculator },
  { key: 'Shield', label: 'امنیت و پدافند', icon: Shield },
  { key: 'Key', label: 'احراز هویت و توکن', icon: Key },
  { key: 'Container', label: 'کانتینر و شبکه', icon: Container },
  { key: 'Building2', label: 'سازمانی و اداری', icon: Building2 },
];

const CATEGORIES = [
  { key: 'portal', label: 'سامانه و درگاه تحت وب (Portal)' },
  { key: 'software', label: 'نرم‌افزار دسکتاپ و ابزار کاربردی (Software)' },
  { key: 'devtools', label: 'ابزار مهندسی و برنامه‌نویسی (DevTools)' },
  { key: 'erp', label: 'سیستم سازمانی و ERP (Enterprise)' },
];

export function SystemEditorModal({
  isOpen,
  systemToEdit,
  onClose,
  onSuccess,
}: SystemEditorModalProps) {
  const { currentUser } = useUserSession();
  const isEditing = Boolean(systemToEdit);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState<'software' | 'erp' | 'portal' | 'devtools'>('portal');
  const [icon, setIcon] = useState('Laptop');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (systemToEdit) {
      setName(systemToEdit.name);
      setSlug(systemToEdit.slug);
      setCategory(systemToEdit.category || 'portal');
      setIcon(systemToEdit.icon || 'Laptop');
      setWebsiteUrl(systemToEdit.websiteUrl || '');
      setDescription(systemToEdit.description || '');
      setIsSlugManuallyEdited(true);
    } else {
      setName('');
      setSlug('');
      setCategory('portal');
      setIcon('Laptop');
      setWebsiteUrl('');
      setDescription('');
      setIsSlugManuallyEdited(false);
    }
    setErrorMessage(null);
  }, [systemToEdit, isOpen]);

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
      setErrorMessage('نام نرم‌افزار یا سامانه الزامی است.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const finalSlug = cleanSlugForSubmit(slug || name, 'sys');

    try {
      const endpoint = '/api/systems';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? {
            id: systemToEdit?.id,
            currentSlug: systemToEdit?.slug,
            name: name.trim(),
            slug: finalSlug,
            category,
            icon,
            websiteUrl: websiteUrl.trim() || null,
            description: description.trim() || null,
          }
        : {
            name: name.trim(),
            slug: finalSlug,
            category,
            icon,
            websiteUrl: websiteUrl.trim() || null,
            description: description.trim() || null,
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
        throw new Error(data.error || 'خطایی در پردازش اطلاعات سامانه رخ داد.');
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
        className="glass-panel-strong w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs"
              style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}
            >
              {isEditing ? (
                <Edit className="w-5 h-5 text-blue-600" />
              ) : (
                <Laptop className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? 'ویرایش نرم‌افزار یا سامانه' : 'ثبت نرم‌افزار / سامانه جدید'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isEditing ? 'ویرایش مشخصات، درگاه و دسته‌بندی در پایگاه داده' : 'افزودن مستقیم به بانک نرم‌افزارها و پرتال‌های سازمانی'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body - scrollable */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* System Name */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              نام نرم‌افزار، ابزار یا سامانه <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: سامانه LTMS فرهنگیان یا نرم‌افزار Figma"
              className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Latin Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                شناسه یکتا در URL (Slug)
              </label>
              {name.trim() && (
                <button
                  type="button"
                  onClick={handleAutoGenerateSlug}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تولید خودکار</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="مثال: ltms یا figma-app"
                className="w-full px-4 py-2 rounded-xl text-xs font-mono border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <p className="text-[11px] mt-1 text-slate-400">
              مسیر صفحه در سایت: <span className="font-mono text-blue-500">/system/{slug || '...'}</span>
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              دسته‌بندی سامانه / ابزار
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl text-xs border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
              <span>آدرس وب‌سایت یا پرتال رسمی (اختیاری)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </label>
            <input
              type="url"
              dir="ltr"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://ltms.medu.ir"
              className="w-full px-4 py-2 rounded-xl text-xs font-mono border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              توضیحات و معرفی کاربردها
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح کوتاه درباره ماهیت، کارکرد و مخاطبان این سامانه یا ابزار نرم‌افزاری..."
              className="w-full px-4 py-2.5 rounded-xl text-xs border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all whitespace-pre-line"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              آیکون سامانه
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIcon(item.key)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 shadow-xs scale-102'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-500'
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-[10px] truncate max-w-full font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex items-center justify-end gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'ذخیره تغییرات' : 'ثبت سامانه'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
