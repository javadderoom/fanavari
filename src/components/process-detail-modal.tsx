'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Process, ProcessStep } from '@/types/process';
import { MenuPathDisplay } from './menu-path-display';
import { 
  X, 
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
  Printer
} from 'lucide-react';

interface ProcessDetailModalProps {
  process: Process | null;
  initialStepIndex?: number;
  onClose: () => void;
}

export function ProcessDetailModal({ process, initialStepIndex = 0, onClose }: ProcessDetailModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(initialStepIndex);
  const [activeTab, setActiveTab] = useState<'flow' | 'errors' | 'scratchpad'>('flow');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Scratchpad temporary note state with localStorage persistence
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    if (process) {
      setActiveStepIndex(initialStepIndex || 0);
      const saved = localStorage.getItem(`fanavari-scratchpad-${process.id}`);
      if (saved) {
        setScratchpadNote(saved);
      } else {
        setScratchpadNote('');
      }
    }
  }, [process, initialStepIndex]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!process) return null;

  const currentStep: ProcessStep | undefined = process.steps[activeStepIndex];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveScratchpad = () => {
    localStorage.setItem(`fanavari-scratchpad-${process.id}`, scratchpadNote);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Collect all errors across all steps for the error matrix tab
  const allErrors = process.steps.flatMap(step => 
    (step.errorGuides || []).map(err => ({ ...err, stepTitle: step.title, stepIndex: step.orderIndex }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden glass-panel-strong z-10 transition-all shadow-2xl animate-in zoom-in-95"
        style={{
          borderColor: 'var(--border-glass)',
          background: 'var(--bg-glass-strong)',
        }}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b flex items-start justify-between gap-4"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
              >
                {process.departmentName}
              </span>
              <span className="text-xs flex items-center gap-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3.5 h-3.5" />
                زمان تخمینی: {process.estimatedMinutes} دقیقه
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                سامانه: {process.targetSystem}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
              {process.title}
            </h2>
            {process.description && (
              <p className="text-xs sm:text-sm mt-1.5 font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                {process.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/process/${process.slug}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
              title="مشاهده نسخه چاپی رسمی، خوانا و بدون منو (A4 / PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">نسخه چاپی / PDF</span>
            </Link>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="بستن پنجره (Esc)"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 border-b flex items-center gap-3 text-xs sm:text-sm font-bold overflow-x-auto"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-surface)' }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'flow' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: activeTab === 'flow' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'flow' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Layers className="w-4 h-4" />
            <span>نقشه فلوچارت و مراحل ({process.totalSteps})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'errors' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: activeTab === 'errors' ? 'var(--badge-rose-text)' : 'transparent',
              color: activeTab === 'errors' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>راهنمای رفع خطاها ({allErrors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scratchpad')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'scratchpad' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: activeTab === 'scratchpad' ? 'var(--badge-amber-text)' : 'transparent',
              color: activeTab === 'scratchpad' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <StickyNote className="w-4 h-4" />
            <span>جعبه‌ابزار و یادداشت موقت</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'flow' && (
            <div className="space-y-6">
              {/* Flowchart Node Stepper Pills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  مسیر فلوچارت (انتخاب گام جهت مشاهده جزئیات):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {process.steps.map((step, idx) => {
                    const isSelected = idx === activeStepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                          isSelected ? 'shadow-md scale-[1.02]' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          background: isSelected ? 'var(--bg-surface)' : 'var(--bg-glass-card)',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-glass)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            گام {step.orderIndex}
                          </span>
                          {step.stepType === 'decision' ? (
                            <span title="نود تصمیم‌گیری و انشعاب"><GitFork className="w-3.5 h-3.5 text-amber-500" /></span>
                          ) : step.stepType === 'end' ? (
                            <span title="نود خاتمه موفق"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /></span>
                          ) : (
                            <span title="نود اقدام"><Layers className="w-3.5 h-3.5 text-blue-500" /></span>
                          )}
                        </div>
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {step.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Step Details Card */}
              {currentStep && (
                <div className="p-5 rounded-2xl border transition-all"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                >
                  {/* Step Header */}
                  <div className="pb-3 mb-4 border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="text-xs font-bold text-blue-600">
                      جزئیات گام {currentStep.orderIndex} از {process.totalSteps}
                    </span>
                    <h3 className="text-lg font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {currentStep.title}
                    </h3>
                  </div>

                  {currentStep.targetMenuPath && (
                    <div className="mb-4">
                      <MenuPathDisplay path={currentStep.targetMenuPath} variant="modal" />
                    </div>
                  )}

                  {/* Step Markdown / Instructions */}
                  <div className="text-sm font-medium leading-relaxed mb-5 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.contentMarkdown}
                  </div>

                  {/* Copyable Fields Helper (High Productivity!) */}
                  {currentStep.copyableFields && currentStep.copyableFields.length > 0 && (
                    <div className="mb-5 p-4 rounded-xl"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                    >
                      <h5 className="text-xs font-bold mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        فیلدهای پرکاربرد این مرحله (کپی مستقیم با یک کلیک):
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentStep.copyableFields.map((field, fIdx) => {
                          const isCopied = copiedField === field.label;
                          return (
                            <div 
                              key={fIdx}
                              onClick={() => handleCopy(field.value, field.label)}
                              className="p-2.5 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-blue-500"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                              title="کلیک برای کپی در کلیپ‌بورد"
                            >
                              <div className="overflow-hidden">
                                <span className="block text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                  {field.label}
                                </span>
                                <code className="text-xs font-mono font-bold truncate block" style={{ color: 'var(--accent-primary)' }}>
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

                  {/* Tips & Hints */}
                  {currentStep.tips && currentStep.tips.length > 0 && (
                    <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5"
                      style={{ background: 'var(--badge-amber-bg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs font-medium space-y-1" style={{ color: 'var(--badge-amber-text)' }}>
                        {currentStep.tips.map((tip, tIdx) => (
                          <p key={tIdx}>• {tip}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Errors */}
                  {currentStep.errorGuides && currentStep.errorGuides.length > 0 && (
                    <div className="p-4 rounded-xl border"
                      style={{ background: 'var(--badge-rose-bg)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <h5 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--badge-rose-text)' }}>
                        <AlertTriangle className="w-4 h-4" />
                        خطاهای احتمالی این گام:
                      </h5>
                      <div className="space-y-2">
                        {currentStep.errorGuides.map((err) => (
                          <div key={err.id} className="text-xs p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-red-200 dark:border-red-900/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-red-600 dark:text-red-400">
                                [{err.errorCode}] {err.errorTitle}
                              </span>
                              {err.escalationContact && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  ارجاع به: {err.escalationContact}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                              <span className="font-semibold">راه‌حل: </span>
                              {err.solution}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Navigation Buttons */}
                  <div className="mt-5 flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      type="button"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>گام قبلی</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeStepIndex === process.steps.length - 1}
                      onClick={() => setActiveStepIndex(prev => Math.min(process.steps.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer"
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

          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: 'var(--badge-rose-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <div>
                  <h4 className="text-sm font-black" style={{ color: 'var(--badge-rose-text)' }}>
                    ماتریس جامع عیب‌یابی و کدهای خطای فرایند
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    تمامی ارورها و شرایط پیش‌بینی‌نشده این فرایند با راهکارهای دقیق گام‌به‌گام
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                  {allErrors.length} راهنمای خطا
                </span>
              </div>

              {allErrors.map((err) => (
                <div key={err.id} className="p-4 rounded-2xl border transition-all"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {err.errorCode}
                      </span>
                      <h5 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {err.errorTitle}
                      </h5>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      مربوط به گام {err.stepIndex}: {err.stepTitle}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <p className="whitespace-pre-line">
                      <span className="font-bold text-slate-500 ml-1">علت وقوع:</span>
                      {err.cause}
                    </p>
                    <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">راهکار رفع خطا:</span>
                      {err.solution}
                    </p>
                  </div>

                  {err.escalationContact && (
                    <div className="mt-3 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <span>واحد پشتیبان جهت پیگیری:</span>
                      <span className="text-blue-500">{err.escalationContact}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scratchpad' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl"
                style={{ background: 'var(--badge-amber-bg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
              >
                <h4 className="text-sm font-black" style={{ color: 'var(--badge-amber-text)' }}>
                  جعبه‌ابزار و ذخیره موقت داده‌ها (Scratchpad)
                </h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  می‌توانید کدهای موقت، کد ملی کارمند، شماره پیگیری یا یادداشت‌های حین انجام فرایند را اینجا بنویسید. این مقادیر به‌صورت خودکار در مرورگر ذخیره می‌مانند.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={scratchpadNote}
                  onChange={(e) => setScratchpadNote(e.target.value)}
                  placeholder="یادداشت‌ها و مقادیر موقت این فرایند را اینجا بنویسید (مثلاً: کد پرسنلی، نام کاربری موقت، وضعیت مدارک)..."
                  rows={8}
                  className="w-full p-4 rounded-2xl text-sm font-medium leading-relaxed border outline-none transition-all resize-y"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-glass)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {isSavedNotice ? '✅ یادداشت ذخیره شد' : 'تغییرات با کلیک روی ذخیره در حافظه محلی ذخیره می‌شود.'}
                </span>

                <button
                  type="button"
                  onClick={handleSaveScratchpad}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                  style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره موقت</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          {process.targetUrl ? (
            <a
              href={process.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>باز کردن سامانه در پنجره جدید ({process.targetSystem})</span>
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
            style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
          >
            بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
}
