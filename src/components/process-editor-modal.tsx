'use client';

import React, { useState, useEffect } from 'react';
import { 
  Process, 
  ProcessStep, 
  PersianMonth,
  PersianSeason,
  ProcessSchedule,
  ProcessScopeEntity,
  ProcessCategoryEntity,
  ProcessVisibility
} from '@/types/process';
import { useUserSession } from './user-session-provider';
import { Permissions } from '@/lib/permissions';
import { 
  X, 
  Plus, 
  Save, 
  Layers, 
  Sparkles, 
  Edit3
} from 'lucide-react';
import { notify } from '@/lib/notify';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';
import { getSeasonForMonth } from './editor/types';
import { AdvancedSettingsSection } from './editor/advanced-settings-section';
import { StepEditorCard } from './editor/step-editor-card';
import { ProcessMetadataFields } from './editor/process-metadata-fields';

export { PERSIAN_MONTHS, getSeasonForMonth } from './editor/types';

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
  const { currentUser, can } = useUserSession();

  const isEditing = Boolean(processToEdit);
  const canSave = isEditing ? can(Permissions.EDIT_PROCESSES) : can(Permissions.CREATE_PROCESSES);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<string>('organization');
  const [category, setCategory] = useState<string>('hr');
  const [visibility, setVisibility] = useState<ProcessVisibility>('public');
  const [departmentName, setDepartmentName] = useState('وزارت آموزش و پرورش');
  const [targetSystem, setTargetSystem] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [tagsInput, setTagsInput] = useState('');

  // Dynamic Scopes and Categories from database
  const [scopesList, setScopesList] = useState<ProcessScopeEntity[]>([]);
  const [categoriesList, setCategoriesList] = useState<ProcessCategoryEntity[]>([]);

  // Schedule state
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState<PersianMonth>('تیر');
  const [scheduleSeason, setScheduleSeason] = useState<PersianSeason>('تابستان');
  const [scheduleStartDay, setScheduleStartDay] = useState<number>(1);
  const [scheduleEndDay, setScheduleEndDay] = useState<number>(20);
  const [scheduleDeadlineDays, setScheduleDeadlineDays] = useState<number>(20);
  const [scheduleRecurrence] = useState<'annual' | 'quarterly' | 'monthly' | 'custom'>('annual');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleIsMandatory, setScheduleIsMandatory] = useState(true);

  // Live systems and departments lists
  const [systemsList, setSystemsList] = useState<{ name: string; slug: string; category?: string; websiteUrl?: string }[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Steps state
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('/api/departments').then((r) => r.json()).catch(() => []),
        fetch('/api/systems').then((r) => r.json()).catch(() => []),
        fetch('/api/scopes').then((r) => r.json()).catch(() => []),
      ])
        .then(([depts, syss, scopes]) => {
          if (Array.isArray(depts)) setDepartmentsList(depts);
          if (Array.isArray(syss)) setSystemsList(syss);
          if (Array.isArray(scopes)) setScopesList(scopes);
        })
        .catch((err) => console.error('Error fetching initial modal data:', err));
    }
  }, [isOpen]);

  // Dynamically load categories whenever scope changes
  useEffect(() => {
    if (isOpen && scope) {
      fetch(`/api/categories?scopeKey=${encodeURIComponent(scope)}`)
        .then((r) => r.json())
        .then((cats) => {
          if (Array.isArray(cats)) setCategoriesList(cats);
        })
        .catch((err) => console.error('Error fetching categories for scope:', err));
    }
  }, [isOpen, scope]);

  useEffect(() => {
    if (processToEdit) {
      setTitle(processToEdit.title);
      setSlug(processToEdit.slug);
      setDescription(processToEdit.description);
      setScope(processToEdit.scope || 'organization');
      setCategory(processToEdit.category);
      setVisibility(processToEdit.visibility || 'public');
      setDepartmentName(processToEdit.departmentName);
      setTargetSystem(processToEdit.targetSystem);
      setTargetUrl(processToEdit.targetUrl || '');
      setEstimatedMinutes(processToEdit.estimatedMinutes);
      setTagsInput(processToEdit.tags.join('، '));
      if (processToEdit.schedule) {
        setHasSchedule(true);
        setScheduleMonth(processToEdit.schedule.month || 'تیر');
        setScheduleSeason(processToEdit.schedule.season || getSeasonForMonth(processToEdit.schedule.month || 'تیر'));
        setScheduleStartDay(processToEdit.schedule.startDay ?? 1);
        setScheduleEndDay(processToEdit.schedule.endDay ?? 20);
        setScheduleDeadlineDays(processToEdit.schedule.deadlineDays ?? 20);
        setScheduleNotes(processToEdit.schedule.notes || '');
        setScheduleIsMandatory(processToEdit.schedule.isMandatory !== false);
      } else {
        setHasSchedule(false);
        setScheduleMonth('تیر');
        setScheduleSeason('تابستان');
        setScheduleStartDay(1);
        setScheduleEndDay(20);
        setScheduleDeadlineDays(20);
        setScheduleNotes('');
        setScheduleIsMandatory(true);
      }
      setIsEditingSlug(false);
      setShowAdvanced(Boolean(
        processToEdit.visibility === 'restricted' ||
        processToEdit.schedule || 
        (processToEdit.tags && processToEdit.tags.length > 0) || 
        (processToEdit.estimatedMinutes && processToEdit.estimatedMinutes !== 10) ||
        processToEdit.targetUrl
      ));
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
      setHasSchedule(false);
      setScheduleMonth('تیر');
      setScheduleSeason('تابستان');
      setScheduleStartDay(1);
      setScheduleEndDay(20);
      setScheduleDeadlineDays(20);
      setScheduleNotes('');
      setScheduleIsMandatory(true);
      setIsEditingSlug(false);
      setShowAdvanced(false);
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
    const newId = `step-${Date.now()}-${nextIndex}`;
    const newStep: ProcessStep = {
      id: newId,
      orderIndex: nextIndex,
      stepKey: `step-${nextIndex}`,
      title: `گام ${nextIndex}: مرحله جدید`,
      contentMarkdown: 'توضیحات و دستورالعمل اجرایی این گام را اینجا بنویسید...',
      stepType: 'action',
      targetMenuPath: '',
      copyableFields: [],
      errorGuides: [],
    };
    setSteps((prev) => [...prev, newStep]);

    setTimeout(() => {
      const el = document.getElementById(`step-card-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input');
        if (input) input.focus();
      }
    }, 120);
  };

  const handleRemoveStep = (indexToRemove: number) => {
    const filtered = steps.filter((_, idx) => idx !== indexToRemove);
    const reindexed = filtered.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
    setSteps(reindexed);
  };

  const handleUpdateStep = (index: number, updatedFields: Partial<ProcessStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...updatedFields };
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
    if (!title.trim()) return notify.error('لطفاً عنوان فرایند را وارد کنید');

    const finalSlug = cleanSlugForSubmit(slug || title, 'proc');
    const tagsArray = tagsInput
      .split(/[،,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const matchedDept = departmentsList.find((d) => d.name === departmentName.trim());
    const matchedSys = systemsList.find((s) => s.name === targetSystem.trim());

    const schedulePayload: ProcessSchedule | undefined = hasSchedule
      ? {
          month: scheduleMonth,
          season: scheduleSeason,
          startDay: Number(scheduleStartDay) || 1,
          endDay: Number(scheduleEndDay) || 30,
          timeframeLabel: `از ${scheduleStartDay || 1} الی ${scheduleEndDay || 30} ${scheduleMonth}`,
          deadlineDays: Number(scheduleDeadlineDays) || undefined,
          recurrence: scheduleRecurrence,
          isMandatory: scheduleIsMandatory,
          notes: scheduleNotes.trim() || undefined,
        }
      : undefined;

    const savedProcess: Process = {
      id: processToEdit?.id || `proc-${Date.now()}`,
      slug: finalSlug,
      title: title.trim(),
      description: description.trim(),
      scope,
      category,
      visibility,
      authorId: processToEdit?.authorId || currentUser.id,
      accessGrants: processToEdit?.accessGrants || [],
      departmentName: departmentName.trim() || 'مدیریت سازمانی',
      departmentSlug: matchedDept?.slug,
      targetSystem: targetSystem.trim() || 'سامانه سازمانی',
      targetSystemSlug: matchedSys ? matchedSys.slug : targetSystem.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      targetUrl: targetUrl.trim() || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 10,
      totalSteps: steps.length,
      tags: tagsArray,
      schedule: schedulePayload,
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
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? 'ویرایش فرایند سازمانی' : 'ثبت فرایند و دستورالعمل جدید'}
              </h2>
              <span className="text-xs text-slate-500">
                مشخصات عمومی، دسته‌بندی و مراحل اجرایی فلوچارت را تکمیل نمایید.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* General Metadata Section */}
          <div className="space-y-4">
            {/* Title & Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  عنوان رسمی فرایند *
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug((prev) => !prev)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingSlug ? 'پنهان کردن ویرایش شناسه' : 'ویرایش شناسه لاتین (Slug)'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="مثلاً: ثبت پرسنل جدید، به‌روزرسانی ابلاغ و حکم، صدور فیش حقوقی..."
                className="w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span className="font-mono text-[11px]" dir="ltr">
                  /process/<span className="text-blue-600 dark:text-blue-400 font-bold">{slug || '...'}</span>
                </span>
                {isEditingSlug && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateSlug}
                    className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>تولید مجدد خودکار از عنوان</span>
                  </button>
                )}
              </div>

              {isEditingSlug && (
                <div className="mt-2 animate-in fade-in">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="شناسه یکتای لاتین یا فارسی URL..."
                    dir="auto"
                    className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}
            </div>

            {/* Target System, Department, Scope, Category */}
            <ProcessMetadataFields
              currentUser={currentUser}
              targetSystem={targetSystem}
              setTargetSystem={setTargetSystem}
              targetUrl={targetUrl}
              setTargetUrl={setTargetUrl}
              systemsList={systemsList}
              setSystemsList={setSystemsList}
              departmentName={departmentName}
              setDepartmentName={setDepartmentName}
              departmentsList={departmentsList}
              setDepartmentsList={setDepartmentsList}
              scope={scope}
              setScope={setScope}
              scopesList={scopesList}
              setScopesList={setScopesList}
              category={category}
              setCategory={setCategory}
              categoriesList={categoriesList}
              setCategoriesList={setCategoriesList}
            />

            {/* Description */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                توضیح کوتاه و هدف فرایند
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="خلاصه‌ای از اینکه این فرایند چه کاری انجام می‌دهد و خروجی آن چیست..."
                className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Advanced Settings & Administrative Timeline Section */}
            <AdvancedSettingsSection
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              visibility={visibility}
              setVisibility={setVisibility}
              hasSchedule={hasSchedule}
              setHasSchedule={setHasSchedule}
              scheduleMonth={scheduleMonth}
              setScheduleMonth={setScheduleMonth}
              scheduleSeason={scheduleSeason}
              setScheduleSeason={setScheduleSeason}
              scheduleStartDay={scheduleStartDay}
              setScheduleStartDay={setScheduleStartDay}
              scheduleEndDay={scheduleEndDay}
              setScheduleEndDay={setScheduleEndDay}
              scheduleDeadlineDays={scheduleDeadlineDays}
              setScheduleDeadlineDays={setScheduleDeadlineDays}
              scheduleIsMandatory={scheduleIsMandatory}
              setScheduleIsMandatory={setScheduleIsMandatory}
              scheduleNotes={scheduleNotes}
              setScheduleNotes={setScheduleNotes}
              targetUrl={targetUrl}
              setTargetUrl={setTargetUrl}
              estimatedMinutes={estimatedMinutes}
              setEstimatedMinutes={setEstimatedMinutes}
              tagsInput={tagsInput}
              setTagsInput={setTagsInput}
            />
          </div>

          {/* Steps Management Section */}
          <div className="pt-4 border-t relative" style={{ borderColor: 'var(--border-subtle)' }}>
            <div 
              className="sticky -top-6 z-20 backdrop-blur-md py-3 px-4 -mx-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 rounded-2xl shadow-xs"
              style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                    مراحل و گام‌های فرایند
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {steps.length} گام
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  هر مرحله به عنوان یک نود در فلوچارت رسم شده و به ترتیب هدایت می‌شود.
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن مرحله جدید</span>
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <StepEditorCard
                  key={step.id}
                  step={step}
                  stepIndex={idx}
                  totalSteps={steps.length}
                  onUpdateStep={handleUpdateStep}
                  onRemoveStep={handleRemoveStep}
                />
              ))}

              {/* Bottom Prominent Add Step Button */}
              <button
                type="button"
                onClick={handleAddStep}
                className="w-full py-4 px-6 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 text-xs sm:text-sm font-black transition-all cursor-pointer hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 group shadow-xs"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span>افزودن مرحله جدید (گام {steps.length + 1})</span>
              </button>
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
