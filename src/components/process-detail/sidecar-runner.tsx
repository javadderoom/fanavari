'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Process, 
  ProcessStep 
} from '@/types/process';
import { 
  Columns2, 
  X, 
  Minimize2, 
  Maximize2, 
  ExternalLink, 
  Check, 
  CheckCircle2, 
  Layers, 
  GitFork, 
  AlertTriangle, 
  Lightbulb, 
  Copy, 
  ArrowRight, 
  ArrowLeft, 
  Square, 
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Laptop
} from 'lucide-react';
import { MenuPathDisplay } from '../menu-path-display';
import { StepContentRenderer, hasValidStepContent } from '../step-content-renderer';
import { notify } from '@/lib/notify';

interface SidecarRunnerProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  completedStepKeys: string[];
  onToggleStepComplete: (stepKey: string) => void;
  onCompleteAndNext: (stepKey: string) => void;
  onResetProgress: () => void;
  isStandalonePopout?: boolean;
}

export function SidecarRunner({
  process,
  isOpen,
  onClose,
  activeStepIndex,
  onSelectStep,
  completedStepKeys,
  onToggleStepComplete,
  onCompleteAndNext,
  onResetProgress,
  isStandalonePopout = false,
}: SidecarRunnerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showErrorsDrawer, setShowErrorsDrawer] = useState(false);
  const sidecarRef = useRef<HTMLDivElement>(null);

  const steps = process.steps || [];
  const currentStep = steps[activeStepIndex];
  const isCurrentStepCompleted = currentStep ? completedStepKeys.includes(currentStep.stepKey) : false;

  const totalCount = steps.length;
  const completedCount = steps.filter((s) => completedStepKeys.includes(s.stepKey)).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    notify.success(`مقدار «${label}» در کلیپ‌بورد کپی شد.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePopout = () => {
    const width = 430;
    const height = 760;
    const left = window.screen.width - width - 50;
    const top = 60;
    window.open(
      `/process/${process.slug}/sidecar`,
      `Sidecar_${process.slug}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // Keyboard navigation when sidecar is active
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input typing
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        // Next step in Persian RTL
        if (activeStepIndex < steps.length - 1) {
          onSelectStep(activeStepIndex + 1);
        }
      } else if (e.key === 'ArrowRight') {
        // Previous step in Persian RTL
        if (activeStepIndex > 0) {
          onSelectStep(activeStepIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, activeStepIndex, steps.length, onSelectStep]);

  if (!isOpen) return null;

  // Minimized floating bubble
  if (isMinimized && !isStandalonePopout) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl border shadow-2xl bg-slate-900/90 text-white backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-all border-purple-500/40 animate-in slide-in-from-bottom"
        title="کلیک برای باز کردن مجدد سایدکار"
      >
        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
          <Columns2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold line-clamp-1 max-w-[160px]">
            {process.title}
          </div>
          <div className="text-[10px] text-purple-300 font-mono mt-0.5" dir="ltr">
            Step {activeStepIndex + 1} of {totalCount} ({progressPercent}%)
          </div>
        </div>
      </div>
    );
  }

  const containerClasses = isStandalonePopout
    ? 'w-full h-screen flex flex-col bg-slate-950 text-white'
    : 'fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] flex flex-col bg-slate-950/95 text-white backdrop-blur-xl border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-200';

  return (
    <aside 
      ref={sidecarRef}
      className={containerClasses}
      dir="rtl"
    >
      {/* Sidecar Top Header Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Columns2 className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-purple-400 block">
                سایدکار اجرای همزمان (Sidecar Runner)
              </span>
              <h3 className="text-xs font-black truncate max-w-[210px] text-white" title={process.title}>
                {process.title}
              </h3>
            </div>
          </div>

          {/* Window Action Controls */}
          <div className="flex items-center gap-1">
            {!isStandalonePopout && (
              <>
                <button
                  type="button"
                  onClick={handlePopout}
                  title="باز کردن در پنجره مستقل پاپ‌آپ (چند مانیتوره)"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="کوچک کردن به حالت شناور"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="بستن سایدکار"
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Strip */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span>مرحله {activeStepIndex + 1} از {totalCount}</span>
            <span className="font-mono text-purple-400" dir="ltr">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sidecar Scrollable Step Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {currentStep ? (
          <>
            {/* Step Identity & Type Pill */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  currentStep.stepType === 'decision'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : currentStep.stepType === 'warning'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : currentStep.stepType === 'end'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentStep.stepType === 'decision'
                    ? 'نود تصمیم‌گیری'
                    : currentStep.stepType === 'warning'
                    ? 'ایست بازرسی حساس'
                    : currentStep.stepType === 'end'
                    ? 'نود خاتمه فرایند'
                    : `گام ${currentStep.orderIndex}`}
                </span>

                {/* Mark as Done Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleStepComplete(currentStep.stepKey)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                    isCurrentStepCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  {isCurrentStepCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{isCurrentStepCompleted ? 'تکمیل شد ✓' : 'علامت انجام'}</span>
                </button>
              </div>

              <h2 className="text-sm font-black text-white leading-snug">
                {currentStep.title}
              </h2>
            </div>

            {/* Target Software Menu Sequence */}
            {currentStep.targetMenuPath && (
              <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">مسیر کلیک منو:</span>
                <MenuPathDisplay path={currentStep.targetMenuPath} variant="modal" />
              </div>
            )}

            {/* Quick Copy Fields Bar */}
            {currentStep.copyableFields && currentStep.copyableFields.length > 0 && (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Copy className="w-3 h-3 text-purple-400" />
                  <span>داده‌های سریع جهت کپی در سامانه:</span>
                </span>
                <div className="space-y-1.5">
                  {currentStep.copyableFields.map((field, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(field.value, field.label)}
                      className="p-2 rounded-lg border border-slate-800/80 bg-slate-950/80 hover:border-purple-500/40 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-400 block">{field.label}</span>
                        <code className="text-xs text-purple-300 font-mono font-bold block truncate" dir="ltr">
                          {field.value}
                        </code>
                      </div>
                      <button type="button" className="p-1 text-slate-400 hover:text-purple-300">
                        {copiedField === field.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step Instructions / Markdown Body */}
            {hasValidStepContent(currentStep.contentMarkdown) && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 leading-relaxed text-[11px]">
                <StepContentRenderer content={currentStep.contentMarkdown} />
              </div>
            )}

            {/* Step Tips */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-[11px] text-amber-400">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>نکات کاربردی:</span>
                </div>
                {currentStep.tips.map((t, idx) => (
                  <p key={idx} className="text-[10px] text-amber-200/90">• {t}</p>
                ))}
              </div>
            )}

            {/* Quick Errors Toggle */}
            {currentStep.errorGuides && currentStep.errorGuides.length > 0 && (
              <div className="border border-rose-500/20 rounded-xl overflow-hidden bg-rose-500/5">
                <button
                  type="button"
                  onClick={() => setShowErrorsDrawer((prev) => !prev)}
                  className="w-full p-2.5 flex items-center justify-between text-[11px] font-bold text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>راهنمای خطاهای این گام ({currentStep.errorGuides.length})</span>
                  </span>
                  <span className="text-[10px]">{showErrorsDrawer ? '▲ بستن' : '▼ مشاهده'}</span>
                </button>
                {showErrorsDrawer && (
                  <div className="p-3 space-y-2 border-t border-rose-500/20 bg-slate-950/70">
                    {currentStep.errorGuides.map((err) => (
                      <div key={err.id} className="p-2 rounded-lg border border-rose-500/30 text-[10px]">
                        <span className="font-bold text-rose-400 block mb-0.5">[{err.errorCode}] {err.errorTitle}</span>
                        <p className="text-slate-300 whitespace-pre-line">{err.solution}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            هیچ گامی در این فرایند یافت نشد.
          </div>
        )}
      </div>

      {/* Sidecar Bottom Fixed Controls Bar */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={activeStepIndex === 0}
            onClick={() => onSelectStep(Math.max(0, activeStepIndex - 1))}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>گام قبل</span>
          </button>

          <button
            type="button"
            onClick={() => onCompleteAndNext(currentStep ? currentStep.stepKey : '')}
            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{activeStepIndex === steps.length - 1 ? 'پایان فرایند' : 'تکمیل و بعد'}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target System Portal Direct Link */}
        {process.targetUrl && (
          <a
            href={process.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>ورود مستقیم به {process.targetSystem || 'سامانه هدف'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </aside>
  );
}
