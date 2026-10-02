'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessStep } from '@/types/process';
import Link from 'next/link';
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
  Workflow
} from 'lucide-react';

interface ProcessDetailViewProps {
  process: Process;
}

export function ProcessDetailView({ process }: ProcessDetailViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'flow' | 'errors' | 'scratchpad'>('flow');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scratchpad state with localStorage
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`fanavari-scratchpad-${process.id}`);
    if (saved) {
      setScratchpadNote(saved);
    }
  }, [process.id]);

  const currentStep: ProcessStep | undefined = process.steps[activeStepIndex];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveScratchpad = () => {
    localStorage.setItem(`fanavari-scratchpad-${process.id}`, scratchpadNote);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const allErrors = process.steps.flatMap(step => 
    (step.errorGuides || []).map(err => ({ ...err, stepTitle: step.title, stepIndex: step.orderIndex }))
  );

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

            <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {process.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
            <button
              onClick={handleShare}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              title="کپی لینک مستقیم این فرایند"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              title="چاپ یا ذخیره نسخه PDF"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / PDF</span>
            </button>

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
          <span>نقشه فلوچارت و اجرای گام‌به‌گام ({process.totalSteps})</span>
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

      {/* Tab 1: Flowchart & Step Walkthrough */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Interactive Flow Stepper Nodes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              مسیر دیاگرام فلوچارت (انتخاب گام):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {process.steps.map((step, idx) => {
                const isSelected = idx === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                      isSelected ? 'shadow-md scale-[1.02] ring-2 ring-blue-500' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      background: isSelected ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-glass)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        گام {step.orderIndex}
                      </span>
                      {step.stepType === 'decision' ? (
                        <span title="نود تصمیم‌گیری"><GitFork className="w-4 h-4 text-amber-500" /></span>
                      ) : step.stepType === 'end' ? (
                        <span title="پایان موفق"><CheckCircle className="w-4 h-4 text-emerald-500" /></span>
                      ) : (
                        <span title="نود اقدام"><Layers className="w-4 h-4 text-blue-500" /></span>
                      )}
                    </div>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Dedicated Card */}
          {currentStep && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border shadow-lg transition-all"
              style={{ borderColor: 'var(--border-glass)' }}
            >
              {/* Step Subheader */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <span className="text-xs font-bold text-blue-600">
                    مرحله {currentStep.orderIndex} از {process.totalSteps}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                    {currentStep.title}
                  </h2>
                </div>

                {currentStep.targetMenuPath && (
                  <div className="text-xs px-3.5 py-2 rounded-xl font-medium"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
                  >
                    <span className="font-bold ml-1.5">مسیر کلیک در نرم‌افزار/سامانه:</span>
                    <span className="font-mono">{currentStep.targetMenuPath}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-sm sm:text-base font-medium leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {currentStep.contentMarkdown}
              </div>

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
                        <p className="text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">راه‌حل رفع خطا: </span>
                          {err.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
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

                <button
                  type="button"
                  disabled={activeStepIndex === process.steps.length - 1}
                  onClick={() => setActiveStepIndex(prev => Math.min(process.steps.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
                  style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
                >
                  <span>گام بعدی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Global Error Matrix */}
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
                  <p>
                    <span className="font-bold text-slate-500 ml-1">علت بروز:</span>
                    {err.cause}
                  </p>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
    </div>
  );
}
