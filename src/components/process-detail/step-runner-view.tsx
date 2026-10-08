'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ProcessStep,
  WorkflowRun
} from '@/types/process';
import { MenuPathDisplay } from '../menu-path-display';
import { StepContentRenderer, hasValidStepContent } from '../step-content-renderer';
import { ImageHotspotViewer } from '../image-hotspot-viewer';
import { UiSnippetCard } from '../ui-snippet-card';
import { 
  Check, 
  CheckCircle2, 
  GitFork, 
  AlertTriangle, 
  Layers, 
  Square, 
  Copy, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Play,
  LogOut,
  Clock,
  FileText,
  MousePointerClick
} from 'lucide-react';

interface StepRunnerViewProps {
  steps: ProcessStep[];
  activeStepIndex: number;
  completedStepKeys: string[];
  onSelectStep: (index: number) => void;
  onToggleStepComplete: (stepKey: string, operatorNotes?: string) => void;
  onCompleteAndNext: (stepKey: string, operatorNotes?: string) => void;
  copiedField: string | null;
  onCopyField: (text: string, label: string) => void;
  activeRun?: WorkflowRun | null;
  onDisconnectRun?: () => void;
  onFinishActiveRun?: () => void;
  onDrillDownSubProcess?: (subProcessSlug: string, stepTitle: string) => void;
}

