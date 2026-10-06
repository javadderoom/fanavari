'use client';

import React, { useState, useEffect } from 'react';
import { 
  Process, 
  ProcessStep, 
  StepType, 
  WorkflowScope, 
  ErrorGuideItem, 
  CopyableField,
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
  Trash2, 
  Save, 
  Layers, 
  AlertTriangle, 
  Copy, 
  GitFork, 
  CheckCircle, 
  Clock, 
  Globe, 
  Lock,
  Laptop, 
  FileText, 
  Sparkles, 
  Building2, 
  Loader2, 
  Lightbulb, 
  Pin, 
  Link2, 
  Calendar, 
  CalendarDays, 
  CalendarClock, 
  Timer, 
  FolderTree, 
  Tag, 
  FolderPlus, 
  Image as ImageIcon,
  Settings2,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { notify } from '@/lib/notify';
import { formatToSlug, cleanSlugForSubmit } from '@/lib/slug-utils';
import { MenuPathEditor } from './menu-path-editor';
import { StepContentRenderer } from './step-content-renderer';

export const PERSIAN_MONTHS: PersianMonth[] = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export function getSeasonForMonth(month: PersianMonth): PersianSeason {
  if (['فروردین', 'اردیبهشت', 'خرداد'].includes(month)) return 'بهار';
  if (['تیر', 'مرداد', 'شهریور'].includes(month)) return 'تابستان';
  if (['مهر', 'آبان', 'آذر'].includes(month)) return 'پاییز';
  return 'زمستان';
}

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
  const { currentUser, can, isSuperAdmin } = useUserSession();

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

  // Quick creation states for scope
  const [isQuickScopeOpen, setIsQuickScopeOpen] = useState(false);
  const [quickScopeName, setQuickScopeName] = useState('');
  const [quickScopeKey, setQuickScopeKey] = useState('');
  const [quickScopeDesc, setQuickScopeDesc] = useState('');
  const [isSavingQuickScope, setIsSavingQuickScope] = useState(false);

  // Quick creation states for category
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatKey, setQuickCatKey] = useState('');
  const [quickCatScopeId, setQuickCatScopeId] = useState<string>('current');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);

  // Schedule state
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState<PersianMonth>('تیر');
  const [scheduleSeason, setScheduleSeason] = useState<PersianSeason>('تابستان');
  const [scheduleStartDay, setScheduleStartDay] = useState<number>(1);
  const [scheduleEndDay, setScheduleEndDay] = useState<number>(20);
  const [scheduleDeadlineDays, setScheduleDeadlineDays] = useState<number>(20);
  const [scheduleRecurrence, setScheduleRecurrence] = useState<'annual' | 'quarterly' | 'monthly' | 'custom'>('annual');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleIsMandatory, setScheduleIsMandatory] = useState(true);

  // Live departments and systems lists from database
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [systemsList, setSystemsList] = useState<{ id?: string; name: string; slug: string; category?: string; websiteUrl?: string }[]>([]);

  // Quick creation states for system/software
  const [isQuickSystemOpen, setIsQuickSystemOpen] = useState(false);
  const [quickSystemName, setQuickSystemName] = useState('');
  const [quickSystemCategory, setQuickSystemCategory] = useState<'portal' | 'software' | 'devtools' | 'erp'>('portal');
  const [quickSystemUrl, setQuickSystemUrl] = useState('');
  const [isSavingQuickSystem, setIsSavingQuickSystem] = useState(false);

  // Quick creation states for department
  const [isQuickDeptOpen, setIsQuickDeptOpen] = useState(false);
  const [quickDeptName, setQuickDeptName] = useState('');
  const [isSavingQuickDept, setIsSavingQuickDept] = useState(false);

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
          if (Array.isArray(cats)) {
            setCategoriesList(cats);
          }
        })
        .catch((err) => console.error('Error fetching categories for scope:', err));
    }
  }, [isOpen, scope]);

  // Steps state
  const [steps, setSteps] = useState<ProcessStep[]>([]);

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
        setScheduleRecurrence(processToEdit.schedule.recurrence || 'annual');
        setScheduleNotes(processToEdit.schedule.notes || '');
        setScheduleIsMandatory(processToEdit.schedule.isMandatory !== false);
      } else {
        setHasSchedule(false);
        setScheduleMonth('تیر');
        setScheduleSeason('تابستان');
        setScheduleStartDay(1);
        setScheduleEndDay(20);
        setScheduleDeadlineDays(20);
        setScheduleRecurrence('annual');
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
      setScheduleRecurrence('annual');
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

  // Quick save handlers
  const handleQuickSaveSystem = async () => {
    if (!quickSystemName.trim()) {
      notify.error('نام نرم‌افزار یا سامانه الزامی است.');
      return;
    }

    setIsSavingQuickSystem(true);
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickSystemName.trim(),
          category: quickSystemCategory,
          websiteUrl: quickSystemUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت سامانه');
      }

      setSystemsList((prev) => [data, ...prev]);
      setTargetSystem(data.name);
      if (data.websiteUrl) setTargetUrl(data.websiteUrl);
      setIsQuickSystemOpen(false);
      setQuickSystemName('');
      setQuickSystemUrl('');
      notify.success(`سامانه «${data.name}» با موفقیت ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت سامانه');
    } finally {
      setIsSavingQuickSystem(false);
    }
  };

  const handleQuickSaveDept = async () => {
    if (!quickDeptName.trim()) {
      notify.error('نام سازمان الزامی است.');
      return;
    }

    setIsSavingQuickDept(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickDeptName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت سازمان');
      }

      setDepartmentsList((prev) => [data, ...prev]);
      setDepartmentName(data.name);
      setIsQuickDeptOpen(false);
      setQuickDeptName('');
      notify.success(`سازمان «${data.name}» با موفقیت ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت سازمان');
    } finally {
      setIsSavingQuickDept(false);
    }
  };

  const handleQuickSaveScope = async () => {
    if (!quickScopeName.trim()) {
      notify.error('نام حوزه الزامی است.');
      return;
    }
    setIsSavingQuickScope(true);
    try {
      const res = await fetch('/api/scopes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickScopeName.trim(),
          key: quickScopeKey.trim() || undefined,
          description: quickScopeDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت حوزه');
      setScopesList((prev) => [...prev, data]);
      setScope(data.key);
      setIsQuickScopeOpen(false);
      setQuickScopeName('');
      setQuickScopeKey('');
      setQuickScopeDesc('');
      notify.success(`حوزه «${data.name}» ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت حوزه');
    } finally {
      setIsSavingQuickScope(false);
    }
  };

  const handleQuickSaveCategory = async () => {
    if (!quickCatName.trim()) {
      notify.error('نام دسته‌بندی موضوعی الزامی است.');
      return;
    }
    setIsSavingQuickCat(true);
    try {
      let targetScopeId: string | null = null;
      if (quickCatScopeId === 'current') {
        const found = scopesList.find((s) => s.key === scope);
        targetScopeId = found?.id || null;
      } else if (quickCatScopeId !== 'all' && quickCatScopeId !== 'global') {
        targetScopeId = quickCatScopeId;
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickCatName.trim(),
          key: quickCatKey.trim() || undefined,
          scopeId: targetScopeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت دسته‌بندی');
      setCategoriesList((prev) => [...prev, data]);
      setCategory(data.key);
      setIsQuickCatOpen(false);
      setQuickCatName('');
      setQuickCatKey('');
      notify.success(`دسته‌بندی موضوعی «${data.name}» ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت دسته‌بندی');
    } finally {
      setIsSavingQuickCat(false);
    }
  };

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

    // Automatically smooth-scroll to newly added step and focus its title
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

          {/* Core Fields Section (Streamlined 4 Essential Fields) */}
          <div className="space-y-4">
            {/* Field 1: Title with Subtle Auto-Slug Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  عنوان کامل فرایند <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(!isEditingSlug)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
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

              {/* Quiet URL Preview */}
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

              {/* Optional Manual Slug Override Input */}
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

            {/* Field 2 & 3: Target System & Department (Paired in 1 Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target System */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <Laptop className="w-3.5 h-3.5 text-purple-600" />
                    <span>سامانه یا نرم‌افزار هدف</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickSystemOpen((prev) => !prev)}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                  >
                    {isQuickSystemOpen ? 'بستن' : '+ سامانه جدید'}
                  </button>
                </div>

                {isQuickSystemOpen && (
                  <div className="mb-2 p-3 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={quickSystemName}
                      onChange={(e) => setQuickSystemName(e.target.value)}
                      placeholder="نام سامانه (مثلاً: سیدا)..."
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQuickSystemOpen(false)}
                        className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        disabled={isSavingQuickSystem || !quickSystemName.trim()}
                        onClick={handleQuickSaveSystem}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-purple-600 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isSavingQuickSystem ? 'ذخیره...' : 'ثبت فوری'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={systemsList.some((s) => s.name === targetSystem) ? targetSystem : (targetSystem ? 'custom' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__NEW__') {
                      setIsQuickSystemOpen(true);
                    } else if (val === 'custom') {
                      setTargetSystem('');
                    } else {
                      setTargetSystem(val);
                      const found = systemsList.find((s) => s.name === val);
                      if (found?.websiteUrl) {
                        setTargetUrl(found.websiteUrl);
                      }
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- انتخاب نرم‌افزار یا سامانه --</option>
                  {systemsList.map((s) => (
                    <option key={s.slug} value={s.name}>
                      {s.name} ({s.category === 'software' ? 'نرم‌افزار' : s.category === 'devtools' ? 'ابزار' : s.category === 'erp' ? 'ERP سازمانی' : 'سامانه وب'})
                    </option>
                  ))}
                  <option value="__NEW__">+ تعریف سامانه جدید در دیتابیس...</option>
                  <option value="custom">سایر / ورود دستی...</option>
                </select>

                {(!systemsList.some((s) => s.name === targetSystem) || targetSystem === '') && (
                  <input
                    type="text"
                    value={targetSystem}
                    onChange={(e) => setTargetSystem(e.target.value)}
                    placeholder="نام سامانه را بنویسید..."
                    className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>

              {/* Department */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>سازمان یا دپارتمان متولی</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickDeptOpen((prev) => !prev)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    {isQuickDeptOpen ? 'بستن' : '+ سازمان جدید'}
                  </button>
                </div>

                {isQuickDeptOpen && (
                  <div className="mb-2 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={quickDeptName}
                      onChange={(e) => setQuickDeptName(e.target.value)}
                      placeholder="نام سازمان (مثلاً: وزارت جهاد کشاورزی)..."
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQuickDeptOpen(false)}
                        className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        disabled={isSavingQuickDept || !quickDeptName.trim()}
                        onClick={handleQuickSaveDept}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isSavingQuickDept ? 'ذخیره...' : 'ثبت فوری'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={departmentsList.some((d) => d.name === departmentName) ? departmentName : (departmentName ? 'custom' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__NEW__') {
                      setIsQuickDeptOpen(true);
                    } else if (val === 'custom') {
                      setDepartmentName('');
                    } else {
                      setDepartmentName(val);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- انتخاب سازمان متولی --</option>
                  {departmentsList.map((d) => (
                    <option key={d.slug} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  <option value="__NEW__">+ تعریف سازمان جدید در دیتابیس...</option>
                  <option value="custom">سایر / ورود دستی...</option>
                </select>

                {(!departmentsList.some((d) => d.name === departmentName) || departmentName === '') && (
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="نام دقیق سازمان را بنویسید..."
                    className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>
            </div>

            {/* Field 4 & 5: Scope & Category (Paired in 1 Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scope */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                    <span>حوزه فرایند</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickScopeOpen((prev) => !prev)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {isQuickScopeOpen ? 'بستن' : '+ حوزه جدید'}
                  </button>
                </div>

                {isQuickScopeOpen && (
                  <div className="mb-2 p-3 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={quickScopeName}
                      onChange={(e) => setQuickScopeName(e.target.value)}
                      placeholder="عنوان حوزه (مثلاً: اداری و مالی)..."
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQuickScopeOpen(false)}
                        className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        disabled={isSavingQuickScope || !quickScopeName.trim()}
                        onClick={handleQuickSaveScope}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-blue-600 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isSavingQuickScope ? 'ذخیره...' : 'ثبت فوری'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={scopesList.some((s) => s.key === scope) ? scope : (scope ? 'custom' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__NEW__') {
                      setIsQuickScopeOpen(true);
                    } else if (val === 'custom') {
                      setScope('');
                    } else {
                      setScope(val);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- انتخاب حوزه --</option>
                  {scopesList.map((s) => (
                    <option key={s.id} value={s.key}>
                      {s.name}
                    </option>
                  ))}
                  <option value="__NEW__">+ تعریف حوزه جدید در دیتابیس...</option>
                  <option value="custom">سایر / ورود دستی...</option>
                </select>

                {(!scopesList.some((s) => s.key === scope) || scope === '') && (
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="شناسه حوزه را بنویسید..."
                    className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>دسته‌بندی موضوعی</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCatOpen((prev) => !prev)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    {isQuickCatOpen ? 'بستن' : '+ دسته‌بندی جدید'}
                  </button>
                </div>

                {isQuickCatOpen && (
                  <div className="mb-2 p-3 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2 animate-in fade-in">
                    <input
                      type="text"
                      value={quickCatName}
                      onChange={(e) => setQuickCatName(e.target.value)}
                      placeholder="عنوان دسته‌بندی (مثلاً: بازنشستگی)..."
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQuickCatOpen(false)}
                        className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        disabled={isSavingQuickCat || !quickCatName.trim()}
                        onClick={handleQuickSaveCategory}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isSavingQuickCat ? 'ذخیره...' : 'ثبت فوری'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={categoriesList.some((c) => c.key === category) ? category : (category ? 'custom' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__NEW__') {
                      setIsQuickCatOpen(true);
                    } else if (val === 'custom') {
                      setCategory('');
                    } else {
                      setCategory(val);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- انتخاب دسته‌بندی موضوعی --</option>
                  {categoriesList.filter((c) => !c.isGlobal).length > 0 && (
                    <optgroup label="دسته‌بندی‌های اختصاصی این حوزه">
                      {categoriesList.filter((c) => !c.isGlobal).map((c) => (
                        <option key={c.id} value={c.key}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {categoriesList.filter((c) => c.isGlobal).length > 0 && (
                    <optgroup label="دسته‌بندی‌های عمومی و مشترک">
                      {categoriesList.filter((c) => c.isGlobal).map((c) => (
                        <option key={c.id} value={c.key}>{c.name} (عمومی)</option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__NEW__">+ تعریف دسته‌بندی جدید در دیتابیس...</option>
                  <option value="custom">سایر / ورود دستی...</option>
                </select>

                {(!categoriesList.some((c) => c.key === category) || category === '') && (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="شناسه یا عنوان دسته‌بندی را بنویسید..."
                    className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>
            </div>

            {/* Field 4: Short Description */}
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

            {/* Progressive Disclosure: Collapsible Advanced Settings & Timeline Section */}
            <div 
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                borderColor: showAdvanced ? 'var(--border-glass)' : 'var(--border-subtle)',
                background: 'var(--bg-input)'
              }}
            >
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-500/5 transition-colors select-none"
                style={{ color: 'var(--text-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-slate-500" />
                  <span>تنظیمات تکمیلی، زمان‌بندی و گاه‌شمار سالانه (اختیاری)</span>
                  {hasSchedule && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      دارای زمان‌بندی ({scheduleMonth})
                    </span>
                  )}
                  {tagsInput.trim() && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      تگ‌ها
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span>{showAdvanced ? 'بستن' : 'نمایش'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showAdvanced && (
                <div className="p-4 border-t space-y-4 animate-in fade-in" style={{ borderColor: 'var(--border-subtle)' }}>
                  {/* Visibility & Confidentiality Setting */}
                  <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                    <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      سطح محرمانگی و دسترسی (Visibility)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                          visibility === 'public'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500/30'
                            : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                        }`}
                      >
                        <Globe className="w-4 h-4 shrink-0 text-blue-500" />
                        <div>
                          <div className="text-xs">عمومی (Public)</div>
                          <div className="text-[10px] font-normal opacity-80">در دسترس تمام پرسنل سازمان و قابل جستجو</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('restricted')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                          visibility === 'restricted'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30'
                            : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                        }`}
                      >
                        <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                        <div>
                          <div className="text-xs">محدود و محرمانه (Restricted)</div>
                          <div className="text-[10px] font-normal opacity-80">فقط شما، مدیران ارشد و افراد دارای دسترسی</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Administrative Timeline Section */}
                  <div 
                    className="rounded-xl p-3.5 border transition-all"
                    style={{
                      background: hasSchedule ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-surface)',
                      borderColor: hasSchedule ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarClock className={`w-4 h-4 ${hasSchedule ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                            گاه‌شمار اجرایی سالانه (Administrative Timeline)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            تعیین بازه و مهلت اقدام در تقویم اداری ۱۲ ماهه
                          </span>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasSchedule}
                          onChange={(e) => setHasSchedule(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {hasSchedule ? 'دارای زمان‌بندی' : 'بدون زمان‌بندی'}
                        </span>
                      </label>
                    </div>

                    {hasSchedule && (
                      <div className="mt-3 pt-3 border-t border-blue-200/40 dark:border-blue-900/40 space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Month Picker */}
                          <div>
                            <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                              ماه اجرایی (فصل خودکار تعیین می‌شود)
                            </label>
                            <select
                              value={scheduleMonth}
                              onChange={(e) => {
                                const m = e.target.value as PersianMonth;
                                setScheduleMonth(m);
                                setScheduleSeason(getSeasonForMonth(m));
                              }}
                              className="w-full p-2 rounded-lg border text-xs font-medium outline-none cursor-pointer"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                            >
                              {PERSIAN_MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m} (فصل {getSeasonForMonth(m)})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Start Day */}
                          <div>
                            <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                              روز شروع بازه (از ۱ تا ۳۱)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={scheduleStartDay}
                              onChange={(e) => {
                                const val = Math.min(31, Math.max(1, Number(e.target.value)));
                                setScheduleStartDay(val);
                                setScheduleDeadlineDays(Math.max(1, scheduleEndDay - val + 1));
                              }}
                              className="w-full p-2 rounded-lg border text-xs font-mono outline-none"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                            />
                          </div>

                          {/* End Day */}
                          <div>
                            <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                              روز پایان بازه (مهلت اقدام)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={scheduleEndDay}
                              onChange={(e) => {
                                const val = Math.min(31, Math.max(1, Number(e.target.value)));
                                setScheduleEndDay(val);
                                setScheduleDeadlineDays(Math.max(1, val - scheduleStartDay + 1));
                              }}
                              className="w-full p-2 rounded-lg border text-xs font-mono outline-none"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Notes */}
                          <div>
                            <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                              یادداشت گاه‌شمار
                            </label>
                            <input
                              type="text"
                              value={scheduleNotes}
                              onChange={(e) => setScheduleNotes(e.target.value)}
                              placeholder="مثلاً: طبق بخشنامه شماره ۱۴..."
                              className="w-full p-2 rounded-lg border text-xs outline-none"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                            />
                          </div>

                          {/* Mandatory Toggle */}
                          <div className="flex items-center pt-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={scheduleIsMandatory}
                                onChange={(e) => setScheduleIsMandatory(e.target.checked)}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                مهلت قطعی و الزامی (مشمول جریمه یا مسدودی)
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            بازه ثبت در تقویم: <strong>{`از ${scheduleStartDay} الی ${scheduleEndDay} ${scheduleMonth} ماه`}</strong>
                            {' • '}
                            <span>مهلت اقدام: <strong>{scheduleDeadlineDays} روز</strong></span>
                            {scheduleIsMandatory && <span className="text-rose-500 font-bold mr-1">• مهلت قطعی</span>}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Override & Estimated Minutes in 1 Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        <span>نشانی اینترنتی اختصاصی (اختیاری)</span>
                      </label>
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://... (پیش‌فرض از سامانه خوانده می‌شود)"
                        dir="ltr"
                        className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>مدت زمان تقریبی اجرا (دقیقه)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="480"
                        value={estimatedMinutes}
                        onChange={(e) => setEstimatedMinutes(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      برچسب‌ها و کلمات کلیدی (با ویرگول جدا کنید)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="مثلاً: آموزش، فرهنگیان، استعلام حکم..."
                      className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps Management Section */}
          <div className="pt-4 border-t relative" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="sticky -top-6 z-20 backdrop-blur-md py-3 px-4 -mx-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 rounded-2xl shadow-xs"
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
                <div
                  key={step.id}
                  id={`step-card-${step.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    step.stepType === 'decision'
                      ? 'border-amber-400/60 dark:border-amber-600/60 bg-amber-500/5'
                      : step.stepType === 'end'
                      ? 'border-emerald-500/60 dark:border-emerald-600/60 ring-1 ring-emerald-500/20 bg-emerald-500/5'
                      : step.stepType === 'warning'
                      ? 'border-rose-400/60 dark:border-rose-600/60 bg-rose-500/5'
                      : ''
                  }`}
                  style={{
                    background: step.stepType === 'action' ? 'var(--bg-surface)' : undefined,
                    borderColor: step.stepType === 'action' ? 'var(--border-glass)' : undefined
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        step.stepType === 'decision'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : step.stepType === 'end'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : step.stepType === 'warning'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
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
                        className={`text-xs p-1.5 rounded-lg border font-bold outline-none cursor-pointer ${
                          step.stepType === 'decision'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                            : step.stepType === 'end'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                            : step.stepType === 'warning'
                            ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                            : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200'
                        }`}
                      >
                        <option value="action">□ اقدام (Action)</option>
                        <option value="decision">◇ تصمیم‌گیری (Decision)</option>
                        <option value="warning">⚠ هشدار/ایست (Warning)</option>
                        <option value="end">◎ پایان/خروجی (End)</option>
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

                  {/* Interactive Menu Path Editor (Tags / Boxes) */}
                  <div className="mb-3">
                    <MenuPathEditor
                      value={step.targetMenuPath || ''}
                      onChange={(newPath) => handleUpdateStep(idx, { targetMenuPath: newPath })}
                    />
                  </div>

                  {/* Step Description & Callout Helpers */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        دستورالعمل اجرایی و شرح تفصیلی گام
                      </label>
                      {/* Formatting & Callout Quick Toolbar */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = step.contentMarkdown || '';
                            const toAppend = cur ? `\n💡 نکته: ` : `💡 نکته: `;
                            handleUpdateStep(idx, { contentMarkdown: cur + toAppend });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
                          title="افزودن کادر نکته کاربردی"
                        >
                          <Lightbulb className="w-2.5 h-2.5" />
                          <span>+ نکته</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = step.contentMarkdown || '';
                            const toAppend = cur ? `\n⚠️ هشدار: ` : `⚠️ هشدار: `;
                            handleUpdateStep(idx, { contentMarkdown: cur + toAppend });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors border border-rose-500/20 cursor-pointer"
                          title="افزودن کادر هشدار مهم"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>+ هشدار</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = step.contentMarkdown || '';
                            const toAppend = cur ? `\n📌 توجه: ` : `📌 توجه: `;
                            handleUpdateStep(idx, { contentMarkdown: cur + toAppend });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-colors border border-indigo-500/20 cursor-pointer"
                          title="افزودن کادر توجه و الزام"
                        >
                          <Pin className="w-2.5 h-2.5" />
                          <span>+ توجه</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = step.contentMarkdown || '';
                            const toAppend = ` [عنوان فرایند](/process/نام-فرایند) `;
                            handleUpdateStep(idx, { contentMarkdown: cur + toAppend });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 transition-colors border border-blue-500/20 cursor-pointer"
                          title="افزودن لینک داخلی به فرایند دیگر"
                        >
                          <Link2 className="w-2.5 h-2.5" />
                          <span>+ لینک فرایند</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={step.contentMarkdown}
                      onChange={(e) => handleUpdateStep(idx, { contentMarkdown: e.target.value })}
                      placeholder="دستورالعمل اجرایی، پیش‌نیازها و نکات کلیدی این مرحله را بنویسید (پشتیبانی از لینک‌های داخلی و کادرهای 💡 نکته و ⚠️ هشدار)..."
                      className="w-full p-2.5 text-xs rounded-xl border outline-none leading-relaxed transition-all focus:ring-2 focus:ring-blue-500"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    {/* Live Preview if contains callouts or markdown links */}
                    {step.contentMarkdown && (step.contentMarkdown.includes('💡') || step.contentMarkdown.includes('⚠️') || step.contentMarkdown.includes('📌') || step.contentMarkdown.includes('[')) && (
                      <div className="mt-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">پیش‌نمایش زنده قالب‌بندی و کادرها:</span>
                        <StepContentRenderer content={step.contentMarkdown} className="text-xs" />
                      </div>
                    )}
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
