'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessStep, StepType } from '@/types/process';
import { MenuPathDisplay } from './menu-path-display';
import { StepContentRenderer } from './step-content-renderer';
import {
  Clock,
  CheckCircle2,
  Check,
  GitFork,
  AlertTriangle,
  Layers,
  Copy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCheck,
  Filter,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';

interface ProcessTimelineViewProps {
  process: Process;
  onStepClick?: (stepIndex: number) => void;
}

export function ProcessTimelineView({ process, onStepClick }: ProcessTimelineViewProps) {
  // Checklist state saved in localStorage for operator session
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | 'decision' | 'warning' | 'pending'>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load saved checklist state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fanavari-timeline-done-${process.id}`);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading timeline checklist:', e);
    }

    // Default expand first 2 steps
    const initialExpanded: Record<string, boolean> = {};
    process.steps.forEach((s, idx) => {
      initialExpanded[s.id] = idx < 3;
    });
    setExpandedSteps(initialExpanded);
  }, [process.id, process.steps]);

  const toggleStepDone = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      localStorage.setItem(`fanavari-timeline-done-${process.id}`, JSON.stringify(next));
      return next;
    });
  };

  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const markAllDone = () => {
    const allDone: Record<string, boolean> = {};
    process.steps.forEach((s) => {
      allDone[s.id] = true;
    });
    setCompletedSteps(allDone);
    localStorage.setItem(`fanavari-timeline-done-${process.id}`, JSON.stringify(allDone));
  };

  const resetAllDone = () => {
    setCompletedSteps({});
    localStorage.removeItem(`fanavari-timeline-done-${process.id}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalSteps = process.steps.length;
  const doneCount = process.steps.filter((s) => completedSteps[s.id]).length;
  const progressPercent = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;

  // Filter steps
  const filteredSteps = process.steps.filter((step) => {
    if (filterType === 'decision') return step.stepType === 'decision';
    if (filterType === 'warning') return step.stepType === 'warning';
    if (filterType === 'pending') return !completedSteps[step.id];
    return true;
  });

  // Calculate approximate milestone time for step
  const getStepEstimatedTime = (index: number) => {
    if (!process.estimatedMinutes || totalSteps === 0) return null;
    const perStepMinutes = Math.max(1, Math.round(process.estimatedMinutes / totalSteps));
    const startMin = index * perStepMinutes;
    const endMin = (index + 1) * perStepMinutes;
    return `دقیقه ${startMin} الی ${endMin}`;
  };

  const getNodeVisuals = (type: StepType, isDone: boolean) => {
    if (isDone) {
      return {
        badgeLabel: 'انجام‌شده',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        cardBorder: 'border-emerald-500/50 dark:border-emerald-600/50',
        markerBg: 'bg-emerald-600 ring-4 ring-emerald-500/20 text-white',
        icon: <Check className="w-4 h-4" />,
      };
    }

    switch (type) {
      case 'decision':
        return {
          badgeLabel: '◇ بررسی و انشعاب شرطی',
          badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          cardBorder: 'border-amber-400/60 dark:border-amber-500/60 bg-gradient-to-br from-amber-500/5 to-transparent',
          markerBg: 'bg-amber-500 ring-4 ring-amber-500/20 text-slate-950',
          icon: <GitFork className="w-4 h-4" />,
        };
      case 'warning':
        return {
          badgeLabel: '⚠ ایست بازرسی و کنترل حساس',
          badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          cardBorder: 'border-rose-400/60 dark:border-rose-500/60 bg-gradient-to-br from-rose-500/5 to-transparent',
          markerBg: 'bg-rose-600 ring-4 ring-rose-500/20 text-white',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'end':
        return {
          badgeLabel: '◎ گام پایانی و خروجی نهایی',
          badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          cardBorder: 'border-emerald-500/80 dark:border-emerald-600/80 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent',
          markerBg: 'bg-emerald-600 ring-4 ring-emerald-500/20 text-white',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'action':
      default:
        return {
          badgeLabel: '□ اقدام اجرایی',
          badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          cardBorder: 'border-slate-300 dark:border-slate-700 hover:border-blue-400',
          markerBg: 'bg-blue-600 ring-4 ring-blue-500/20 text-white',
          icon: <Layers className="w-4 h-4" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Controls & Progress Bar */}
      <div
        className="glass-card rounded-2xl p-4 sm:p-5 border shadow-sm transition-all"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-surface)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                نمای تایم‌لاین فرایند و پیگیری زنده گام‌ها
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {totalSteps} گام زمانی
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              توالی زمانی انجام اقدامات به همراه امکان ثبت تیک پیشرفت و علامت‌گذاری گام‌ها
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={markAllDone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              title="علامت‌گذاری تمام گام‌ها به عنوان انجام‌شده"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تکمیل همه</span>
            </button>

            {doneCount > 0 && (
              <button
                type="button"
                onClick={resetAllDone}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title="بازنشانی وضعیت گام‌های انجام شده"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span style={{ color: 'var(--text-secondary)' }}>
              پیشرفت اجرا: {doneCount} از {totalSteps} گام تکمیل شد
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {'\u200E' + progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-4 flex-wrap text-xs">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Filter className="w-3 h-3" />
            فیلتر نمایش:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            همه مراحل ({totalSteps})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('decision')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'decision'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            فقط تصمیم‌گیری‌ها ({process.steps.filter((s) => s.stepType === 'decision').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'warning'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            فقط نقاط حساس ({process.steps.filter((s) => s.stepType === 'warning').length})
          </button>
          {doneCount > 0 && doneCount < totalSteps && (
            <button
              type="button"
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'pending'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              فقط باقی‌مانده‌ها ({totalSteps - doneCount})
            </button>
          )}
        </div>
      </div>

      {/* Vertical Connected Timeline */}
      <div className="relative pr-6 sm:pr-8">
        {/* Continuous Connecting Line (positioned on the right in RTL) */}
        <div className="absolute right-3 sm:right-4 top-5 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 rounded-full" />

        <div className="space-y-6">
          {filteredSteps.map((step, idx) => {
            const isDone = Boolean(completedSteps[step.id]);
            const isExpanded = Boolean(expandedSteps[step.id]);
            const visual = getNodeVisuals(step.stepType, isDone);
            const timeEstimate = getStepEstimatedTime(step.orderIndex - 1);

            return (
              <div key={step.id || idx} className="relative group">
                {/* Timeline Node Pin / Marker */}
                <button
                  type="button"
                  onClick={() => toggleStepDone(step.id)}
                  title={isDone ? 'علامت‌گذاری به عنوان انجام‌نشده' : 'علامت‌گذاری به عنوان انجام‌شده'}
                  className={`absolute -right-3.5 sm:-right-4.5 top-5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 shadow-md ${visual.markerBg} hover:scale-110 active:scale-95`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-black font-mono">
                      {'\u200E' + step.orderIndex}
                    </span>
                  )}
                </button>

                {/* Step Card */}
                <div
                  className={`mr-6 sm:mr-8 p-5 sm:p-6 rounded-2xl border transition-all duration-200 shadow-xs ${visual.cardBorder} ${
                    isDone ? 'opacity-90 bg-emerald-50/20 dark:bg-emerald-950/10' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Card Top Row: Status Badges & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${visual.badgeClass}`}>
                        {visual.icon}
                        <span>{visual.badgeLabel}</span>
                      </span>

                      {timeEstimate && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeEstimate}</span>
                        </span>
                      )}

                      {step.stepType === 'decision' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          دارای انشعاب شرطی (بله / خیر)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => toggleStepDone(step.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>انجام شد ✓</span>
                          </>
                        ) : (
                          <span>علامت تیک زدن</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleStepExpanded(step.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={isExpanded ? 'بستن شرح گام' : 'مشاهده شرح کامل گام'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step Title */}
                  <div className="mb-3">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                  </div>

                  {/* Menu Route Breadcrumb */}
                  {step.targetMenuPath && (
                    <div className="mb-3">
                      <MenuPathDisplay path={step.targetMenuPath} variant="interactive" />
                    </div>
                  )}

                  {/* Expandable Step Body */}
                  {isExpanded && (
                    <div className="space-y-4 pt-2 animate-in fade-in duration-150">
                      {/* Detailed narrative and pro-tips */}
                      <div className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                        <StepContentRenderer content={step.contentMarkdown} tips={step.tips} />
                      </div>

                      {/* Copyable Fields */}
                      {step.copyableFields && step.copyableFields.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-500 block mb-2">
                            مقادیر و فیلدهای آماده کپی:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.copyableFields.map((field, fIdx) => {
                              const isCopied = copiedField === field.label;
                              return (
                                <div
                                  key={fIdx}
                                  onClick={() => handleCopy(field.value, field.label)}
                                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 cursor-pointer hover:border-blue-500 transition-colors"
                                  title="کلیک برای کپی مقدار"
                                >
                                  <div className="overflow-hidden">
                                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                                      {field.label}
                                    </span>
                                    <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 truncate block">
                                      {field.value}
                                    </code>
                                  </div>
                                  <span className="p-1 text-slate-400">
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Step Specific Tips */}
                      {step.tips && step.tips.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                          {step.tips.map((tip, tIdx) => (
                            <p key={tIdx} className="flex items-start gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Error Warnings */}
                      {step.errorGuides && step.errorGuides.length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span>این گام دارای {step.errorGuides.length} راهنمای رفع خطا است</span>
                          </span>
                          <span className="text-[11px] underline font-medium">مشاهده در برگه رفع خطا</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
