'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Process } from '@/types/process';
import { 
  Printer, 
  ArrowRight, 
  Clock, 
  Laptop, 
  Building2, 
  Workflow, 
  Navigation, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  GitFork, 
  Layers, 
  ExternalLink,
  ZoomIn,
  ZoomOut,
  FileText,
  Calendar
} from 'lucide-react';

interface ProcessPrintViewProps {
  process: Process;
}

export function ProcessPrintView({ process }: ProcessPrintViewProps) {
  // Font scale mode for elderly accessibility / customized reading before printing
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const handlePrint = () => {
    window.print();
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'decision':
        return { label: 'بررسی و تصمیم‌گیری', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'warning':
        return { label: 'هشدار و دقت ویژه', color: 'bg-rose-100 text-rose-900 border-rose-300' };
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Back link */}
          <Link
            href={`/process/${process.slug}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فرایند</span>
          </Link>

          {/* Center: Font Size Controls for accessibility */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 p-1 rounded-xl border border-slate-200">
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
              بزرگ (خوانا)
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
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
              title="چاپ سند یا ذخیره فایل PDF (کلید میانبر Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ سند یا خروجی PDF</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-700 text-white/90">
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
        <article className="bg-white rounded-3xl border border-slate-300 shadow-xl print:border-none print:shadow-none p-6 sm:p-12 print:p-0">
          
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
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">راهنمای رسمی و گام‌به‌گام اجرایی</p>
                </div>
              </div>

              {/* Center: Document Title */}
              <div className="text-center sm:text-right">
                <span className="inline-block text-xs font-black uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                  شناسه فرایند: {process.id.slice(0, 8)}
                </span>
              </div>

              {/* Left: Metadata Box */}
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-right self-stretch sm:self-auto min-w-[160px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">تاریخ چاپ:</span>
                  <span className="font-bold text-slate-900" dir="ltr">
                    {'\u200E' + new Date().toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">نسخه مستند:</span>
                  <span className="font-bold text-slate-900">۱.۰ (معتبر)</span>
                </div>
              </div>
            </div>
          </div>

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
                <span>زمان تخمینی: {'\u200E' + process.estimatedMinutes} دقیقه</span>
              </span>

              <span className="text-xs px-3 py-1 rounded-lg font-bold bg-blue-50 text-blue-900 border border-blue-200">
                تعداد مراحل: {'\u200E' + process.steps.length} مرحله
              </span>
            </div>

            <h1 className={`${fontSizeClasses.title} text-slate-950 leading-tight mb-4`}>
              {process.title}
            </h1>

            {process.description && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-800">
                <h4 className="text-xs font-black text-slate-600 mb-1.5">موضوع و شرح فرایند:</h4>
                <p className={`${fontSizeClasses.body} whitespace-pre-line font-medium leading-relaxed`}>
                  {process.description}
                </p>
              </div>
            )}

            {process.targetUrl && (
              <div className="mt-3 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <span className="font-bold">نشانی سامانه جهت ورود مستقیم:</span>
                <span className="font-mono text-blue-700 underline" dir="ltr">
                  {process.targetUrl}
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
                <span>مراحل گام‌به‌گام اجرای فرایند</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                لطفاً مراحل را دقیقا به ترتیب زیر انجام دهید
              </span>
            </div>

            {process.steps.map((step, idx) => {
              const typeInfo = getStepTypeLabel(step.stepType);

              return (
                <section
                  key={step.id || idx}
                  className="rounded-2xl border-2 border-slate-300 p-5 sm:p-7 bg-white print:border-slate-800 print:break-inside-avoid shadow-xs"
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  {/* Step Top Bar: Step Number + Title + Step Type */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-start gap-3.5">
                      {/* Step Number Round Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm print:border print:border-black">
                        {'\u200E' + step.orderIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-700">
                            مرحله {'\u200E' + step.orderIndex} از {'\u200E' + process.steps.length}
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
                  </div>

                  {/* Menu Access Path / Software Route (High-contrast breadcrumb) */}
                  {step.targetMenuPath && (
                    <div className="my-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-blue-950 font-bold">
                      <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>مسیر منو / کلیک در سامانه:</span>
                      <span className="font-mono text-blue-900 bg-white px-2.5 py-0.5 rounded-md border border-blue-200 shadow-xs">
                        {step.targetMenuPath}
                      </span>
                    </div>
                  )}

                  {/* Step Narrative Instructions */}
                  <div className="my-4">
                    <h5 className="text-xs font-black text-slate-500 mb-1.5">اقدامات لازم در این مرحله:</h5>
                    <div className={`${fontSizeClasses.body} text-slate-900 font-medium leading-relaxed whitespace-pre-line`}>
                      {step.contentMarkdown}
                    </div>
                  </div>

                  {/* Copyable Fields / Sample Input Data Table */}
                  {step.copyableFields && step.copyableFields.length > 0 && (
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
                              {step.copyableFields.some(f => f.description) && (
                                <th className="py-2 px-3 font-black">توضیحات</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {step.copyableFields.map((field, fIdx) => (
                              <tr key={fIdx} className="border-b border-slate-200 last:border-none">
                                <td className="py-2 px-3 font-bold text-slate-800">{field.label}</td>
                                <td className="py-2 px-3 font-mono font-black text-blue-700" dir="ltr">
                                  {field.value}
                                </td>
                                {step.copyableFields?.some(f => f.description) && (
                                  <td className="py-2 px-3 text-slate-600">{field.description || '—'}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Important Tips & Advice */}
                  {step.tips && step.tips.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950">
                      <div className="flex items-center gap-1.5 text-xs font-black mb-2 text-amber-900">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>نکات مهم و راهنمایی اجرایی:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm font-semibold pr-2">
                        {step.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error Guides & Rapid Solutions */}
                  {step.errorGuides && step.errorGuides.length > 0 && (
                    <div className="my-4 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950">
                      <div className="flex items-center gap-1.5 text-xs font-black mb-2.5 text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>خطاهای احتمالی این مرحله و نحوه برطرف کردن:</span>
                      </div>
                      <div className="space-y-3">
                        {step.errorGuides.map((err) => (
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 pt-2 border-t border-slate-200">
              <p>این سند راهنما به‌صورت اختصاصی و جامع جهت اجرای دقیق مراحل تدوین شده است.</p>
              <p className="font-bold text-slate-700">سامانه فناوری • نسخه چاپی رسمی</p>
            </div>
          </div>

        </article>
      </main>
    </div>
  );
}
