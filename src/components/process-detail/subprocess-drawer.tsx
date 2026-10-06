'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Process } from '@/types/process';
import { StepContentRenderer } from '../step-content-renderer';
import { MenuPathDisplay } from '../menu-path-display';
import { notify } from '@/lib/notify';
import { 
  X, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Check, 
  Layers, 
  GitFork, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Building2,
  Laptop,
  ArrowLeft
} from 'lucide-react';

interface SubProcessDrawerProps {
  subProcessSlug: string;
  parentProcessTitle: string;
  parentStepTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleteParentStep?: () => void;
}

export function SubProcessDrawer({
  subProcessSlug,
  parentProcessTitle,
  parentStepTitle,
  isOpen,
  onClose,
  onCompleteParentStep,
}: SubProcessDrawerProps) {
  const [subProcess, setSubProcess] = useState<Process | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !subProcessSlug) return;

    let isMounted = true;
    async function loadSubProcess() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/processes/${encodeURIComponent(subProcessSlug)}`);
        if (!res.ok) throw new Error('Sub-process not found');
        const data = await res.json();
        if (isMounted) {
          setSubProcess(data);
          setActiveStepIndex(0);
          setCompletedSteps([]);
        }
      } catch (err) {
        console.error('Failed to load child sub-process:', err);
        notify.error('خطا در بارگذاری جزئیات زیر-فرایند');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSubProcess();
    return () => {
      isMounted = false;
    };
  }, [isOpen, subProcessSlug]);

  if (!isOpen) return null;

  const currentStep = subProcess?.steps?.[activeStepIndex];

  const handleToggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => 
      prev.includes(stepKey) ? prev.filter((k) => k !== stepKey) : [...prev, stepKey]
    );
  };

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(label);
    notify.success(`مقدار «${label}» کپی شد.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFinishSubProcess = () => {
    notify.success('زیر-فرایند با موفقیت تکمیل شد!');
    if (onCompleteParentStep) {
      onCompleteParentStep();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div 
        className="w-full max-w-2xl h-full flex flex-col shadow-2xl border-r overflow-hidden transition-all duration-300 slide-in-from-left"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)' }}
      >
        {/* Drawer Header with Parent Breadcrumb */}
        <div className="p-5 border-b shrink-0 flex items-center justify-between"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="truncate max-w-[140px]">{parentProcessTitle}</span>
                <span>/</span>
                <span className="truncate max-w-[140px] text-indigo-600 dark:text-indigo-400 font-bold">{parentStepTitle}</span>
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)] mt-0.5 flex items-center gap-2">
                <span>{subProcess?.title || 'زیر-فرایند وابسته'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  SUB-PROCESS
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {subProcess && (
              <Link
                href={`/process/${subProcess.slug}`}
                target="_blank"
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all"
                title="مشاهده در صفحه تمام‌صفحه مستقل"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="بازگشت به فرایند اصلی"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin opacity-50" />
              <p className="text-xs font-bold">در حال بارگذاری ساختار زیر-فرایند...</p>
            </div>
          ) : !subProcess ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
              <p className="text-sm font-bold text-[var(--text-primary)]">زیر-فرایند یافت نشد</p>
              <p className="text-xs">شناسه یا پیوند زیر-فرایند مشخص‌شده معتبر نمی‌باشد.</p>
            </div>
          ) : (
            <>
              {/* Sub-process Meta Banner */}
              <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{subProcess.departmentName}</span>
                    <span>•</span>
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{subProcess.targetSystem}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {subProcess.description}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                    {subProcess.steps.length} گام
                  </span>
                </div>
              </div>

              {/* Sub-Process Stepper Navigation */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  مراحل اجرایی زیر-فرایند:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subProcess.steps.map((st, idx) => {
                    const isDone = completedSteps.includes(st.stepKey);
                    const isSelected = idx === activeStepIndex;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500'
                            : isDone
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">گام {st.orderIndex}: {st.title}</span>
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Step Details */}
              {currentStep && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                        {currentStep.orderIndex}
                      </span>
                      <h4 className="font-black text-sm text-[var(--text-primary)]">
                        {currentStep.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStep(currentStep.stepKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        completedSteps.includes(currentStep.stepKey)
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{completedSteps.includes(currentStep.stepKey) ? 'انجام شد' : 'علامت‌گذاری اتمام'}</span>
                    </button>
                  </div>

                  {currentStep.targetMenuPath && (
                    <MenuPathDisplay path={currentStep.targetMenuPath} variant="interactive" />
                  )}

                  <div className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    <StepContentRenderer content={currentStep.contentMarkdown} />
                  </div>

                  {/* Copyable fields */}
                  {currentStep.copyableFields && currentStep.copyableFields.length > 0 && (
                    <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[11px] font-bold text-slate-400">مقادیر قابل کپی این گام:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentStep.copyableFields.map((field, fIdx) => (
                          <div 
                            key={fIdx}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block">{field.label}</span>
                              <span className="text-xs font-mono font-bold truncate block">{field.value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(field.value, field.label)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فرایند والد</span>
          </button>

          <button
            type="button"
            onClick={handleFinishSubProcess}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md cursor-pointer flex items-center gap-2 hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تکمیل زیر-فرایند و ثبت در والد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
