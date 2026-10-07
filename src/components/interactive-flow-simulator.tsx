'use client';

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  GitBranch, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowLeft, 
  Layers, 
  Sparkles, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export function InteractiveFlowSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [decisionChoice, setDecisionChoice] = useState<'approved' | 'rejected' | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [scratchpadVal, setScratchpadVal] = useState('0019283746');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetSimulator = () => {
    setCurrentStep(1);
    setDecisionChoice(null);
  };

  return (
    <section id="flow-simulator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--accent-border)'
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>پیش‌نمایش تعاملی (Interactive Simulator)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          هسته هوشمند: اجرای زنده فلوچارت و تعامل با گام‌ها
        </h2>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          یک فرایند را لمس کنید! نحوه هدایت گام‌به‌گام، انشعاب‌های شرطی و کپی داده‌های موقت را همین‌جا آزمایش نمایید.
        </p>
      </div>

      {/* Simulator Card */}
      <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Step Nodes Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              مسیر پیشرفت فلوچارت فرایند نمونه (ثبت پرسنل جدید)
            </span>
            <button
              onClick={resetSimulator}
              type="button"
              className="text-xs font-semibold flex items-center gap-1 text-slate-400 hover:text-blue-500 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی شبیه‌ساز</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Step 1 Node */}
            <div 
              onClick={() => setCurrentStep(1)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                currentStep === 1 ? 'ring-2 ring-blue-500 scale-[1.02]' : 'opacity-70'
              }`}
              style={{
                background: currentStep === 1 ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                borderColor: currentStep === 1 ? 'var(--accent-primary)' : 'var(--border-glass)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                  گام ۱
                </span>
                {currentStep > 1 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Layers className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                ورود به پرتال و منوی کارگزینی
              </p>
            </div>

            {/* Step 2 Node */}
            <div 
              onClick={() => setCurrentStep(2)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                currentStep === 2 ? 'ring-2 ring-blue-500 scale-[1.02]' : 'opacity-70'
              }`}
              style={{
                background: currentStep === 2 ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                borderColor: currentStep === 2 ? 'var(--accent-primary)' : 'var(--border-glass)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                  گام ۲
                </span>
                {currentStep > 2 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <FileCheck2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                ثبت اطلاعات هویتی و کپی فیلد
              </p>
            </div>

            {/* Step 3 Node (Decision) */}
            <div 
              onClick={() => setCurrentStep(3)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                currentStep === 3 ? 'ring-2 ring-amber-500 scale-[1.02]' : 'opacity-70'
              }`}
              style={{
                background: currentStep === 3 ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                borderColor: currentStep === 3 ? 'var(--badge-amber-text)' : 'var(--border-glass)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
                  گام ۳ • تصمیم
                </span>
                <GitBranch className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                انشعاب: نوع قرارداد پرسنل
              </p>
            </div>

            {/* Step 4 Node (End) */}
            <div 
              onClick={() => setCurrentStep(4)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                currentStep === 4 ? 'ring-2 ring-emerald-500 scale-[1.02]' : 'opacity-70'
              }`}
              style={{
                background: currentStep === 4 ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                borderColor: currentStep === 4 ? 'var(--badge-emerald-text)' : 'var(--border-glass)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                  گام ۴ • پایان
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                صدور حکم و اتمام فرایند
              </p>
            </div>
          </div>
        </div>

        {/* Active Step Content Simulator Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Workspace */}
          <div className="lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            {currentStep === 1 && (
              <div>
                <span className="text-xs font-bold text-blue-600">گام ۱ از ۴: ورود به سامانه</span>
                <h4 className="text-lg font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>
                  ورود به پورتال منابع انسانی و کلیک روی منوی کارگزینی
                </h4>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  با نام کاربری کارگزینی وارد شوید. از منوی سمت راست مسیر: 
                  <span className="font-bold text-blue-600 mr-1">داشبورد &gt; مدیریت سرمایه انسانی &gt; پرسنل جدید</span>
                  را انتخاب فرمایید.
                </p>
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-medium text-blue-700 dark:text-blue-300">
                  💡 نکته: در صورتی که گزینه را نمی‌بینید، دسترسی نقش شما به ادمین نیاز دارد.
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <span className="text-xs font-bold text-blue-600">گام ۲ از ۴: تکمیل فیلدهای اطلاعاتی</span>
                <h4 className="text-lg font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>
                  ثبت کد ملی و استعلام سوابق بیمه تأمین اجتماعی
                </h4>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  کد ملی پرسنل را در فیلد مربوطه وارد کنید. دکمه کپی زیر به شما اجازه می‌دهد نمونه کد تست را مستقیماً بردارید:
                </p>

                {/* Interactive Copyable Field */}
                <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 mb-4"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)' }}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">نمونه کد ملی تستی:</span>
                    <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {scratchpadVal}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(scratchpadVal)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    style={{
                      background: isCopied ? 'var(--badge-emerald-bg)' : 'var(--bg-surface)',
                      color: isCopied ? 'var(--badge-emerald-text)' : 'var(--text-primary)',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'کپی شد!' : 'کپی مستقیم'}</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <span className="text-xs font-bold text-amber-600">گام ۳ از ۴: نود تصمیم‌گیری و انشعاب فلوچارت</span>
                <h4 className="text-lg font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>
                  نوع قرارداد این پرسنل چیست؟
                </h4>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  بر اساس نوع قرارداد، مسیر محاسبات بیمه و مالیات تغییر خواهد کرد. یکی از دو شاخه را انتخاب کنید:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setDecisionChoice('approved')}
                    className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
                      decisionChoice === 'approved' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 font-bold' : ''
                    }`}
                    style={{ borderColor: 'var(--border-glass)' }}
                  >
                    <span className="text-xs text-blue-600 block mb-1">شاخه الف:</span>
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      قرارداد تمام‌وقت رسمی
                    </span>
                    <p className="text-xs mt-1 text-slate-500">
                      شامل بیمه ۳۰٪ کامل و مزایای رفاهی
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionChoice('rejected')}
                    className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
                      decisionChoice === 'rejected' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 font-bold' : ''
                    }`}
                    style={{ borderColor: 'var(--border-glass)' }}
                  >
                    <span className="text-xs text-amber-600 block mb-1">شاخه ب:</span>
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      قرارداد پروژه‌ای / پاره‌وقت
                    </span>
                    <p className="text-xs mt-1 text-slate-500">
                      کسر ۱۰٪ مالیات مقطوع ماده ۸۶
                    </p>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <span className="text-xs font-bold text-emerald-600">گام ۴ از ۴: پایان موفقیت‌آمیز</span>
                <h4 className="text-lg font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>
                  صدور حکم کارگزینی و اتصال به سیستم‌های اداری
                </h4>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-medium space-y-2 text-emerald-800 dark:text-emerald-200 mb-4">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>فرایند با موفقیت به پایان رسید!</span>
                  </div>
                  <p>• حکم کارگزینی الکترونیک صادر شد.</p>
                  <p>• تیکت تحویل لپ‌تاپ و تجهیزات به واحد فناوری اطلاعات ارسال شد.</p>
                </div>
              </div>
            )}

            {/* Stepper Controller Buttons */}
            <div className="flex items-center justify-between pt-4 border-t mt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
              >
                مرحله قبل
              </button>

              <button
                type="button"
                disabled={currentStep === 4}
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
              >
                <span>مرحله بعد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Scratchpad Mini-Box */}
          <div className="p-6 rounded-2xl border flex flex-col justify-between"
            style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-glass)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>جعبه‌ابزار داده‌های موقت (Scratchpad)</span>
              </div>
              <p className="text-xs leading-relaxed mb-4 text-slate-500">
                اطلاعاتی که حین انجام کار به یاد دارید یا باید کپی پیست کنید:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">
                    کد ملی پرسنل جهت استعلام:
                  </label>
                  <input
                    type="text"
                    value={scratchpadVal}
                    onChange={(e) => setScratchpadVal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">
                    ایمیل سازمانی موقت تولید شده:
                  </label>
                  <div className="p-2.5 rounded-xl border text-xs font-mono truncate"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
                  >
                    user.fanavari@fanavari.ir
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t text-[11px] text-slate-400 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
              قابلیت ذخیره امن خودکار در حافظه مرورگر و سرور سازمانی
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
