'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessStep } from '@/types/process';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScratchpadDrawer } from './scratchpad-drawer';
import { ProcessAccessModal } from './process-access-modal';
import { ProcessHeaderBanner } from './process-detail/process-header-banner';
import { ProcessErrorMatrixTab } from './process-detail/process-error-matrix-tab';
import { ProcessScratchpadTab } from './process-detail/process-scratchpad-tab';
import { FlowchartCanvas } from './process-detail/flowchart-canvas';
import { StepRunnerView } from './process-detail/step-runner-view';
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
  Globe,
  Compass
} from 'lucide-react';

interface ProcessDetailViewProps {
  process: Process;
}

export function ProcessDetailView({ process }: ProcessDetailViewProps) {
  const { currentUser } = useUserSession();
  const searchParams = useSearchParams();
  const [currentProcess, setCurrentProcess] = useState<Process>(process);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'flow' | 'errors' | 'scratchpad'>('flow');
  const [flowViewMode, setFlowViewMode] = useState<'canvas' | 'stepper'>('canvas');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scratchpad state with localStorage
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isScratchpadDrawerOpen, setIsScratchpadDrawerOpen] = useState(false);

  // Live Step Completion & Runner State
  const [completedStepKeys, setCompletedStepKeys] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-claim invite token if present in URL
  useEffect(() => {
    const claimToken = searchParams.get('claim');
    if (!claimToken) return;

    async function redeemClaim() {
      try {
        const res = await fetch(`/api/processes/${process.id}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
          },
          body: JSON.stringify({ claimToken }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          notify.success('دسترسی شما با موفقیت از طریق لینک دعوت فعال گردید!');
          // Refresh access grants from server
          const grantsRes = await fetch(`/api/processes/${process.id}/access`, {
            headers: {
              'x-user-id': currentUser.id,
              'x-user-permissions': String(currentUser.permissions),
            },
          });
          if (grantsRes.ok) {
            const grantsData = await grantsRes.json();
            setCurrentProcess((prev) => ({
              ...prev,
              accessGrants: grantsData.accessGrants || [],
            }));
          }
          // Clean URL parameter without page reload
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('claim');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        } else if (!res.ok) {
          notify.error(data.error || 'لینک دعوت نامعتبر است یا منقضی شده است.');
        }
      } catch (err) {
        console.error('Claim redemption error:', err);
      }
    }

    redeemClaim();
  }, [searchParams, process.id, currentUser.id, currentUser.permissions]);

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
  const isRestricted = currentProcess.visibility === 'restricted';

  // Multi-Audience Union Match:
  const matchingUserGrant = (currentProcess.accessGrants || []).find((g) => g.userId === currentUser.id);
  const matchingDeptGrant = (currentProcess.accessGrants || []).find(
    (g) => g.departmentId && currentUser.departmentId && g.departmentId === currentUser.departmentId
  );
  const matchingRoleGrant = (currentProcess.accessGrants || []).find(
    (g) => g.roleName && currentUser.roleName && g.roleName.trim().toLowerCase() === currentUser.roleName.trim().toLowerCase()
  );

  const hasGrant = Boolean(matchingUserGrant || matchingDeptGrant || matchingRoleGrant);
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
      <ProcessHeaderBanner
        process={process}
        currentProcess={currentProcess}
        isRestricted={isRestricted}
        matchingRoleGrant={matchingRoleGrant}
        matchingDeptGrant={matchingDeptGrant}
        matchingUserGrant={matchingUserGrant}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
      />


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

          {/* View Mode Switcher: Flowchart Canvas vs Step Runner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl border bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFlowViewMode('canvas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  flowViewMode === 'canvas'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>بوم تعاملی فلوچارت (Macro Canvas)</span>
              </button>
              <button
                type="button"
                onClick={() => setFlowViewMode('stepper')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  flowViewMode === 'stepper'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>رانر گام‌به‌گام (Step Runner)</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-medium px-2 flex items-center gap-1">
              {flowViewMode === 'canvas' ? (
                <span>🔍 درگ ماوس برای حرکت و اسکرول برای زوم ۲ بعدی</span>
              ) : (
                <span>📋 راهنمای اجرای خطی و چک‌لیست مراحل</span>
              )}
            </div>
          </div>

          {/* Flow View Mode: 2D Interactive Canvas */}
          {flowViewMode === 'canvas' && (
            <FlowchartCanvas
              steps={process.steps}
              activeStepIndex={activeStepIndex}
              completedStepKeys={completedStepKeys}
              onSelectStep={(idx) => setActiveStepIndex(idx)}
              onToggleCompleteStep={(stepKey) => toggleStepCompleted(stepKey)}
              onSwitchToRunner={() => setFlowViewMode('stepper')}
            />
          )}

          {/* Flow View Mode: Step Runner Walkthrough */}
          {flowViewMode === 'stepper' && (
            <StepRunnerView
              steps={process.steps}
              activeStepIndex={activeStepIndex}
              completedStepKeys={completedStepKeys}
              showCelebration={showCelebration}
              onSelectStep={(idx) => setActiveStepIndex(idx)}
              onToggleStepComplete={(stepKey) => toggleStepCompleted(stepKey)}
              onCompleteAndNext={(stepKey) => handleCompleteAndNext(stepKey)}
              onResetProgress={handleResetProgress}
              processSlug={process.slug}
              copiedField={copiedField}
              onCopyField={handleCopy}
            />
          )}
        </div>
      )}


      {/* Tab 2: Global Error Matrix */}
      {activeTab === 'errors' && (
        <ProcessErrorMatrixTab errors={allErrors} />
      )}

      {/* Tab 3: Scratchpad */}
      {activeTab === 'scratchpad' && (
        <ProcessScratchpadTab
          note={scratchpadNote}
          onChangeNote={(val) => setScratchpadNote(val)}
          onSave={handleSaveScratchpad}
          isSavedNotice={isSavedNotice}
        />
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
