'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Process, WorkflowRun, WorkflowStepLog } from '@/types/process';
import { MenuPathDisplay } from './menu-path-display';
import { StepContentRenderer, hasValidStepContent } from './step-content-renderer';
import { 
  Printer, 
  ArrowRight, 
  Clock, 
  Laptop, 
  Building2, 
  Workflow, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle,
  CheckCircle2, 
  GitFork, 
  Layers, 
  ExternalLink,
  FileText,
  Calendar,
  ShieldCheck,
  Award,
  Check,
  Timer,
  MousePointerClick
} from 'lucide-react';

interface ProcessPrintViewProps {
  process: Process;
  initialRun?: WorkflowRun | null;
}

function formatDurationText(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || seconds <= 0) return 'کمتر از ۱ دقیقه';
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (mins === 0) return `${remainingSecs} ثانیه`;
  if (remainingSecs === 0) return `${mins} دقیقه`;
  return `${mins} دقیقه و ${remainingSecs} ثانیه`;
}

function formatDateTimeText(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' ساعت ' +
      d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return String(dateStr);
  }
}

export function ProcessPrintView({ process, initialRun }: ProcessPrintViewProps) {
  // Font scale mode for elderly accessibility / customized reading before printing
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Currently selected execution run (null = blank SOP template checklist)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(initialRun || null);
  const [availableRuns, setAvailableRuns] = useState<WorkflowRun[]>(initialRun ? [initialRun] : []);

  useEffect(() => {
    // Fetch all recorded execution runs for this process so user can toggle between them
    fetch(`/api/processes/${process.slug}/runs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.runs && Array.isArray(data.runs)) {
          setAvailableRuns(data.runs);
          if (initialRun) {
            const matched = data.runs.find((r: WorkflowRun) => r.id === initialRun.id);
            if (matched) setSelectedRun(matched);
          }
        }
      })
      .catch((err) => console.error('Error fetching runs for print view:', err));
  }, [process.slug, initialRun]);

  const handlePrint = () => {
    window.print();
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'decision':
        return { label: 'بررسی و تصمیم‌گیری', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'warning':
        return { label: 'ایست بازرسی حساس', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'end':
        return { label: 'پایان موفقیت‌آمیز', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'گام اجرایی و عملیاتی', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
  };

  const fontSizeClasses = {
    normal: {
      body: 'text-sm sm:text-base leading-relaxed',
      title: 'text-xl sm:text-2xl font-black',
      stepTitle: 'text-lg sm:text-xl font-black',
      meta: 'text-xs sm:text-sm',
    },
    large: {
      body: 'text-base sm:text-lg leading-loose',
      title: 'text-2xl sm:text-3xl font-black',
      stepTitle: 'text-xl sm:text-2xl font-black',
      meta: 'text-sm sm:text-base',
    },
    xlarge: {
      body: 'text-lg sm:text-xl leading-loose',
      title: 'text-3xl sm:text-4xl font-black',
      stepTitle: 'text-2xl sm:text-3xl font-black',
      meta: 'text-base sm:text-lg',
    },
  }[fontSize];

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 selection:bg-blue-100">
      {/* ========================================================================= */}
      {/* Floating Action Bar (Visible only on screen, completely hidden when printing) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Back link */}
          <Link
            href={`/process/${process.slug}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فرایند</span>
          </Link>

          {/* Mode Selector: Blank SOP vs Recorded Official Run */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-2">
            <select
              value={selectedRun?.id || 'blank'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'blank') {
                  setSelectedRun(null);
                } else {
                  const r = availableRuns.find((item) => item.id === val);
                  if (r) setSelectedRun(r);
                }
              }}
              className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer truncate"
              title="انتخاب حالت چاپ سند"
            >
              <option value="blank">📄 فرم استاندارد راهنما (فرم سفید چک‌لیست)</option>
              {availableRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  🏆 گواهی رسمی ISO #{r.runNumber} — {r.operatorName} ({r.status === 'completed' ? 'تکمیل شده' : 'در جریان'})
                </option>
              ))}
            </select>
          </div>

          {/* Center: Font Size Controls for accessibility */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <span className="px-2 text-slate-500">اندازه قلم:</span>
            <button
              onClick={() => setFontSize('normal')}
              type="button"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                fontSize === 'normal' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              استاندارد
            </button>
            <button
              onClick={() => setFontSize('large')}
              type="button"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                fontSize === 'large' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              بزرگ
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              type="button"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                fontSize === 'xlarge' ? 'bg-white text-blue-600 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              خیلی بزرگ
            </button>
          </div>

          {/* Primary Print Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
              title="چاپ سند یا ذخیره فایل PDF (کلید میانبر Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ سند یا خروجی PDF</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-700 text-white/90" dir="ltr">
                Ctrl+P
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Printable Sheet Container (Styled for A4 paper and high screen clarity)   */}
      {/* ========================================================================= */}
      <main className="max-w-4xl mx-auto my-6 sm:my-10 print:my-0 print:max-w-none print:w-full px-3 sm:px-6 print:p-0">
        <article className="bg-white rounded-3xl border border-slate-300 shadow-xl print:border-none print:shadow-none p-6 sm:p-12 print:p-0 relative">
          
          {/* Formal Document Top Banner */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Right: Organization Identity */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm print:border print:border-slate-800">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">سامانه جامع فناوری و فرایندها</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {selectedRun 
                      ? 'گواهینامه رسمی انطباق فرایند و کارنامه ممیزی اجرایی (ISO 9001:2015)' 
                      : 'راهنمای رسمی و گام‌به‌گام اجرایی (فرم استاندارد عملیاتی)'}
                  </p>
                </div>
              </div>

              {/* Center: Document Title */}
              <div className="text-center sm:text-right">
                <span className="inline-block text-xs font-black uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-mono" dir="ltr">
                  {selectedRun ? `RUN-ISO-#${selectedRun.runNumber}` : `PROC-${process.id.slice(0, 8)}`}
                </span>
              </div>

              {/* Left: Metadata Box */}
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-right self-stretch sm:self-auto min-w-[160px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">تاریخ چاپ:</span>
                  <span className="font-bold text-slate-900 font-mono" dir="ltr">
                    {new Date().toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">نوع سند:</span>
                  <span className="font-bold text-slate-900">
                    {selectedRun ? 'کارنامه ممیزی' : 'راهنمای عملیاتی'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* OFFICIAL RUN ATTESTATION SEAL & METRICS BREAKDOWN (When Run is Selected)   */}
          {/* ========================================================================= */}
          {selectedRun && (
            <div className="mb-8 p-5 sm:p-6 rounded-2xl border-2 border-emerald-600 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent text-slate-900 print:border-black print:bg-white space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-emerald-600/30 print:border-black">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 print:border print:border-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-600 text-white uppercase tracking-wider font-mono" dir="ltr">
                        OFFICIAL ISO 9001 RUN #{selectedRun.runNumber}
                      </span>
                      <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100 print:text-black">
                        {selectedRun.title}
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-200 print:text-slate-700 mt-0.5">
                      ثبت شده در سامانه پایش عملیاتی • انطباق کامل مراحل با شیوه‌نامه اجرایی
                    </p>
                  </div>
                </div>

                <div className="text-left font-mono text-xs text-slate-600 print:text-black" dir="ltr">
                  UUID: {selectedRun.id}
                </div>
              </div>

              {/* Execution Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-emerald-600/20 print:border-slate-400">
                  <span className="text-slate-500 block mb-1">مجری عملیات:</span>
                  <span className="font-black text-slate-900 block truncate">
                    {selectedRun.operatorName}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {selectedRun.operatorRole || 'اپراتور سازمانی'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-emerald-600/20 print:border-slate-400">
                  <span className="text-slate-500 block mb-1">مدت زمان اجرا:</span>
                  <span className="font-black text-blue-700 block font-mono" dir="ltr">
                    ⏱️ {formatDurationText(selectedRun.totalDurationSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">پایش مستمر زمان</span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-emerald-600/20 print:border-slate-400">
                  <span className="text-slate-500 block mb-1">پیشرفت مراحل:</span>
                  <span className="font-black text-emerald-700 block font-mono" dir="ltr">
                    {selectedRun.completedStepsCount} / {selectedRun.totalStepsCount} (100%)
                  </span>
                  <span className="text-[10px] text-slate-400 block">تکمیل ۱۰۰٪ گام‌ها</span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 border border-emerald-600/20 print:border-slate-400">
                  <span className="text-slate-500 block mb-1">وضعیت ممیزی:</span>
                  <span className="font-black text-emerald-700 block">
                    {selectedRun.supervisorApprovalStatus === 'approved' ? 'تایید نهایی ناظر کیفی' : 'ثبت کامل و معتبر'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedRun.supervisorName ? `ناظر: ${selectedRun.supervisorName}` : 'آماده بایگانی'}
                  </span>
                </div>
              </div>

              {/* Start & End Timestamps */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 print:text-black gap-2 pt-1 border-t border-emerald-600/20 print:border-slate-300">
                <div>
                  <span className="font-bold">آغاز عملیات: </span>
                  <span className="font-mono">{formatDateTimeText(selectedRun.startedAt)}</span>
                </div>
                <div>
                  <span className="font-bold">پایان عملیات: </span>
                  <span className="font-mono">{formatDateTimeText(selectedRun.completedAt || selectedRun.startedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Process Title and Summary Section */}
          <div className="mb-8">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {process.scope === 'software' ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-black bg-purple-100 text-purple-900 border border-purple-300">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>راهنمای کاربری نرم‌افزار</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-black bg-blue-100 text-blue-900 border border-blue-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>فرایند سازمانی و اداری</span>
                </span>
              )}

              <span className="text-xs px-3 py-1 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-300">
                بخش / واحد: {process.departmentName}
              </span>

              <span className="text-xs px-3 py-1 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-300">
                سامانه هدف: {process.targetSystem}
              </span>

              <span className="text-xs px-3 py-1 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>
                  زمان تخمینی استاندارد:{' '}
                  <span dir="ltr" className="font-mono font-bold">
                    {process.estimatedMinutes}
                  </span>{' '}
                  دقیقه
                </span>
              </span>

              <span className="text-xs px-3 py-1 rounded-lg font-bold bg-blue-50 text-blue-900 border border-blue-200">
                تعداد کل مراحل:{' '}
                <span dir="ltr" className="font-mono font-bold">
                  {process.steps.length}
                </span>{' '}
                مرحله
              </span>
            </div>

            <h1 className={`${fontSizeClasses.title} text-slate-950 leading-tight mb-4`}>
              {process.title}
            </h1>

            {/* Operating Schedule / Timeline Banner */}
            {process.schedule && (
              <div className="mb-4 p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-amber-600 print:text-black shrink-0" />
                  <div>
                    <span className="text-xs font-black text-amber-900 print:text-black block">گاه‌شمار اجرایی و بازه مجاز انجام فرایند:</span>
                    <span className="text-sm font-bold text-amber-950 print:text-black">
                      {process.schedule.timeframeLabel || `از ${process.schedule.startDay} الی ${process.schedule.endDay} ${process.schedule.month} ماه`}
                      {process.schedule.deadlineDays && (
                        <span className="mr-2 text-xs font-semibold text-amber-800 print:text-black">
                          (مهلت اقدام: <span dir="ltr" className="font-mono font-bold">{process.schedule.deadlineDays}</span> روز)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {process.schedule.isMandatory && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black self-start sm:self-auto shrink-0 shadow-xs print:bg-black print:text-white">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>الزام قانونی: مهلت قطعی و الزامی</span>
                  </div>
                )}
              </div>
            )}

            {process.description && process.description.trim() && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-800">
                <h4 className="text-xs font-black text-slate-600 mb-1.5">موضوع و شرح فرایند:</h4>
                <p className={`${fontSizeClasses.body} whitespace-pre-line font-medium leading-relaxed`}>
                  {process.description.trim()}
                </p>
              </div>
            )}

            {process.targetUrl && process.targetUrl.trim() && (
              <div className="mt-3 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <span className="font-bold">نشانی سامانه جهت ورود مستقیم:</span>
                <span className="font-mono text-blue-700 underline" dir="ltr">
                  {process.targetUrl.trim()}
                </span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* Complete Sequential Steps List (1 to N, all fully expanded)             */}
          {/* ========================================================================= */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>مراحل گام‌به‌گام و تاییدات اجرایی</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {selectedRun ? 'ثبت ممیزی تاییدات و زمان‌بندی گام‌ها' : 'لطفاً مراحل را دقیقا به ترتیب زیر انجام دهید'}
              </span>
            </div>

            {process.steps.map((step, idx) => {
              const typeInfo = getStepTypeLabel(step.stepType);
              const hasContent = hasValidStepContent(step.contentMarkdown);
              const validCopyableFields = (step.copyableFields || []).filter(
                (f) => (f.label && f.label.trim()) || (f.value && f.value.trim())
              );
              const validTips = (step.tips || []).filter((t) => t && t.trim().length > 0);
              const validErrorGuides = (step.errorGuides || []).filter(
                (e) => (e.errorTitle && e.errorTitle.trim()) || (e.solution && e.solution.trim())
              );

              // Check if there is an execution log recorded for this step
              const stepLog = selectedRun?.stepLogs?.find(
                (l) => l.stepKey === step.stepKey || l.stepOrder === step.orderIndex
              );
              const isStepExecuted = stepLog?.status === 'completed';

              return (
                <section
                  key={step.id || idx}
                  className="rounded-2xl border-2 border-slate-300 p-5 sm:p-7 bg-white print:border-slate-800 print:break-inside-avoid shadow-xs relative"
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  {/* Step Top Bar: Step Number + Title + Step Type + Verification Stamp */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-start gap-3.5">
                      {/* Step Number Round Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm print:border print:border-black font-mono">
                        {step.orderIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-700">
                            مرحله {step.orderIndex} از {process.steps.length}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <h2 className={`${fontSizeClasses.stepTitle} text-slate-950`}>
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    {/* Step Completion Verification Box / Formal Stamp */}
                    {selectedRun ? (
                      <div className={`flex flex-col items-end gap-1 px-3.5 py-2 rounded-xl border text-xs font-bold self-start sm:self-center shrink-0 ${
                        isStepExecuted
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 print:border-black print:bg-white'
                          : 'border-slate-300 bg-slate-50 text-slate-600'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 print:text-black" />
                          <span>تایید و انجام رسمی ✓</span>
                        </div>
                        {stepLog?.completedAt && (
                          <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                            {new Date(stepLog.completedAt).toLocaleTimeString('fa-IR')}
                          </span>
                        )}
                        {stepLog?.durationSeconds ? (
                          <span className="text-[10px] text-blue-700 font-mono" dir="ltr">
                            ⏱️ {stepLog.durationSeconds}s
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 print:border-slate-800 bg-slate-50 print:bg-white text-xs font-bold text-slate-700 self-start sm:self-center shrink-0">
                        <span className="w-4 h-4 rounded border-2 border-slate-400 print:border-black inline-block bg-white" />
                        <span>تایید انجام مرحله</span>
                      </div>
                    )}
                  </div>

                  {/* Mandatory ISO Checkpoint Stamp */}
                  {(step.stepType === 'warning' || stepLog?.isCheckpoint) && (
                    <div className="my-3 p-3 rounded-xl border-2 border-rose-500/40 bg-rose-50/80 text-rose-950 print:border-black print:bg-white flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 text-rose-600 print:text-black shrink-0" />
                        <span>ایست بازرسی الزامی کنترل کیفیت (ISO 9001 Checkpoint):</span>
                        <span className="font-normal text-rose-900 print:text-black">
                          تایید صحت اجرای این گام ثبت و ممهور گردید.
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-rose-600 text-white print:bg-black" dir="ltr">
                        CHECKPOINT VERIFIED
                      </span>
                    </div>
                  )}

                  {/* Operator Step Notes Recorded during Run */}
                  {stepLog?.operatorNotes && (
                    <div className="my-3 p-3 rounded-xl border border-blue-400/40 bg-blue-50/70 text-blue-950 print:border-black print:bg-white text-xs">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-900 print:text-black">
                        <FileText className="w-3.5 h-3.5 text-blue-600 print:text-black" />
                        <span>یادداشت و کد رهگیری مستندات مجری:</span>
                      </div>
                      <p className="font-medium text-slate-800 print:text-black">
                        {stepLog.operatorNotes}
                      </p>
                    </div>
                  )}

                  {/* Menu Access Path / Software Route (Boxed Breadcrumbs) */}
                  {step.targetMenuPath && step.targetMenuPath.trim() && (
                    <MenuPathDisplay path={step.targetMenuPath.trim()} variant="print" />
                  )}

                  {/* Step Narrative Instructions & Callouts */}
                  {hasContent && (
                    <div className="my-4">
                      <h5 className="text-xs font-black text-slate-600 mb-1.5">
                        اقدامات لازم و توضیحات این مرحله:
                      </h5>
                      <div className={`${fontSizeClasses.body} text-slate-900 font-medium leading-relaxed`}>
                        <StepContentRenderer 
                          content={step.contentMarkdown} 
                          isPrintView={true}
                        />
                      </div>
                    </div>
                  )}

                  {/* Copyable Fields / Sample Input Data Table */}
                  {validCopyableFields.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-slate-300 bg-slate-50">
                      <h5 className="text-xs font-black text-slate-900 mb-2.5 flex items-center gap-1.5">
                        <span>اطلاعات و مقادیر موردنیاز جهت ورود:</span>
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-right border-collapse">
                          <thead>
                            <tr className="border-b border-slate-300 text-slate-600">
                              <th className="py-2 px-3 font-black">عنوان فیلد</th>
                              <th className="py-2 px-3 font-black">مقدار / نمونه ورودی</th>
                              {validCopyableFields.some((f) => f.description && f.description.trim()) && (
                                <th className="py-2 px-3 font-black">توضیحات</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {validCopyableFields.map((field, fIdx) => (
                              <tr key={fIdx} className="border-b border-slate-200 last:border-none">
                                <td className="py-2 px-3 font-bold text-slate-800">{field.label}</td>
                                <td className="py-2 px-3 font-mono font-black text-blue-700" dir="ltr">
                                  {field.value}
                                </td>
                                {validCopyableFields.some((f) => f.description && f.description.trim()) && (
                                  <td className="py-2 px-3 text-slate-600">{field.description || '—'}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Micro UI Click Elements & Action Buttons (Printable Grid) */}
                  {step.uiSnippets && step.uiSnippets.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-slate-300 bg-slate-50 print:bg-white print:border-black">
                      <h5 className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-slate-700 print:text-black" />
                        <span>دکمه‌ها و گزینه‌های تصویری برای کلیک در سامانه:</span>
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {step.uiSnippets.map((snippet, sIdx) => (
                          <div key={sIdx} className="p-2 rounded-lg border border-slate-300 bg-white print:border-black flex items-center gap-2">
                            <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 p-0.5 flex items-center justify-center shrink-0">
                              <img src={snippet.iconUrl} alt={snippet.title} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate">{snippet.title}</span>
                              {snippet.badgeText && (
                                <span className="text-[9px] font-mono font-bold text-slate-600 block" dir="ltr">{snippet.badgeText}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Tips & Advice */}
                  {validTips.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950">
                      <div className="flex items-center gap-1.5 text-xs font-black mb-2 text-amber-900">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>نکات مهم و راهنمایی اجرایی:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm font-semibold pr-2">
                        {validTips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error Guides & Rapid Solutions */}
                  {validErrorGuides.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950">
                      <div className="flex items-center gap-1.5 text-xs font-black mb-2.5 text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>خطاهای احتمالی این مرحله و نحوه برطرف کردن:</span>
                      </div>
                      <div className="space-y-3">
                        {validErrorGuides.map((err) => (
                          <div key={err.id} className="p-3 bg-white rounded-lg border border-rose-200 text-xs sm:text-sm">
                            <div className="flex items-center justify-between gap-2 font-black text-rose-800 mb-1">
                              <span>کد خطا [{err.errorCode}]: {err.errorTitle}</span>
                              {err.escalationContact && (
                                <span className="text-[11px] font-medium text-slate-500">
                                  واحد پیگیری: {err.escalationContact}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-800 font-medium">
                              <span className="font-bold text-slate-900">راه‌حل: </span>
                              <span>{err.solution}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* Formal Document Sign-off / Print Footer                                    */}
          {/* ========================================================================= */}
          <div className="mt-12 pt-6 border-t-2 border-slate-800 text-xs text-slate-600">
            {selectedRun ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {/* 1. Official Operator Stamp */}
                <div className="p-4 border-2 border-emerald-600/40 rounded-2xl bg-emerald-50/30 print:border-black print:bg-white space-y-2">
                  <span className="font-bold text-emerald-950 print:text-black block border-b pb-1">
                    ۱. مجری رسمی عملیات:
                  </span>
                  <div className="text-slate-800 font-bold">
                    {selectedRun.operatorName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    سمت: {selectedRun.operatorRole || 'اپراتور رسمی'}
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-600 text-white print:border print:border-black print:text-black print:bg-white" dir="ltr">
                      ✓ SIGN-OP-{selectedRun.id.slice(0, 6)}
                    </span>
                  </div>
                </div>

                {/* 2. Quality Supervisor Approval */}
                <div className="p-4 border-2 border-blue-600/40 rounded-2xl bg-blue-50/30 print:border-black print:bg-white space-y-2">
                  <span className="font-bold text-blue-950 print:text-black block border-b pb-1">
                    ۲. ناظر کنترل کیفیت (QA):
                  </span>
                  {selectedRun.supervisorApprovalStatus === 'approved' ? (
                    <>
                      <div className="text-slate-800 font-bold">
                        {selectedRun.supervisorName}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold">
                        تایید ممیزی کیفیت ISO 9001
                      </div>
                      <div className="pt-2">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-600 text-white print:border print:border-black print:text-black print:bg-white" dir="ltr">
                          ✓ QA-APPROVED
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-500">امضا و تایید ناظر:</div>
                      <div className="text-slate-400 pt-4">...................................................</div>
                    </>
                  )}
                </div>

                {/* 3. Standards Compliance Certificate Stamp */}
                <div className="p-4 border-2 border-slate-300 rounded-2xl bg-slate-50/50 print:border-black print:bg-white space-y-2">
                  <span className="font-bold text-slate-800 print:text-black block border-b pb-1">
                    ۳. واحد تعالی و تضمین استاندارد:
                  </span>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    منطبق با سیستم مدیریت کیفیت <strong>ISO 9001:2015</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                    VERIFIED HASH: {selectedRun.id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-3 border border-slate-300 rounded-xl">
                  <span className="font-bold text-slate-700 block mb-6">نام و امضای مجری فرایند:</span>
                  <span className="text-slate-400">...................................................</span>
                </div>
                <div className="p-3 border border-slate-300 rounded-xl">
                  <span className="font-bold text-slate-700 block mb-6">تاریخ انجام اقدامات:</span>
                  <span className="text-slate-400">...................................................</span>
                </div>
                <div className="p-3 border border-slate-300 rounded-xl">
                  <span className="font-bold text-slate-700 block mb-6">تایید و بازبینی مسئول واحد:</span>
                  <span className="text-slate-400">...................................................</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 pt-2 border-t border-slate-200">
              <p>این سند راهنما به‌صورت اختصاصی و جامع جهت اجرای دقیق مراحل تدوین شده است.</p>
              <p className="font-bold text-slate-700">سامانه فناوری • نسخه چاپی رسمی</p>
            </div>
          </div>

        </article>
      </main>

      {/* Global Print Optimization Rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );
}
