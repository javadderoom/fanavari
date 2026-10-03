'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUserSession } from './user-session-provider';
import { notify } from '@/lib/notify';
import {
  X,
  Loader2,
  AlertCircle,
  FileText,
  Megaphone,
  BookOpen,
  Pin,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  FileEdit,
  Send,
  Check,
} from 'lucide-react';
import { InformationPost, InformationType, InformationPriority, OrganizationEntity, SystemTool } from '@/types/process';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';
import { RichTextEditor } from './rich-text-editor';

interface InformationEditorModalProps {
  isOpen: boolean;
  postToEdit?: InformationPost | null;
  departments: OrganizationEntity[];
  systems: SystemTool[];
  onClose: () => void;
  onSuccess: (post: InformationPost, isAutoSave?: boolean) => void;
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
  const [isPublished, setIsPublished] = useState(true);
  const [departmentId, setDepartmentId] = useState<string>('none');
  const [systemToolId, setSystemToolId] = useState<string>('none');
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-save and dirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Persistent reference to entity identity for sequential auto-saves
  const savedPostRef = useRef<{ id: string | null; slug: string | null; isPublished: boolean }>({
    id: null,
    slug: null,
    isPublished: true,
  });

  // State ref for interval callback without stale closure
  const stateRef = useRef({
    title,
    slug,
    summary,
    content,
    type,
    priority,
    isPinned,
    isPublished,
    departmentId,
    systemToolId,
    targetUrl,
    isDirty,
    isSubmitting,
  });