export function StepRunnerView({
  steps,
  activeStepIndex,
  completedStepKeys,
  onSelectStep,
  onToggleStepComplete,
  onCompleteAndNext,
  copiedField,
  onCopyField,
  activeRun,
  onDisconnectRun,
  onFinishActiveRun,
  onDrillDownSubProcess,
}: StepRunnerViewProps) {
  const currentStep = steps[activeStepIndex];
  const isCurrentStepCompleted = currentStep ? completedStepKeys.includes(currentStep.stepKey) : false;

  // Local state for per-step operator notes
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});

  // Live timer for active run
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeRun || activeRun.status !== 'in_progress') {
      setElapsedSeconds(activeRun?.totalDurationSeconds || 0);
      return;
    }
    const startMs = new Date(activeRun.startedAt).getTime();
    const update = () => {
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeRun]);

  const timerMins = Math.floor(elapsedSeconds / 60);
  const timerSecs = elapsedSeconds % 60;
  const formattedTimer = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Official Execution Run HUD Banner */}
      {activeRun && (
        <div className="p-4 sm:p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent backdrop-blur-md flex items-center justify-between gap-4 flex-wrap animate-in fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-600 text-white uppercase tracking-wider font-mono" dir="ltr">
                  OFFICIAL RUN #{activeRun.runNumber}
                </span>
                <span className="text-sm font-black text-blue-950 dark:text-blue-100">
                  {activeRun.title}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-blue-800/80 dark:text-blue-200/80 mt-0.5">
                مجری: <strong>{activeRun.operatorName}</strong> ({activeRun.operatorRole || 'کاربر سازمانی'}) • پایش زمان و لاگ ممیزی فعال است.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Stopwatch Timer */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-mono text-xs font-black shadow-xs" dir="ltr">
              <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>{formattedTimer}</span>
            </div>

            {onFinishActiveRun && (
              <button
                type="button"
                onClick={onFinishActiveRun}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                title="ثبت خاتمه و ثبت رسمی لاگ ممیزی"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت و پایان رسمی اجرا</span>
              </button>
            )}

            {onDisconnectRun && (
              <button
                type="button"
                onClick={onDisconnectRun}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="توقف موقت یا خروج بدون ابطال"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج از رهگیری</span>
              </button>
            )}
          </div>
        </div>
      )}

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
          {steps.map((step, idx) => {
            const isSelected = idx === activeStepIndex;
            const isStepCompleted = completedStepKeys.includes(step.stepKey);
            const isDecision = step.stepType === 'decision';
            const isEnd = step.stepType === 'end';
            const isWarning = step.stepType === 'warning';
            const isSubProcess = step.stepType === 'subprocess';

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(idx)}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isDecision
                      ? 'shadow-lg scale-[1.02] ring-2 ring-amber-500 border-amber-400'
                      : isEnd
                      ? 'shadow-lg scale-[1.02] ring-2 ring-emerald-500 border-emerald-500'
                      : isWarning
                      ? 'shadow-lg scale-[1.02] ring-2 ring-rose-500 border-rose-400'
                      : isSubProcess
                      ? 'shadow-lg scale-[1.02] ring-2 ring-indigo-500 border-indigo-400'
                      : 'shadow-lg scale-[1.02] ring-2 ring-blue-500 border-blue-400'
                    : isStepCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500'
                    : isDecision
                    ? 'border-amber-400/60 dark:border-amber-600/60 bg-amber-500/5 hover:border-amber-400'
                    : isEnd
                    ? 'border-emerald-400/60 dark:border-emerald-600/60 ring-1 ring-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400'
                    : isWarning
                    ? 'border-rose-400/60 dark:border-rose-600/60 bg-rose-500/5 hover:border-rose-400'
                    : isSubProcess
                    ? 'border-indigo-400/60 dark:border-indigo-600/60 bg-indigo-500/5 hover:border-indigo-400'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  background: isSelected ? 'var(--bg-surface)' : undefined,
                  borderColor: !isSelected && !isStepCompleted && !isDecision && !isEnd && !isWarning && !isSubProcess ? 'var(--border-glass)' : undefined,
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
                        <Check className="w-3 3 stroke-[3]" />
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

      {/* Active Step Dedicated Card */}
      {currentStep && (
        <div className={`glass-card rounded-3xl p-6 sm:p-8 border shadow-lg transition-all ${
          currentStep.stepType === 'decision'
            ? 'border-amber-500/30'
            : currentStep.stepType === 'warning'
            ? 'border-rose-500/30'
            : currentStep.stepType === 'end'
            ? 'border-emerald-500/30'
            : ''
        }`}
          style={{ borderColor: currentStep.stepType === 'action' ? 'var(--border-glass)' : undefined }}
        >
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  مرحله {currentStep.orderIndex} از {steps.length}
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
              onClick={() => onToggleStepComplete(currentStep.stepKey, stepNotes[currentStep.stepKey])}
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

          {/* Hierarchical Sub-Process Drill-Down Card */}
          {(currentStep.stepType === 'subprocess' || currentStep.subProcessSlug || currentStep.subProcess) && (
            <div className="mb-6 p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono" dir="ltr">
                      SUB-PROCESS
                    </span>
                    <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
                      {currentStep.subProcess?.title || currentStep.subProcessTitle || 'زیر-فرایند وابسته سازمانی'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onDrillDownSubProcess && (currentStep.subProcessSlug || currentStep.subProcess?.slug) && (
                    <button
                      type="button"
                      onClick={() => onDrillDownSubProcess(
                        (currentStep.subProcess?.slug || currentStep.subProcessSlug)!,
                        currentStep.title
                      )}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-105"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>ورود و اجرای زیر-فرایند (Drill Down)</span>
                    </button>
                  )}

                  {(currentStep.subProcessSlug || currentStep.subProcess?.slug) && (
                    <Link
                      href={`/process/${currentStep.subProcess?.slug || currentStep.subProcessSlug}`}
                      target="_blank"
                      className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all"
                      title="مشاهده مستقل در تب جدید"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                این مرحله شامل یک رویه مستقل است. می‌توانید مستقیماً وارد زیر-فرایند شده و پس از تکمیل، ادامه این فرایند را پیش ببرید.
              </p>
            </div>
          )}

          {/* Interactive Screenshot Viewer with Hotspot Pins */}
          {currentStep.imageUrl && (
            <div className="mb-8">
              <ImageHotspotViewer
                imageUrl={currentStep.imageUrl}
                alt={currentStep.title}
                hotspots={currentStep.hotspots || []}
              />
            </div>
          )}

          {/* Target Click Action Elements (Micro-Images) */}
          {currentStep.uiSnippets && currentStep.uiSnippets.length > 0 && (
            <div className="mb-8 p-5 rounded-2xl border"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-glass)' }}
            >
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>دکمه‌ها و گزینه‌های تصویری برای کلیک در سامانه:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentStep.uiSnippets.map((snippet, sIdx) => (
                  <UiSnippetCard
                    key={snippet.id || sIdx}
                    snippet={snippet}
                    imageHeightClass="h-28"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Copyable Fields */}
          {currentStep.copyableFields && currentStep.copyableFields.length > 0 && (
            <div className="mb-8 p-5 rounded-2xl border"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-glass)' }}
            >
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Copy className="w-3.5 h-3.5" />
                <span>اطلاعات و مقادیر مورد نیاز جهت ثبت (برای کپی کلیک کنید):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStep.copyableFields.map((field, fIdx) => (
                  <div
                    key={fIdx}
                    onClick={() => onCopyField(field.value, field.label)}
                    className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-blue-500 hover:scale-[1.01]"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <span className="text-[11px] font-semibold block text-slate-400">
                        {field.label}
                      </span>
                      <span className="text-xs font-mono font-bold mt-0.5 block" style={{ color: 'var(--text-primary)' }} dir="ltr">
                        {field.value}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold"
                    >
                      {copiedField === field.value ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Markdown / Instructions Content */}
          {hasValidStepContent(currentStep.contentMarkdown) && (
            <div className="mb-6">
              <StepContentRenderer content={currentStep.contentMarkdown} />
            </div>
          )}

          {/* Tips Section */}
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

          {/* Active Run Operator Notes & Checkpoint Attestation */}
          {activeRun && (
            <div className="mb-6 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>یادداشت یا کد رهگیری مجری برای این گام (اختیاری جهت لاگ ممیزی):</span>
                </label>
                {currentStep.stepType === 'warning' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                    ایست بازرسی الزامی
                  </span>
                )}
              </div>
              <input
                type="text"
                value={stepNotes[currentStep.stepKey] || ''}
                onChange={(e) => setStepNotes(prev => ({ ...prev, [currentStep.stepKey]: e.target.value }))}
                placeholder="مثال: شماره پیگیری #12345، تایید کنترل کیفیت دریافت شد..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              {currentStep.stepType === 'warning' && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                  ⚠️ این مرحله به عنوان ایست بازرسی در شناسنامه ثبت شده است. یادداشت‌ها و زمان تکمیل به صورت سیستمی در برگه ممیزی ISO ضبط خواهد شد.
                </p>
              )}
            </div>
          )}

          {/* Step Navigation & Completion Runner Controls */}
          <div className="flex items-center justify-between pt-6 border-t flex-wrap gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => onSelectStep(Math.max(0, activeStepIndex - 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>گام قبلی</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={activeStepIndex === steps.length - 1}
                onClick={() => onSelectStep(Math.min(steps.length - 1, activeStepIndex + 1))}
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <span>رد کردن و گام بعد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onCompleteAndNext(currentStep.stepKey, stepNotes[currentStep.stepKey])}
                className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md text-white bg-blue-600 hover:bg-blue-700 hover:scale-105"
              >
                <span>{activeStepIndex === steps.length - 1 ? 'تکمیل و پایان فرایند' : 'تکمیل این گام و رفتن به بعد'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
