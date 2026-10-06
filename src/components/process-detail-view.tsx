'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessStep } from '@/types/process';
import Link from 'next/link';
import { MenuPathDisplay } from './menu-path-display';
import { StepContentRenderer, hasValidStepContent } from './step-content-renderer';
import { ImageHotspotViewer } from './image-hotspot-viewer';
import { ScratchpadDrawer } from './scratchpad-drawer';
import { ProcessAccessModal } from './process-access-modal';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission } from '@/lib/permissions';
import { notify } from '@/lib/notify';
import { 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lightbulb, 
  Layers, 
  GitFork, 
  CheckCircle,
  CheckCircle2, 
  ShieldAlert, 
  StickyNote, 
  Save, 
  ArrowRight, 
  ArrowLeft,
  Share2,
  Bookmark,
  Printer,
  Laptop,
  Building2,
  Workflow,
  Sparkles,
  RotateCcw,
  CheckSquare,
  Square,
  Trophy,
  Play,
  Lock,
  Globe
} from 'lucide-react';

interface ProcessDetailViewProps {
  process: Process;
}

export function ProcessDetailView({ process }: ProcessDetailViewProps) {
  const { currentUser } = useUserSession();
  const [currentProcess, setCurrentProcess] = useState<Process>(process);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'flow' | 'errors' | 'scratchpad'>('flow');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scratchpad state with localStorage
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isScratchpadDrawerOpen, setIsScratchpadDrawerOpen] = useState(false);

  // Live Step Completion & Runner State
  const [completedStepKeys, setCompletedStepKeys] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedNote = localStorage.getItem(`fanavari-scratchpad-${process.id}`);
      if (savedNote) setScratchpadNote(savedNote);

      const savedProgress = localStorage.getItem(`fanavari-completed-${process.id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompletedStepKeys(parsed);
          if (parsed.length === process.steps.length) {
            setShowCelebration(true);
          }
        }
      }
    } catch (e) {
      console.error('Error loading process session:', e);
    }
  }, [process.id, process.steps.length]);

  const currentStep: ProcessStep | undefined = process.steps[activeStepIndex];

  // Progress metrics
  const completedCount = completedStepKeys.length;
  const totalCount = process.steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;
  const isCurrentStepCompleted = currentStep ? completedStepKeys.includes(currentStep.stepKey) : false;

  const toggleStepCompleted = (stepKey: string) => {
    setCompletedStepKeys((prev) => {
      let next: string[];
      const isNowDone = !prev.includes(stepKey);
      if (isNowDone) {
        next = [...prev, stepKey];
        notify.success('گام به عنوان انجام‌شده علامت‌گذاری شد ✓');
        if (next.length === process.steps.length) {
          setShowCelebration(true);
        }
      } else {
        next = prev.filter((k) => k !== stepKey);
        setShowCelebration(false);
      }
      try {
        localStorage.setItem(`fanavari-completed-${process.id}`, JSON.stringify(next));
      } catch (e) {
        console.error('Error saving progress:', e);
      }
      return next;
    });
  };

  const handleCompleteAndNext = (stepKey: string) => {
    if (!completedStepKeys.includes(stepKey)) {
      toggleStepCompleted(stepKey);
    }
    if (activeStepIndex < process.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handleResetProgress = async () => {
    const ok = await notify.confirm({
      title: 'تنظیم مجدد پیشرفت فرایند',
      message: 'آیا مایلید تمام تیک‌های مراحل انجام‌شده پاک شده و از گام اول شروع کنید؟',
      confirmText: 'بله، بازنشانی شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });
    if (ok) {
      setCompletedStepKeys([]);
      try {
        localStorage.removeItem(`fanavari-completed-${process.id}`);
      } catch (e) {}
      setActiveStepIndex(0);
      setShowCelebration(false);
      notify.success('پیشرفت فرایند با موفقیت بازنشانی شد.');
    }
  };

  const handleMarkAllCompleted = () => {
    const allKeys = process.steps.map((s) => s.stepKey);
    setCompletedStepKeys(allKeys);
    try {
      localStorage.setItem(`fanavari-completed-${process.id}`, JSON.stringify(allKeys));
    } catch (e) {}
    setShowCelebration(true);
    notify.success('تمامی مراحل انجام‌شده علامت‌گذاری شدند.');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    notify.success(`مقدار «${label}» کپی شد.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    notify.success('لینک مستقیم فرایند در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveScratchpad = () => {
    localStorage.setItem(`fanavari-scratchpad-${process.id}`, scratchpadNote);
    setIsSavedNotice(true);
    notify.success('یادداشت‌ها در مرورگر ذخیره شدند.');
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const allErrors = process.steps.flatMap(step => 
    (step.errorGuides || []).map(err => ({ ...err, stepTitle: step.title, stepIndex: step.orderIndex }))
  );

  const isSuperAdmin = hasPermission(currentUser.permissions, Permissions.ADMINISTRATOR);
  const isAuthor = Boolean(currentProcess.authorId && currentProcess.authorId === currentUser.id);
  const hasGrant = Boolean((currentProcess.accessGrants || []).some((g) => g.userId === currentUser.id));
  const isRestricted = currentProcess.visibility === 'restricted';
  const hasAccess = !isRestricted || isSuperAdmin || isAuthor || hasGrant;

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl border text-center space-y-6 glass-panel-strong shadow-2xl" dir="rtl"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block">
            محتوای اختصاصی و محرمانه
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            دسترسی به این فرایند محدود است
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            این دستورالعمل به صورت اختصاصی تنظیم گردیده و شما در حال حاضر مجوز مشاهده آن را ندارید. جهت دریافت دسترسی، می‌توانید با سازنده فرایند یا مدیر ارشد سامانه ارتباط برقرار فرمایید.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
          >
            بازگشت به فهرست فرایندها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center flex-wrap gap-2">
              {process.scope === 'software' ? (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>دستورالعمل نرم‌افزار</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>فرایند سازمانی و اداری</span>
                </span>
              )}

              <span className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"
                style={currentProcess.visibility === 'restricted'
                  ? { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
                  : { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }
                }
              >
                {currentProcess.visibility === 'restricted' ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>محدود و محرمانه</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>عمومی</span>
                  </>
                )}
              </span>

              <span className="text-xs px-2.5 py-1 rounded-xl font-bold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
              >
                {process.departmentName}
              </span>

              <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3.5 h-3.5" />
                زمان تخمینی: {process.estimatedMinutes} دقیقه
              </span>

              <span className="text-xs px-2.5 py-1 rounded-xl font-medium"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
              >
                سامانه: {process.targetSystem}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              {process.title}
            </h1>

            <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {process.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setIsAccessModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              title="مدیریت دسترسی‌ها و اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>اشتراک‌گذاری و دسترسی</span>
            </button>

            <Link
              href={`/process/${process.slug}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              title="مشاهده نسخه چاپی رسمی، خوانا و بدون منو (A4 / PDF)"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>نسخه چاپی / PDF</span>
            </Link>

            {process.targetUrl && (
              <a
                href={process.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
              >
                <span>ورود به سامانه</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="flex items-center gap-3 border-b pb-4 text-sm font-bold overflow-x-auto"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('flow')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'flow' ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'flow' ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: activeTab === 'flow' ? '#ffffff' : 'var(--text-secondary)',
            border: '1px solid var(--border-glass)'
          }}
        >
          <Workflow className="w-4 h-4" />
          <span>نقشه فلوچارت ({process.totalSteps})</span>
        </button>


        <button
          type="button"
          onClick={() => setActiveTab('errors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'errors' ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'errors' ? 'var(--badge-rose-text)' : 'var(--bg-surface)',
            color: activeTab === 'errors' ? '#ffffff' : 'var(--text-secondary)',
            border: '1px solid var(--border-glass)'
          }}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>ماتریس رفع خطا ({allErrors.length} راهنما)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scratchpad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'scratchpad' ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'scratchpad' ? 'var(--badge-amber-text)' : 'var(--bg-surface)',
            color: activeTab === 'scratchpad' ? '#ffffff' : 'var(--text-secondary)',
            border: '1px solid var(--border-glass)'
          }}
        >
          <StickyNote className="w-4 h-4" />
          <span>جعبه‌ابزار و یادداشت موقت</span>
        </button>
      </div>

      {/* Tab 1: Flowchart & Step Walkthrough (Interactive Process Runner Mode) */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Live Progress Bar & Execution Controller */}
          <div 
            className="p-4 sm:p-5 rounded-3xl border shadow-md transition-all"
            style={{ 
              background: isAllCompleted 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), var(--bg-glass-card))' 
                : 'var(--bg-glass-card)', 
              borderColor: isAllCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)' 
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-transform shadow-sm ${
                    isAllCompleted 
                      ? 'bg-emerald-500 text-white scale-105' 
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isAllCompleted ? <CheckCircle className="w-5 h-5" /> : <Play className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      حالت اجرای زنده فرایند (Process Runner)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAllCompleted 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : completedCount > 0 
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {isAllCompleted ? 'تکمیل شد ✓' : completedCount > 0 ? 'در حال اجرا' : 'آماده شروع'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {completedCount} از {totalCount} مرحله انجام شده است ({progressPercent}٪ پیشرفت)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                    title="پاک کردن تیک‌های انجام شده و شروع از گام اول"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تنظیم مجدد</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleMarkAllCompleted}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                  title="علامت‌گذاری تمامی مراحل به عنوان انجام‌شده"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>تکمیل همه</span>
                </button>
              </div>
            </div>

            {/* Dynamic Progress Bar Track */}
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Flow Stepper Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                مسیر دیاگرام و چک‌لیست مراحل فرایند:
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                جهت پرش به هر مرحله، روی کارت آن کلیک کنید
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {process.steps.map((step, idx) => {
                const isSelected = idx === activeStepIndex;
                const isStepCompleted = completedStepKeys.includes(step.stepKey);
                const isDecision = step.stepType === 'decision';
                const isEnd = step.stepType === 'end';
                const isWarning = step.stepType === 'warning';

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? isDecision
                          ? 'shadow-lg scale-[1.02] ring-2 ring-amber-500 border-amber-400'
                          : isEnd
                          ? 'shadow-lg scale-[1.02] ring-2 ring-emerald-500 border-emerald-500'
                          : isWarning
                          ? 'shadow-lg scale-[1.02] ring-2 ring-rose-500 border-rose-400'
                          : 'shadow-lg scale-[1.02] ring-2 ring-blue-500 border-blue-400'
                        : isStepCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
                        : isDecision
                        ? 'border-amber-400/60 dark:border-amber-600/60 bg-amber-500/5 hover:border-amber-400'
                        : isEnd
                        ? 'border-emerald-400/60 dark:border-emerald-600/60 ring-1 ring-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400'
                        : isWarning
                        ? 'border-rose-400/60 dark:border-rose-600/60 bg-rose-500/5 hover:border-rose-400'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      background: isSelected ? 'var(--bg-surface)' : undefined,
                      borderColor: !isSelected && !isStepCompleted && !isDecision && !isEnd && !isWarning ? 'var(--border-glass)' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isStepCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isDecision
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                            : isEnd
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                            : isWarning
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          گام {step.orderIndex}
                        </span>

                        {isStepCompleted && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>انجام شد</span>
                          </span>
                        )}
                      </div>

                      {isDecision ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]" title="نود تصمیم‌گیری">
                          <GitFork className="w-4 h-4" />
                          <span>تصمیم</span>
                        </div>
                      ) : isEnd ? (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]" title="پایان موفق">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>خاتمه</span>
                        </div>
                      ) : isWarning ? (
                        <div className="flex items-center gap-1 text-rose-500 font-bold text-[10px]" title="ایست بازرسی حساس">
                          <AlertTriangle className="w-4 h-4" />
                          <span>کنترل</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-500 font-bold text-[10px]" title="نود اقدام">
                          <Layers className="w-4 h-4" />
                          <span>اقدام</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </p>
                    {isDecision && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                        انشعاب شرطی (بله / خیر)
                      </span>
                    )}
                    {isEnd && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                        تکمیل و خروجی نهایی
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">
                        ایست بازرسی الزامی
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Process Completion Celebration Card */}
          {showCelebration && (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 backdrop-blur-xl animate-in zoom-in-95 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black">
                  تمامی مراحل فرایند با موفقیت انجام شد!
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1 max-w-md mx-auto">
                  تبریک! تمام {process.steps.length} گام اجرایی این فرایند با موفقیت سپری شد.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <Link
                  href={`/process/${process.slug}/print`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-400 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ تاییدیه و خروجی PDF</span>
                </Link>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>شروع دوباره فرایند</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Step Dedicated Card */}
          {currentStep && (
            <div className={`glass-card rounded-3xl p-6 sm:p-8 border shadow-lg transition-all ${
              currentStep.stepType === 'decision'
                ? 'border-amber-400/50 dark:border-amber-500/50'
                : currentStep.stepType === 'end'
                ? 'border-emerald-500/50 dark:border-emerald-600/50 ring-1 ring-emerald-500/20'
                : currentStep.stepType === 'warning'
                ? 'border-rose-400/50 dark:border-rose-500/50'
                : ''
            }`}
              style={{ borderColor: currentStep.stepType === 'action' ? 'var(--border-glass)' : undefined }}
            >
              {/* Step Subheader with Type Badge and Completion Toggle */}
              <div className="pb-4 mb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold text-blue-600">
                      مرحله {currentStep.orderIndex} از {process.totalSteps}
                    </span>
                    {currentStep.stepType === 'decision' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>نود تصمیم‌گیری و انشعاب منطقی</span>
                      </span>
                    )}
                    {currentStep.stepType === 'end' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>نود پایان رسمی و دریافت خروجی</span>
                      </span>
                    )}
                    {currentStep.stepType === 'warning' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ایست بازرسی و دقت حساس سازمانی</span>
                      </span>
                    )}
                    {currentStep.stepType === 'action' && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>گام اجرایی و عملیاتی</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                    {currentStep.title}
                  </h2>
                </div>

                {/* Direct Step Completion Checkbox Button */}
                <button
                  type="button"
                  onClick={() => toggleStepCompleted(currentStep.stepKey)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer self-start sm:self-center shrink-0 shadow-xs ${
                    isCurrentStepCompleted
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400/30'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                  title={isCurrentStepCompleted ? 'کلیک برای حذف تیک انجام' : 'کلیک برای علامت‌گذاری انجام مرحله'}
                >
                  {isCurrentStepCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isCurrentStepCompleted ? 'این مرحله انجام شد ✓' : 'علامت‌گذاری انجام این گام'}</span>
                </button>
              </div>

              {/* Prominent Menu Path Sequence Breadcrumbs */}
              {currentStep.targetMenuPath && (
                <div className="mb-6">
                  <MenuPathDisplay path={currentStep.targetMenuPath} variant="interactive" />
                </div>
              )}

              {/* Interactive Image Hotspots Viewer */}
              {currentStep.imageUrl && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      راهنمای تصویری سامانه و نقاط تعاملی (Hotspots):
                    </h4>
                  </div>
                  <ImageHotspotViewer
                    imageUrl={currentStep.imageUrl}
                    hotspots={currentStep.hotspots || []}
                    alt={`تصویر راهنمای مرحله ${currentStep.orderIndex}: ${currentStep.title}`}
                  />
                </div>
              )}

              {/* Step Markdown / Instructions & Interactive Callouts - Omit if empty */}
              {(hasValidStepContent(currentStep.contentMarkdown) || (currentStep.tips && currentStep.tips.some(t => t && t.trim().length > 0))) && (
                <div className="mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <StepContentRenderer 
                    content={currentStep.contentMarkdown} 
                    tips={currentStep.tips}
                  />
                </div>
              )}

              {/* Copyable Fields */}
              {currentStep.copyableFields && currentStep.copyableFields.length > 0 && (
                <div className="mb-6 p-5 rounded-2xl"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                >
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>فیلدها و کدهای نمونه این گام (کپی مستقیم با یک کلیک):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.copyableFields.map((field, fIdx) => {
                      const isCopied = copiedField === field.label;
                      return (
                        <div
                          key={fIdx}
                          onClick={() => handleCopy(field.value, field.label)}
                          className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-blue-500"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                          title="کلیک برای کپی در کلیپ‌بورد"
                        >
                          <div className="overflow-hidden">
                            <span className="block text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                              {field.label}
                            </span>
                            <code className="text-xs font-mono font-bold truncate block mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                              {field.value}
                            </code>
                          </div>
                          <button type="button" className="p-1 rounded-md" style={{ color: isCopied ? '#059669' : 'var(--text-muted)' }}>
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tips Box */}
              {currentStep.tips && currentStep.tips.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: 'var(--badge-amber-bg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-medium space-y-1" style={{ color: 'var(--badge-amber-text)' }}>
                    {currentStep.tips.map((tip, tIdx) => (
                      <p key={tIdx}>• {tip}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Specific Error Guide */}
              {currentStep.errorGuides && currentStep.errorGuides.length > 0 && (
                <div className="p-5 rounded-2xl border mb-6"
                  style={{ background: 'var(--badge-rose-bg)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--badge-rose-text)' }}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>خطاهای احتمالی این گام:</span>
                  </h4>
                  <div className="space-y-3">
                    {currentStep.errorGuides.map((err) => (
                      <div key={err.id} className="text-xs p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-red-600 dark:text-red-400">
                            [{err.errorCode}] {err.errorTitle}
                          </span>
                          {err.escalationContact && (
                            <span className="text-[11px] text-slate-500">
                              پیگیری: {err.escalationContact}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          <span className="font-semibold">راه‌حل رفع خطا: </span>
                          {err.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation & Completion Runner Controls */}
              <div className="flex items-center justify-between pt-6 border-t flex-wrap gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>گام قبلی</span>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={activeStepIndex === process.steps.length - 1}
                    onClick={() => setActiveStepIndex(prev => Math.min(process.steps.length - 1, prev + 1))}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <span>رد کردن و گام بعد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteAndNext(currentStep.stepKey)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md text-white bg-blue-600 hover:bg-blue-700 hover:scale-105"
                  >
                    <span>{activeStepIndex === process.steps.length - 1 ? 'تکمیل و پایان فرایند' : 'تکمیل این گام و رفتن به بعد'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Tab 3: Global Error Matrix */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: 'var(--badge-rose-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <div>
              <h3 className="text-base font-black" style={{ color: 'var(--badge-rose-text)' }}>
                ماتریس جامع رفع خطاهای فرایند
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                تمام کدهای خطا و راه‌حل‌های تست‌شده برای پیشگیری از گیر افتادن کاربر
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
              {allErrors.length} خطا
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allErrors.map((err) => (
              <div key={err.id} className="p-5 rounded-2xl border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {err.errorCode}
                    </span>
                    <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {err.errorTitle}
                    </h4>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                    گام {err.stepIndex}: {err.stepTitle}
                  </span>
                </div>

                <div className="text-xs sm:text-sm space-y-2.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <p className="whitespace-pre-line">
                    <span className="font-bold text-slate-500 ml-1">علت بروز:</span>
                    {err.cause}
                  </p>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">راه‌حل گام‌به‌گام:</span>
                    {err.solution}
                  </p>
                </div>

                {err.escalationContact && (
                  <div className="mt-3 text-xs font-semibold text-slate-400">
                    <span>واحد پشتیبان: </span>
                    <span className="text-blue-500">{err.escalationContact}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Scratchpad */}
      {activeTab === 'scratchpad' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl"
            style={{ background: 'var(--badge-amber-bg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
          >
            <h3 className="text-base font-black" style={{ color: 'var(--badge-amber-text)' }}>
              جعبه‌ابزار و یادداشت‌های موقت (Scratchpad)
            </h3>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              کدهای پرسنلی، شماره تراکنش، ایمیل‌ها یا نکاتی که حین اجرای این فرایند به آن نیاز دارید را اینجا بنویسید. این اطلاعات در مرورگر شما باقی می‌ماند.
            </p>
          </div>

          <textarea
            value={scratchpadNote}
            onChange={(e) => setScratchpadNote(e.target.value)}
            placeholder="یادداشت‌های موقت خود را برای این فرایند اینجا وارد نمایید..."
            rows={10}
            className="w-full p-5 rounded-2xl text-sm font-medium leading-relaxed border outline-none resize-y"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-primary)',
            }}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {isSavedNotice ? '✅ یادداشت شما با موفقیت ذخیره شد' : 'داده‌ها به صورت امن در مرورگر ذخیره می‌شوند.'}
            </span>

            <button
              type="button"
              onClick={handleSaveScratchpad}
              className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
            >
              <Save className="w-4 h-4" />
              <span>ذخیره در مرورگر</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Scratchpad Quick-Access Drawer */}
      <ScratchpadDrawer
        processId={process.id}
        isOpen={isScratchpadDrawerOpen}
        onToggle={() => setIsScratchpadDrawerOpen((prev) => !prev)}
      />

      {/* Process Granular Access & Sharing Modal */}
      <ProcessAccessModal
        process={currentProcess}
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onUpdate={(updated) => setCurrentProcess(updated)}
      />
    </div>
  );
}