  useEffect(() => {
    stateRef.current = {
      title,
      slug,
      summary,
      content,
      type,
      priority,
      isPinned,
      isPublished,
      departmentId,
      systemToolId,
      targetUrl,
      isDirty,
      isSubmitting,
    };
  });

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setSlug(postToEdit.slug);
      setSummary(postToEdit.summary || '');
      setContent(postToEdit.content || '');
      setType(postToEdit.type || 'announcement');
      setPriority(postToEdit.priority || 'normal');
      setIsPinned(Boolean(postToEdit.isPinned));
      setIsPublished(postToEdit.isPublished !== undefined ? postToEdit.isPublished : true);
      setDepartmentId(postToEdit.departmentId || 'none');
      setSystemToolId(postToEdit.systemToolId || 'none');
      setTargetUrl(postToEdit.targetUrl || '');
      setIsSlugManuallyEdited(true);
      savedPostRef.current = {
        id: postToEdit.id,
        slug: postToEdit.slug,
        isPublished: postToEdit.isPublished !== undefined ? postToEdit.isPublished : true,
      };
    } else {
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      setType('announcement');
      setPriority('normal');
      setIsPinned(false);
      setIsPublished(true);
      setDepartmentId('none');
      setSystemToolId('none');
      setTargetUrl('');
      setIsSlugManuallyEdited(false);
      savedPostRef.current = {
        id: null,
        slug: null,
        isPublished: true,
      };
    }
    setIsDirty(false);
    setAutoSaveStatus('idle');
    setLastSavedAt(null);
    setErrorMessage(null);
  }, [postToEdit, isOpen]);

  // Periodic 10-second auto-save
  useEffect(() => {
    if (!isOpen) return;

    const intervalId = setInterval(async () => {
      const cur = stateRef.current;
      // Auto-save only when dirty, not currently busy, and either title or content is present
      if (!cur.isDirty || cur.isSubmitting) return;

      const isContentPresent =
        cur.content.trim() &&
        cur.content.trim() !== '<p></p>' &&
        cur.content.replace(/<[^>]*>/g, '').trim() !== '';

      if (!cur.title.trim() && !isContentPresent) return;

      await handleSaveOperation({ isDraft: true, isAutoSave: true });
    }, 10000); // exactly 10 seconds

    return () => clearInterval(intervalId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
    if (!isSlugManuallyEdited) {
      setSlug(formatToSlug(val));
    }
  };

  const handleSaveOperation = async ({
    isDraft,
    isAutoSave = false,
  }: {
    isDraft: boolean;
    isAutoSave?: boolean;
  }) => {
    const cur = stateRef.current;
    if (cur.isSubmitting && !isAutoSave) return;

    const effectiveTitle = cur.title.trim() || (isDraft ? 'پیش‌نویس بدون عنوان' : '');
    if (!effectiveTitle) {
      if (!isAutoSave) setErrorMessage('عنوان مطلب الزامی است.');
      return;
    }

    const isContentEmpty =
      !cur.content.trim() ||
      cur.content.trim() === '<p></p>' ||
      cur.content.replace(/<[^>]*>/g, '').trim() === '';

    if (!isDraft && isContentEmpty) {
      setErrorMessage('متن کامل محتوا برای انتشار الزامی است.');
      return;
    }

    if (isAutoSave) {
      setAutoSaveStatus('saving');
    } else {
      setIsSubmitting(true);
      setErrorMessage(null);
    }

    try {
      const currentId = savedPostRef.current.id;
      const currentSlug = savedPostRef.current.slug;
      const isExisting = Boolean(currentId || currentSlug);

      const cleanedSlug = cleanSlugForSubmit(cur.slug, effectiveTitle) || `info-${Date.now()}`;
      const targetIsPublished = !isDraft;

      const payload: any = {
        title: effectiveTitle,
        slug: cleanedSlug,
        summary: cur.summary.trim() || null,
        content: cur.content.trim(),
        type: cur.type,
        priority: cur.priority,
        isPinned: cur.isPinned,
        isPublished: targetIsPublished,
        departmentId: cur.departmentId === 'none' ? null : cur.departmentId,
        systemToolId: cur.systemToolId === 'none' ? null : cur.systemToolId,
        targetUrl: cur.targetUrl.trim() || null,
      };

      if (isExisting) {
        if (currentId) payload.id = currentId;
        if (currentSlug) payload.currentSlug = currentSlug;
      }

      const res = await fetch('/api/information', {
        method: isExisting ? 'PUT' : 'POST',
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

      // Update refs with returned persistent entity
      savedPostRef.current = {
        id: data.id,
        slug: data.slug,
        isPublished: data.isPublished,
      };
      if (!slug) setSlug(data.slug);
      setIsPublished(targetIsPublished);
      setIsDirty(false);

      const now = new Date();
      const timeStr = '\u200E' + now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedAt(timeStr);
      setAutoSaveStatus('saved');

      onSuccess(data, isAutoSave);

      if (!isAutoSave) {
        if (isDraft) {
          notify.success('پیش‌نویس با موفقیت ذخیره شد.');
        } else {
          notify.success(isEditing ? 'مطلب با موفقیت بروزرسانی شد.' : 'اطلاعیه با موفقیت منتشر گردید.');
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Error in handleSaveOperation:', err);
      if (!isAutoSave) {
        setErrorMessage(err.message || 'خطا در برقراری ارتباط با سرور.');
      } else {
        setAutoSaveStatus('idle');
      }
    } finally {
      if (!isAutoSave) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="info-modal-title" className="text-lg font-bold text-white">
                  {isEditing ? 'ویرایش اطلاعیه / مطلب اطلاعاتی' : 'ثبت مطلب و اطلاعیه جدید'}
                </h2>
                {!isPublished ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <FileEdit className="w-3 h-3" />
                    <span>پیش‌نویس</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>منتشر شده</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبت و ویرایش اطلاعیه‌ها، بخشنامه‌ها و راهنماها با ادیتور غنی HTML و ذخیره خودکار هر ۱۰ ثانیه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => { e.preventDefault(); handleSaveOperation({ isDraft: false }); }} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                    onClick={() => {
                      setType(t.key);
                      setIsDirty(true);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
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
                placeholder="مثال: بخشنامه جامع تغییر سامانه ثبت نمرات و فرآیند ارزشیابی"
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
                  setIsDirty(true);
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
                    onClick={() => {
                      setPriority(p.key);
                      setIsDirty(true);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
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
                  onChange={(e) => {
                    setIsPinned(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
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
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setIsDirty(true);
                  }}
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
                  onChange={(e) => {
                    setSystemToolId(e.target.value);
                    setIsDirty(true);
                  }}
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
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  setIsDirty(true);
                }}
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
              onChange={(e) => {
                setSummary(e.target.value);
                setIsDirty(true);
              }}
              placeholder="یک یا دو جمله برای معرفی اجمالی بخشنامه یا راهنما..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Full Content (WordPad / Word Rich Text WYSIWYG Editor with Full-Screen Mode) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-200">
                  متن کامل توضیحات و محتوا <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ویرایشگر پیشرفته با خروجی استاندارد HTML، جداول، تراز متن، لیست‌ها و حالت تمام‌صفحه
                </p>
              </div>
            </div>

            <RichTextEditor
              value={content}
              onChange={(html) => {
                setContent(html);
                setIsDirty(true);
              }}
              placeholder="متن کامل بخشنامه یا راهنما را اینجا بنویسید..."
              minHeight="260px"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/95">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {autoSaveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ذخیره خودکار پیش‌نویس...</span>
              </span>
            ) : autoSaveStatus === 'saved' && lastSavedAt ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>پیش‌نویس ذخیره شد ({lastSavedAt})</span>
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-300/80">
                <Clock className="w-3.5 h-3.5" />
                <span>تغییرات ذخیره‌نشده (ذخیره خودکار هر ۱۰ ثانیه)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                <span>سیستم ذخیره خودکار پیش‌نویس فعال است</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              انصراف
            </button>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={() => handleSaveOperation({ isDraft: true })}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && autoSaveStatus !== 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileEdit className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>ذخیره پیش‌نویس</span>
            </button>

            {/* Publish Button */}
            <button
              type="button"
              onClick={() => handleSaveOperation({ isDraft: false })}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isSubmitting && autoSaveStatus !== 'saving' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال انتشار...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'بروزرسانی و انتشار' : 'انتشار اطلاعیه'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
