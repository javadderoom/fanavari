'use client';

import React from 'react';
import { 
  Trash2, 
  Lightbulb, 
  AlertTriangle, 
  Pin, 
  Link2 
} from 'lucide-react';
import { ProcessStep, StepType } from '@/types/process';
import { MenuPathEditor } from '@/components/menu-path-editor';
import { StepContentRenderer } from '@/components/step-content-renderer';
import { StepCopyableFields } from './step-copyable-fields';
import { StepErrorGuides } from './step-error-guides';

interface StepEditorCardProps {
  step: ProcessStep;
  stepIndex: number;
  totalSteps: number;
  onUpdateStep: (stepIndex: number, updated: Partial<ProcessStep>) => void;
  onRemoveStep: (stepIndex: number) => void;
}

export function StepEditorCard({
  step,
  stepIndex,
  totalSteps,
  onUpdateStep,
  onRemoveStep,
}: StepEditorCardProps) {
  // Callout append helper
  const appendCallout = (prefix: string) => {
    const cur = step.contentMarkdown || '';
    const toAppend = cur ? `\n${prefix}` : prefix;
    onUpdateStep(stepIndex, { contentMarkdown: cur + toAppend });
  };

  return (
    <div
      id={`step-card-${step.id}`}
      className={`p-4 rounded-2xl border transition-all ${
        step.stepType === 'decision'
          ? 'border-amber-400/60 dark:border-amber-600/60 bg-amber-500/5'
          : step.stepType === 'end'
          ? 'border-emerald-500/60 dark:border-emerald-600/60 ring-1 ring-emerald-500/20 bg-emerald-500/5'
          : step.stepType === 'warning'
          ? 'border-rose-400/60 dark:border-rose-600/60 bg-rose-500/5'
          : ''
      }`}
      style={{
        background: step.stepType === 'action' ? 'var(--bg-surface)' : undefined,
        borderColor: step.stepType === 'action' ? 'var(--border-glass)' : undefined,
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-full ${
              step.stepType === 'decision'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                : step.stepType === 'end'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : step.stepType === 'warning'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            }`}
          >
            گام {step.orderIndex}
          </span>
          <input
            type="text"
            value={step.title}
            onChange={(e) => onUpdateStep(stepIndex, { title: e.target.value })}
            className="text-sm font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none pb-0.5"
            placeholder="عنوان مرحله..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={step.stepType}
            onChange={(e) => onUpdateStep(stepIndex, { stepType: e.target.value as StepType })}
            className={`text-xs p-1.5 rounded-lg border font-bold outline-none cursor-pointer ${
              step.stepType === 'decision'
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                : step.stepType === 'end'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                : step.stepType === 'warning'
                ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200'
            }`}
          >
            <option value="action">□ اقدام (Action)</option>
            <option value="decision">◇ تصمیم‌گیری (Decision)</option>
            <option value="warning">⚠ هشدار/ایست (Warning)</option>
            <option value="end">◎ پایان/خروجی (End)</option>
          </select>

          {totalSteps > 1 && (
            <button
              type="button"
              onClick={() => onRemoveStep(stepIndex)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
              title="حذف این گام"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Path Editor */}
      <div className="mb-3">
        <MenuPathEditor
          value={step.targetMenuPath || ''}
          onChange={(newPath) => onUpdateStep(stepIndex, { targetMenuPath: newPath })}
        />
      </div>

      {/* Step Description & Callout Helpers */}
      <div className="mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            دستورالعمل اجرایی و شرح تفصیلی گام
          </label>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => appendCallout('💡 نکته: ')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
              title="افزودن کادر نکته کاربردی"
            >
              <Lightbulb className="w-2.5 h-2.5" />
              <span>+ نکته</span>
            </button>
            <button
              type="button"
              onClick={() => appendCallout('⚠️ هشدار: ')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors border border-rose-500/20 cursor-pointer"
              title="افزودن کادر هشدار مهم"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>+ هشدار</span>
            </button>
            <button
              type="button"
              onClick={() => appendCallout('📌 توجه: ')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-colors border border-indigo-500/20 cursor-pointer"
              title="افزودن کادر توجه و الزام"
            >
              <Pin className="w-2.5 h-2.5" />
              <span>+ توجه</span>
            </button>
            <button
              type="button"
              onClick={() => appendCallout(' [عنوان فرایند](/process/نام-فرایند) ')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 transition-colors border border-blue-500/20 cursor-pointer"
              title="افزودن لینک داخلی به فرایند دیگر"
            >
              <Link2 className="w-2.5 h-2.5" />
              <span>+ لینک فرایند</span>
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={step.contentMarkdown}
          onChange={(e) => onUpdateStep(stepIndex, { contentMarkdown: e.target.value })}
          placeholder="دستورالعمل اجرایی، پیش‌نیازها و نکات کلیدی این مرحله را بنویسید (پشتیبانی از لینک‌های داخلی و کادرهای 💡 نکته و ⚠️ هشدار)..."
          className="w-full p-2.5 text-xs rounded-xl border outline-none leading-relaxed transition-all focus:ring-2 focus:ring-blue-500"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        />

        {step.contentMarkdown &&
          (step.contentMarkdown.includes('💡') ||
            step.contentMarkdown.includes('⚠️') ||
            step.contentMarkdown.includes('📌') ||
            step.contentMarkdown.includes('[')) && (
            <div className="mt-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">پیش‌نمایش زنده قالب‌بندی و کادرها:</span>
              <StepContentRenderer content={step.contentMarkdown} className="text-xs" />
            </div>
          )}
      </div>

      {/* Copyable Fields */}
      <StepCopyableFields
        fields={step.copyableFields || []}
        onAddField={() => {
          const currentFields = step.copyableFields || [];
          onUpdateStep(stepIndex, {
            copyableFields: [...currentFields, { label: '', value: '' }],
          });
        }}
        onUpdateField={(fieldIndex, updated) => {
          const currentFields = [...(step.copyableFields || [])];
          currentFields[fieldIndex] = { ...currentFields[fieldIndex], ...updated };
          onUpdateStep(stepIndex, { copyableFields: currentFields });
        }}
        onRemoveField={(fieldIndex) => {
          const currentFields = (step.copyableFields || []).filter((_, idx) => idx !== fieldIndex);
          onUpdateStep(stepIndex, { copyableFields: currentFields });
        }}
      />

      {/* Error Guides */}
      <StepErrorGuides
        errorGuides={step.errorGuides || []}
        onAddErrorGuide={() => {
          const currentGuides = step.errorGuides || [];
          onUpdateStep(stepIndex, {
            errorGuides: [
              ...currentGuides,
              {
                id: `err-${Date.now()}`,
                errorCode: '',
                errorTitle: '',
                cause: '',
                solution: '',
              },
            ],
          });
        }}
        onUpdateErrorGuide={(errorIndex, updated) => {
          const currentGuides = [...(step.errorGuides || [])];
          currentGuides[errorIndex] = { ...currentGuides[errorIndex], ...updated };
          onUpdateStep(stepIndex, { errorGuides: currentGuides });
        }}
        onRemoveErrorGuide={(errorIndex) => {
          const currentGuides = (step.errorGuides || []).filter((_, idx) => idx !== errorIndex);
          onUpdateStep(stepIndex, { errorGuides: currentGuides });
        }}
      />
    </div>
  );
}
