'use client';

import React, { useState, useEffect } from 'react';
import { Process, WorkflowRun } from '@/types/process';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScratchpadDrawer } from './scratchpad-drawer';
import { ProcessAccessModal } from './process-access-modal';
import { ProcessHeaderBanner } from './process-detail/process-header-banner';
import { ProcessErrorMatrixTab } from './process-detail/process-error-matrix-tab';
import { ProcessScratchpadTab } from './process-detail/process-scratchpad-tab';
import { StepRunnerView } from './process-detail/step-runner-view';
import { QuickStartRunModal } from './process-detail/quick-start-run-modal';
import { RunCompletionModal } from './process-detail/run-completion-modal';
import { ProcessRunAuditModal } from './process-detail/process-run-audit-modal';
import { SidecarRunner } from './process-detail/sidecar-runner';
import { ProcessRunsTab } from './process-detail/process-runs-tab';
import { SubProcessDrawer } from './process-detail/subprocess-drawer';
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
  GitFork, 
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
  Lock,
  Globe,
  Award
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
  const [activeTab, setActiveTab] = useState<'flow' | 'errors' | 'scratchpad' | 'runs'>('flow');
  const [activeRun, setActiveRun] = useState<WorkflowRun | null>(null);
  const [isQuickStartModalOpen, setIsQuickStartModalOpen] = useState(false);
  const [completedRunForModal, setCompletedRunForModal] = useState<WorkflowRun | null>(null);
  const [selectedAuditRun, setSelectedAuditRun] = useState<WorkflowRun | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSidecarOpen, setIsSidecarOpen] = useState(false);

  // Sub-Process Drill-Down Drawer State
  const [subProcessDrawer, setSubProcessDrawer] = useState<{
    isOpen: boolean;
    slug: string;
    stepTitle: string;
  }>({
    isOpen: false,
    slug: '',
    stepTitle: '',
  });

  const handleDrillDownSubProcess = (subProcessSlug: string, stepTitle: string) => {
    setSubProcessDrawer({
      isOpen: true,
      slug: subProcessSlug,
      stepTitle,
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fanavari-sidecar-open');
      if (saved === 'true') {
        setIsSidecarOpen(true);
      }
    } catch (e) {}
  }, []);

  const handleToggleSidecar = () => {
    setIsSidecarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fanavari-sidecar-open', String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleCloseSidecar = () => {
    setIsSidecarOpen(false);
    try {
      localStorage.setItem('fanavari-sidecar-open', 'false');
    } catch (e) {}
  };

  // Scratchpad state with localStorage
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isScratchpadDrawerOpen, setIsScratchpadDrawerOpen] = useState(false);

  // Live Step Completion State (checkboxes persist to localStorage)
  const [completedStepKeys, setCompletedStepKeys] = useState<string[]>([]);

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
        }
      }
    } catch (e) {
      console.error('Error loading process session:', e);
    }
  }, [process.id, process.steps.length]);

  const logStepToActiveRun = async (stepKey: string, isCompleted: boolean, operatorNotes?: string) => {
    if (!activeRun) return;
    const step = process.steps.find((s) => s.stepKey === stepKey);
    if (!step) return;

    try {
      const res = await fetch(`/api/processes/${process.slug}/runs/${activeRun.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          stepLog: {
            stepKey: step.stepKey,
            stepOrder: step.orderIndex,
            stepTitle: step.title,
            stepId: step.id,
            status: isCompleted ? 'completed' : 'skipped',
            operatorNotes: operatorNotes || undefined,
            isCheckpoint: step.stepType === 'warning',
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.run) {
          setActiveRun(data.run);
        }
      }
    } catch (err) {
      console.error('Error logging step to workflow run:', err);
    }
  };

  const completeActiveRunIfDone = async (completedCount: number) => {
    if (!activeRun || activeRun.status === 'completed') return;
    if (completedCount === process.steps.length) {
      try {
        const res = await fetch(`/api/processes/${process.slug}/runs/${activeRun.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
          },
          body: JSON.stringify({
            status: 'completed',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.run) {
            setActiveRun(data.run);
            setCompletedRunForModal(data.run);
            notify.success('اجرای رسمی با موفقیت خاتمه یافت و لاگ ممیزی ایزو ثبت گردید!');
          }
        }
      } catch (err) {
        console.error('Error completing workflow run:', err);
      }
    }
  };

  const handleFinishActiveRun = async () => {
    if (!activeRun) return;
    const ok = await notify.confirm({
      title: 'ثبت خاتمه رسمی اجرا و صدور گواهی ممیزی',
      message: `آیا از ثبت و بستن اجرای رسمی #${activeRun.runNumber} اطمینان دارید؟ کارنامه ممیزی و تایم‌لاین ISO ثبت نهایی خواهد شد.`,
      confirmText: 'بله، ثبت و صدور گواهی',
      cancelText: 'انصراف',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/processes/${process.slug}/runs/${activeRun.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.run) {
          setActiveRun(data.run);
          setCompletedRunForModal(data.run);
          notify.success('اجرای رسمی با موفقیت پایان یافت و گواهی ممیزی ثبت گردید!');
        }
      }
    } catch (err) {
      console.error('Error completing active run:', err);
    }
  };

  const toggleStepCompleted = (stepKey: string, operatorNotes?: string) => {
    setCompletedStepKeys((prev) => {
      let next: string[];
      const isNowDone = !prev.includes(stepKey);
      if (isNowDone) {
        next = [...prev, stepKey];
        notify.success('گام به عنوان انجام‌شده علامت‌گذاری شد ✓');
        logStepToActiveRun(stepKey, true, operatorNotes);
        completeActiveRunIfDone(next.length);
      } else {
        next = prev.filter((k) => k !== stepKey);
        logStepToActiveRun(stepKey, false, operatorNotes);
      }
      try {
        localStorage.setItem(`fanavari-completed-${process.id}`, JSON.stringify(next));
      } catch (e) {
        console.error('Error saving progress:', e);
      }
      return next;
    });
  };

  const handleCompleteAndNext = (stepKey: string, operatorNotes?: string) => {
    if (!completedStepKeys.includes(stepKey)) {
      toggleStepCompleted(stepKey, operatorNotes);
    }
    if (activeStepIndex < process.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
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
      notify.success('پیشرفت فرایند با موفقیت بازنشانی شد.');
    }
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
        onToggleSidecar={handleToggleSidecar}
        isSidecarOpen={isSidecarOpen}
        onStartOfficialRun={() => setIsQuickStartModalOpen(true)}
        activeRun={activeRun}
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

        <button
          type="button"
          onClick={() => setActiveTab('runs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'runs' ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeTab === 'runs' ? 'var(--badge-blue-text)' : 'var(--bg-surface)',
            color: activeTab === 'runs' ? '#ffffff' : 'var(--text-secondary)',
            border: '1px solid var(--border-glass)'
          }}
        >
          <Award className="w-4 h-4" />
          <span>سوابق اجرا و ممیزی ISO</span>
          {activeRun && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab 1: Step-by-Step Walkthrough */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          <StepRunnerView
            steps={process.steps}
            activeStepIndex={activeStepIndex}
            completedStepKeys={completedStepKeys}
            onSelectStep={(idx) => setActiveStepIndex(idx)}
            onToggleStepComplete={(stepKey, notes) => toggleStepCompleted(stepKey, notes)}
            onCompleteAndNext={(stepKey, notes) => handleCompleteAndNext(stepKey, notes)}
            copiedField={copiedField}
            onCopyField={handleCopy}
            activeRun={activeRun}
            onDisconnectRun={() => {
              setActiveRun(null);
              notify.info('اتصال به اجرای رسمی قطع گردید.');
            }}
            onFinishActiveRun={handleFinishActiveRun}
            onDrillDownSubProcess={handleDrillDownSubProcess}
          />
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

      {/* Tab 4: Workflow Execution Runs & Compliance Audit Trail */}
      {activeTab === 'runs' && (
        <ProcessRunsTab
          processId={process.id}
          processSlug={process.slug}
          processTitle={process.title}
          totalSteps={process.steps.length}
          activeRunId={activeRun?.id || null}
          onActivateRun={(run) => {
            setActiveRun(run);
            setActiveTab('flow');
            notify.success(`اجرای رسمی #${run.runNumber} در کنسول فعال گردید.`);
          }}
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

      {/* Dockable Sidecar Companion Runner */}
      <SidecarRunner
        process={currentProcess}
        isOpen={isSidecarOpen}
        onClose={handleCloseSidecar}
        activeStepIndex={activeStepIndex}
        onSelectStep={(idx) => setActiveStepIndex(idx)}
        completedStepKeys={completedStepKeys}
        onToggleStepComplete={(stepKey) => toggleStepCompleted(stepKey)}
        onCompleteAndNext={(stepKey) => handleCompleteAndNext(stepKey)}
        onResetProgress={handleResetProgress}
      />

      {/* Child Sub-Process Slide-out Drawer */}
      <SubProcessDrawer
        isOpen={subProcessDrawer.isOpen}
        subProcessSlug={subProcessDrawer.slug}
        parentProcessTitle={currentProcess.title}
        parentStepTitle={subProcessDrawer.stepTitle}
        onClose={() => setSubProcessDrawer((prev) => ({ ...prev, isOpen: false }))}
        onCompleteParentStep={() => {
          const curStep = currentProcess.steps[activeStepIndex];
          if (curStep) {
            toggleStepCompleted(curStep.stepKey);
          }
        }}
      />

      {/* Official Workflow Run Quick-Launch Modal */}
      <QuickStartRunModal
        process={currentProcess}
        isOpen={isQuickStartModalOpen}
        onClose={() => setIsQuickStartModalOpen(false)}
        onRunStarted={(run) => {
          setActiveRun(run);
          setActiveTab('flow');
          notify.success(`اجرای رسمی #${run.runNumber} با موفقیت آغاز گردید!`);
        }}
      />

      {/* Workflow Run Completion & ISO Audit Certificate Modal */}
      {completedRunForModal && (
        <RunCompletionModal
          run={completedRunForModal}
          processSlug={process.slug}
          isOpen={!!completedRunForModal}
          onClose={() => setCompletedRunForModal(null)}
          onViewAuditDetails={(run) => {
            setSelectedAuditRun(run);
            setCompletedRunForModal(null);
          }}
          onRestartNewRun={() => {
            setCompletedRunForModal(null);
            handleResetProgress();
            setIsQuickStartModalOpen(true);
          }}
        />
      )}

      {/* ISO Compliance Audit Sheet & Certificate Viewer Modal */}
      {selectedAuditRun && (
        <ProcessRunAuditModal
          run={selectedAuditRun}
          processTitle={process.title}
          processSlug={process.slug}
          isOpen={!!selectedAuditRun}
          onClose={() => setSelectedAuditRun(null)}
          onRunUpdated={(updated) => {
            setSelectedAuditRun(updated);
            if (activeRun?.id === updated.id) {
              setActiveRun(updated);
            }
          }}
        />
      )}
    </div>
  );
}
