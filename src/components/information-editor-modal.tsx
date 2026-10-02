'use client';

import React, { useState, useEffect } from 'react';
import { useUserSession } from './user-session-provider';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Megaphone,
  BookOpen,
  Pin,
  ExternalLink,
  Building2,
  Laptop,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { InformationPost, InformationType, InformationPriority, OrganizationEntity, SystemTool } from '@/types/process';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';

interface InformationEditorModalProps {
  isOpen: boolean;
  postToEdit?: InformationPost | null;
  departments: OrganizationEntity[];
  systems: SystemTool[];
  onClose: () => void;
  onSuccess: (post: InformationPost) => void;
}

const POST_TYPES: { key: InformationType; label: string; icon: any; color: string; desc: string }[] = [
  {
    key: 'announcement',
    label: 'اطلاعیه رسمی',
    icon: Megaphone,
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    desc: 'اطلاعیه‌های خبری و اطلاعیه‌های دوره‌ای سازمان',
  },
  {
    key: 'circular',
    label: 'بخشنامه و دستورالعمل',
    icon: FileText,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    desc: 'ابلاغیه‌های اداری، آیین‌نامه‌ها و بخشنامه‌های رسمی',
  },
  {
    key: 'guide',
    label: 'معرفی سامانه و راهنما',
    icon: BookOpen,
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    desc: 'معرفی سامانه‌ها، ورود سریع و آموزش کاربری',
  },
  {
    key: 'article',
    label: 'مقاله و پایگاه دانش',
    icon: HelpCircle,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    desc: 'پاسخ به سوالات پرتکرار و مطالب آموزشی',
  },
];

const PRIORITIES: { key: InformationPriority; label: string; color: string }[] = [
  { key: 'normal', label: 'عادی', color: 'border-slate-700 bg-slate-800 text-slate-300' },
  { key: 'high', label: 'مهم', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { key: 'urgent', label: 'فوری / قرمز', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
];

export function InformationEditorModal({
  isOpen,
  postToEdit,
  departments,
  systems,
  onClose,
  onSuccess,
}: InformationEditorModalProps) {
  const { currentUser } = useUserSession();
  const isEditing = Boolean(postToEdit);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<InformationType>('announcement');
  const [priority, setPriority] = useState<InformationPriority>('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [departmentId, setDepartmentId] = useState<string>('none');
  const [systemToolId, setSystemToolId] = useState<string>('none');
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setSlug(postToEdit.slug);
      setSummary(postToEdit.summary || '');
      setContent(postToEdit.content || '');
      setType(postToEdit.type || 'announcement');
      setPriority(postToEdit.priority || 'normal');
      setIsPinned(Boolean(postToEdit.isPinned));
      setDepartmentId(postToEdit.departmentId || 'none');
      setSystemToolId(postToEdit.systemToolId || 'none');
      setTargetUrl(postToEdit.targetUrl || '');
      setIsSlugManuallyEdited(true);
    } else {
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      setType('announcement');
      setPriority('normal');
      setIsPinned(false);
      setDepartmentId('none');
      setSystemToolId('none');
      setTargetUrl('');
      setIsSlugManuallyEdited(false);
    }
    setErrorMessage(null);
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(formatToSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('عنوان مطلب الزامی است.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('متن کامل محتوا الزامی است.');
      return;
    }

    const cleanedSlug = cleanSlugForSubmit(slug, title) || `info-${Date.now()}`;

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        slug: cleanedSlug,
        summary: summary.trim() || null,
        content: content.trim(),
        type,
        priority,
        isPinned,
        departmentId: departmentId === 'none' ? null : departmentId,
        systemToolId: systemToolId === 'none' ? null : systemToolId,
        targetUrl: targetUrl.trim() || null,
      };

      if (isEditing && postToEdit) {
        payload.id = postToEdit.id;
        payload.currentSlug = postToEdit.slug;
      }

      const res = await fetch('/api/information', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت اطلاعات.');
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      console.error('Error saving information post:', err);
      setErrorMessage(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 id="info-modal-title" className="text-lg font-bold text-white">
                {isEditing ? 'ویرایش اطلاعیه / مطلب اطلاعاتی' : 'ثبت مطلب و اطلاعیه جدید'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                انتشار اطلاعیه‌ها، بخشنامه‌های سازمانی، راهنماها و پایگاه دانش
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">نوع محتوا</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POST_TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? `${t.color} ring-1 ring-current shadow-sm`
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/60 shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">{t.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                عنوان مطلب / اطلاعیه <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="مثال: بخشنامه تغییر سامانه ثبت نمرات و فرآیند ارزشیابی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                شناسه یکتا (Slug)
              </label>
              <input
                type="text"
                dir="ltr"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                placeholder="grading-system-circular"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 font-mono text-left"
              />
            </div>
          </div>

          {/* Priority & Pinned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">سطح اهمیت و اولویت</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      priority === p.key
                        ? `${p.color} ring-1 ring-current shadow-sm`
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center sm:justify-end pt-3 sm:pt-0">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-indigo-400 fill-indigo-400' : 'text-slate-500'}`} />
                  سنجاق در بالای لیست (مهم و برجسته)
                </div>
              </label>
            </div>
          </div>

          {/* Relations: Department & System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                سازمان متولی (اختیاری)
              </label>
              <div className="relative">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">عمومی / بدون اتصال به سازمان خاص</option>
                  {departments.map((d) => (
                    <option key={d.id || d.slug} value={d.id || d.slug}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                سامانه مرتبط (اختیاری)
              </label>
              <div className="relative">
                <select
                  value={systemToolId}
                  onChange={(e) => setSystemToolId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">عمومی / بدون اتصال به سامانه</option>
                  {systems.map((s) => (
                    <option key={s.id || s.slug} value={s.id || s.slug}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Target / Reference URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              لینک مرجع یا فایل دانلودی (اختیاری)
            </label>
            <div className="relative">
              <input
                type="url"
                dir="ltr"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.gov.ir/circulars/123.pdf"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 text-left font-mono"
              />
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              خلاصه مطلب (نمایش در کارت‌های پیش‌نمایش)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="یک یا دو جمله برای معرفی اجمالی بخشنامه یا راهنما..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Full Content (Markdown / Multiline) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                متن کامل محتوا <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">پشتیبانی از فاصله‌گذاری خطوط و مارک‌داون</span>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`متن کامل اطلاعیه، شرایط، مواد قانونی و مراحل اقدام را اینجا بنویسید...\n\n- بند اول: نکات اجرایی\n- بند دوم: مهلت اقدام\n- آدرس ورود به سامانه`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            انصراف
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال ذخیره‌سازی...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'بروزرسانی مطلب' : 'انتشار اطلاعیه'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
