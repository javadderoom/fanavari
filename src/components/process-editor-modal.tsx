'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessStep, StepType, WorkflowScope, ErrorGuideItem, CopyableField } from '@/types/process';
import { useUserSession } from './user-session-provider';
import { Permissions } from '@/lib/permissions';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  AlertTriangle, 
  Copy, 
  GitFork, 
  CheckCircle, 
  Clock, 
  Globe, 
  Laptop, 
  FileText,
  Sparkles
} from 'lucide-react';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';

interface ProcessEditorModalProps {
  isOpen: boolean;
  processToEdit: Process | null;
  onClose: () => void;
  onSave: (process: Process) => void;
}

export function ProcessEditorModal({
  isOpen,
  processToEdit,
  onClose,
  onSave,
}: ProcessEditorModalProps) {
  const { can, isSuperAdmin } = useUserSession();

  const isEditing = Boolean(processToEdit);
  const canSave = isEditing ? can(Permissions.EDIT_PROCESSES) : can(Permissions.CREATE_PROCESSES);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<WorkflowScope>('organization');
  const [category, setCategory] = useState<Process['category']>('hr');
  const [departmentName, setDepartmentName] = useState('وزارت آموزش و پرورش');
  const [targetSystem, setTargetSystem] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [tagsInput, setTagsInput] = useState('');

  // Live departments list from database
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/departments')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDepartmentsList(data);
          }
        })
        .catch((err) => console.error('Error fetching departments:', err));
    }
  }, [isOpen]);

  // Steps state
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  useEffect(() => {
    if (processToEdit) {
      setTitle(processToEdit.title);
      setSlug(processToEdit.slug);
      setDescription(processToEdit.description);
      setScope(processToEdit.scope || 'organization');
      setCategory(processToEdit.category);
      setDepartmentName(processToEdit.departmentName);
      setTargetSystem(processToEdit.targetSystem);
      setTargetUrl(processToEdit.targetUrl || '');
      setEstimatedMinutes(processToEdit.estimatedMinutes);
      setTagsInput(processToEdit.tags.join('، '));
      setSteps(
        (processToEdit.steps || []).map((s) => ({
          ...s,
          copyableFields: s.copyableFields ? [...s.copyableFields] : [],
          errorGuides: (s.errorGuides || []).map((err: any) => ({
            id: err.id || `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            errorCode: err.errorCode || '',
            errorTitle: err.errorTitle || '',
            cause: err.cause || '',
            solution: err.solution || err.solutionMarkdown || '',
            escalationContact: err.escalationContact || '',
            screenshotUrl: err.screenshotUrl || '',
          })),
        }))
      );
    } else {
      // Defaults for brand new process
      setTitle('');
      setSlug('');
      setDescription('');
      setScope('organization');
      setCategory('hr');
      setDepartmentName('مدیریت منابع انسانی');
      setTargetSystem('سامانه جامع اداری');
      setTargetUrl('');
      setEstimatedMinutes(15);
      setTagsInput('فرایند جدید، استاندارد سازمانی');
      setSteps([
        {
          id: `step-${Date.now()}-1`,
          orderIndex: 1,
          stepKey: 'step-1-start',
          title: 'گام ۱: ورود به سیستم و انتخاب منو',
          contentMarkdown: 'با حساب کاربری خود لاگین کرده و از منوی سمت راست گزینه مورد نظر را انتخاب نمایید.',
          stepType: 'action',
          targetMenuPath: 'داشبورد > منوی عملیات > ثبت جدید',
          copyableFields: [{ label: 'نمونه ورودی تستی', value: '12345678' }],
          errorGuides: [
            {
              id: `err-${Date.now()}-1`,
              errorCode: 'ERR-403',
              errorTitle: 'عدم دسترسی کاربری',
              cause: 'حساب دسترسی لازم را ندارد',
              solution: 'با ادمین سامانه جهت اعطای دسترسی تماس بگیرید.',
            }
          ],
        },
      ]);
    }
  }, [processToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const nextIndex = steps.length + 1;
    const newStep: ProcessStep = {
      id: `step-${Date.now()}-${nextIndex}`,
      orderIndex: nextIndex,
      stepKey: `step-${nextIndex}`,
      title: `گام ${nextIndex}: مرحله جدید`,
      contentMarkdown: 'توضیحات و دستورالعمل اجرایی این گام را اینجا بنویسید...',
      stepType: 'action',
      targetMenuPath: '',
      copyableFields: [],
      errorGuides: [],
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (indexToRemove: number) => {
    const filtered = steps.filter((_, idx) => idx !== indexToRemove);
    // Re-index remaining steps
    const reindexed = filtered.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
    setSteps(reindexed);
  };

  const handleUpdateStep = (index: number, updatedFields: Partial<ProcessStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...updatedFields };
    setSteps(updated);
  };

  // Error guides management for a step
  const handleAddErrorGuide = (stepIndex: number) => {
    const updated = [...steps];
    const currentGuides = updated[stepIndex].errorGuides || [];
    const newGuide: ErrorGuideItem = {
      id: `err-${Date.now()}-${currentGuides.length + 1}`,
      errorCode: `ERR-${stepIndex + 1}-${currentGuides.length + 1}`,
      errorTitle: '',
      cause: '',
      solution: '',
    };
    updated[stepIndex] = {
      ...updated[stepIndex],
      errorGuides: [...currentGuides, newGuide],
    };
    setSteps(updated);
  };

  const handleUpdateErrorGuide = (
    stepIndex: number,
    errIndex: number,
    fields: Partial<ErrorGuideItem>
  ) => {
    const updated = [...steps];
    const currentGuides = [...(updated[stepIndex].errorGuides || [])];
    currentGuides[errIndex] = { ...currentGuides[errIndex], ...fields };
    updated[stepIndex] = {
      ...updated[stepIndex],
      errorGuides: currentGuides,
    };
    setSteps(updated);
  };

  const handleRemoveErrorGuide = (stepIndex: number, errIndex: number) => {
    const updated = [...steps];
    const currentGuides = (updated[stepIndex].errorGuides || []).filter((_, idx) => idx !== errIndex);
    updated[stepIndex] = {
      ...updated[stepIndex],
      errorGuides: currentGuides,
    };
    setSteps(updated);
  };

  // Copyable fields management for a step
  const handleAddCopyableField = (stepIndex: number) => {
    const updated = [...steps];
    const currentFields = updated[stepIndex].copyableFields || [];
    const newField: CopyableField = {
      label: '',
      value: '',
    };
    updated[stepIndex] = {
      ...updated[stepIndex],
      copyableFields: [...currentFields, newField],
    };
    setSteps(updated);
  };

  const handleUpdateCopyableField = (
    stepIndex: number,
    fIndex: number,
    fields: Partial<CopyableField>
  ) => {
    const updated = [...steps];
    const currentFields = [...(updated[stepIndex].copyableFields || [])];
    currentFields[fIndex] = { ...currentFields[fIndex], ...fields };
    updated[stepIndex] = {
      ...updated[stepIndex],
      copyableFields: currentFields,
    };
    setSteps(updated);
  };

  const handleRemoveCopyableField = (stepIndex: number, fIndex: number) => {
    const updated = [...steps];
    const currentFields = (updated[stepIndex].copyableFields || []).filter((_, idx) => idx !== fIndex);
    updated[stepIndex] = {
      ...updated[stepIndex],
      copyableFields: currentFields,
    };
    setSteps(updated);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited && !processToEdit) {
      setSlug(formatToSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(formatToSlug(val));
  };

  const handleAutoGenerateSlug = () => {
    setIsSlugManuallyEdited(true);
    setSlug(formatToSlug(title));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('لطفاً عنوان فرایند را وارد کنید');

    const finalSlug = cleanSlugForSubmit(slug || title, 'proc');
    const tagsArray = tagsInput
      .split(/[،,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const matchedDept = departmentsList.find((d) => d.name === departmentName.trim());

    const savedProcess: Process = {
      id: processToEdit?.id || `proc-${Date.now()}`,
      slug: finalSlug,
      title: title.trim(),
      description: description.trim(),
      scope,
      category,
      departmentName: departmentName.trim() || 'مدیریت سازمانی',
      departmentSlug: matchedDept?.slug,
      targetSystem: targetSystem.trim() || 'سامانه سازمانی',
      targetSystemSlug: targetSystem.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      targetUrl: targetUrl.trim() || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 10,
      totalSteps: steps.length,
      tags: tagsArray,
      steps,
      updatedAt: 'همین الان',
    };

    onSave(savedProcess);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden glass-panel-strong z-10 transition-all shadow-2xl animate-in zoom-in-95"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-strong)' }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? 'ویرایش فرایند' : 'ثبت و تعریف فرایند جدید (MVP)'}
              </h2>
              <span className="text-xs text-slate-500">
                سیستم ثبت مستقیم فرایندها برای Super Admin
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {!canSave && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>کاربر فعلی شما مجوز لازم برای ثبت یا ویرایش فرایند را ندارد! لطفاً با نقش دارای مجوز (مانند مدیر ارشد یا کارشناس تدوین) وارد شوید.</span>
            </div>
          )}

          {/* Basic Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                عنوان کامل فرایند *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="مثلاً: ثبت پرسنل جدید، یا به‌روزرسانی ابلاغ و حکم..."
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  شناسه یکتای URL (Slug)
                </label>
                {title.trim() && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateSlug}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>تولید خودکار از عنوان</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="مثال: ltms-decree-update یا بروزرسانی-ابلاغ"
                dir="auto"
                className="w-full p-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 flex-wrap gap-1">
                <span className="font-mono truncate max-w-xs" dir="ltr">
                  /process/{slug || '...'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ فاصله‌ها خودکار به خط تیره (-) تبدیل می‌شوند
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                حوزه و ماهیت فرایند
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as WorkflowScope)}
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              >
                <option value="organization">سازمانی، اداری و مراجع دولتی</option>
                <option value="software">کار با نرم‌افزارها و ابزارهای مهندسی</option>
                <option value="portal">پرتال‌های وب و سامانه‌های برخط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                دسته‌بندی موضوعی
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              >
                <option value="hr">منابع انسانی و کارگزینی</option>
                <option value="finance">مالی و مودیان مالیاتی</option>
                <option value="it">فناوری اطلاعات و زیرساخت</option>
                <option value="design">طراحی محصول و UI/UX</option>
                <option value="legal">حقوقی و گواهی الکترونیک</option>
                <option value="support">پشتیبانی و امور مشتریان</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                دپارتمان یا سازمان متولی (پایگاه داده)
              </label>
              {departmentsList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={departmentsList.some((d) => d.name === departmentName) ? departmentName : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setDepartmentName(e.target.value);
                      } else {
                        setDepartmentName('');
                      }
                    }}
                    className="w-full p-3 rounded-xl border text-sm font-medium outline-none cursor-pointer"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  >
                    {departmentsList.map((d) => (
                      <option key={d.slug} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    <option value="custom">سایر / ورود دستی نام سازمان...</option>
                  </select>
                  {(!departmentsList.some((d) => d.name === departmentName) || departmentName === '') && (
                    <input
                      type="text"
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      placeholder="نام دقیق سازمان یا واحد را بنویسید..."
                      className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="مثلاً: وزارت آموزش و پرورش"
                  className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Laptop className="w-3.5 h-3.5 text-blue-500" />
                <span>نام نرم‌افزار یا سامانه هدف</span>
              </label>
              <input
                type="text"
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
                placeholder="مثلاً: فیگما، گیت‌هاب، سامانه LTMS، سیدا..."
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>نشانی اینترنتی سامانه (URL)</span>
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://ltms.medu.ir"
                dir="ltr"
                className="w-full p-3 rounded-xl border text-sm font-mono text-left outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>مدت زمان تقریبی اجرا (دقیقه)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-full p-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 select-none">
                  دقیقه
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                برچسب‌ها و کلمات کلیدی (با کاما یا ویرگول جدا کنید)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="مثلاً: آموزش، فرهنگیان، استعلام حکم، سیدا"
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              توضیح کوتاه و هدف فرایند
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="خلاصه‌ای از اینکه این فرایند چه کاری انجام می‌دهد و خروجی آن چیست..."
              className="w-full p-3 rounded-xl border text-sm font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Steps Management Section */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  مراحل و گام‌های فرایند ({steps.length} گام)
                </h3>
                <span className="text-xs text-slate-500">
                  هر مرحله به عنوان یک نود در فلوچارت رسم شده و به ترتیب هدایت می‌شود.
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن مرحله جدید</span>
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl border transition-all"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        گام {step.orderIndex}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                        className="text-sm font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none pb-0.5"
                        placeholder="عنوان مرحله..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={step.stepType}
                        onChange={(e) => handleUpdateStep(idx, { stepType: e.target.value as StepType })}
                        className="text-xs p-1.5 rounded-lg border font-medium outline-none"
                        style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
                      >
                        <option value="action">نود اقدام (Action)</option>
                        <option value="decision">نود تصمیم‌گیری (Decision)</option>
                        <option value="warning">نود هشدار (Warning)</option>
                        <option value="end">نود پایان (End)</option>
                      </select>

                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          title="حذف این گام"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Menu path input */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={step.targetMenuPath || ''}
                      onChange={(e) => handleUpdateStep(idx, { targetMenuPath: e.target.value })}
                      placeholder="مسیر کلیک منوها (مثلاً: منوی اصلی > تنظیمات > خروجی)"
                      className="w-full p-2 text-xs rounded-lg border outline-none font-mono"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
                    />
                  </div>

                  {/* Step Description */}
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      دستورالعمل اجرایی و شرح تفصیلی گام
                    </label>
                    <textarea
                      rows={2}
                      value={step.contentMarkdown}
                      onChange={(e) => handleUpdateStep(idx, { contentMarkdown: e.target.value })}
                      placeholder="دستورالعمل اجرایی، پیش‌نیازها و نکات کلیدی این مرحله را بنویسید..."
                      className="w-full p-2.5 text-xs rounded-xl border outline-none leading-relaxed transition-all focus:ring-2 focus:ring-blue-500"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Step Copyable Helper Fields */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Copy className="w-3.5 h-3.5" />
                        <span>فیلدهای نمونه و داده‌های قابل کپی ({step.copyableFields?.length || 0})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCopyableField(idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer border border-blue-500/20"
                      >
                        <Plus className="w-3 h-3" />
                        <span>افزودن فیلد نمونه</span>
                      </button>
                    </div>

                    {step.copyableFields && step.copyableFields.length > 0 ? (
                      <div className="space-y-2">
                        {step.copyableFields.map((field, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40"
                          >
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  عنوان فیلد (برچسب)
                                </label>
                                <input
                                  type="text"
                                  value={field.label || ''}
                                  onChange={(e) => handleUpdateCopyableField(idx, fIdx, { label: e.target.value })}
                                  placeholder="مثلاً: آدرس سامانه یا کد پیگیری"
                                  className="w-full p-2 text-xs rounded-lg border font-medium outline-none"
                                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  مقدار قابل کپی (Value)
                                </label>
                                <input
                                  type="text"
                                  value={field.value || ''}
                                  onChange={(e) => handleUpdateCopyableField(idx, fIdx, { value: e.target.value })}
                                  placeholder="مثلاً: 12345678 یا https://..."
                                  dir="auto"
                                  className="w-full p-2 text-xs rounded-lg border font-mono outline-none"
                                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCopyableField(idx, fIdx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer self-center"
                              title="حذف این فیلد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        فیلد یا دیتای نمونه‌ای برای کپی مستقیم در این گام تعریف نشده است.
                      </p>
                    )}
                  </div>

                  {/* Step Error Guides */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>راهنمای خطاها و اشکالات این مرحله ({step.errorGuides?.length || 0} خطا)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddErrorGuide(idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition-colors cursor-pointer border border-rose-500/20"
                      >
                        <Plus className="w-3 h-3" />
                        <span>افزودن خطا به این گام</span>
                      </button>
                    </div>

                    {step.errorGuides && step.errorGuides.length > 0 ? (
                      <div className="space-y-3">
                        {step.errorGuides.map((err, errIdx) => (
                          <div
                            key={err.id || errIdx}
                            className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    کد اختصاصی خطا (Error Code)
                                  </label>
                                  <input
                                    type="text"
                                    value={err.errorCode || ''}
                                    onChange={(e) => handleUpdateErrorGuide(idx, errIdx, { errorCode: e.target.value })}
                                    placeholder="مثلاً: ERR-403 یا LTMS-ERR-01"
                                    dir="ltr"
                                    className="w-full p-2 text-xs rounded-lg border font-mono font-bold text-rose-600 dark:text-rose-400 outline-none"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    عنوان و شرح خطای دریافتی
                                  </label>
                                  <input
                                    type="text"
                                    value={err.errorTitle || ''}
                                    onChange={(e) => handleUpdateErrorGuide(idx, errIdx, { errorTitle: e.target.value })}
                                    placeholder="مثلاً: عدم یافتن ابلاغ تدریس در سرور پایگاه مرکزی"
                                    className="w-full p-2 text-xs rounded-lg border font-medium outline-none"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveErrorGuide(idx, errIdx)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer mt-5"
                                title="حذف این راهنمای خطا"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                دستورالعمل و راهکار تست‌شده رفع خطا (Solution)
                              </label>
                              <textarea
                                rows={2}
                                value={err.solution || ''}
                                onChange={(e) => handleUpdateErrorGuide(idx, errIdx, { solution: e.target.value })}
                                placeholder="راهکار گام‌به‌گام برای کاربر یا پرسنل جهت برطرف کردن این مشکل..."
                                className="w-full p-2.5 text-xs rounded-lg border outline-none leading-relaxed"
                                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        هیچ خطایی برای این مرحله ثبت نشده است. در صورت نیاز با زدن «افزودن خطا به این گام» آن را اضافه نمایید.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={!canSave}
              className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105 disabled:opacity-40"
              style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'ذخیره تغییرات فرایند' : 'ثبت نهایی فرایند'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
