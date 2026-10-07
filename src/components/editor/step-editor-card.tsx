'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  Lightbulb, 
  AlertTriangle, 
  Pin, 
  Link2,
  GitFork,
  Image as ImageIcon,
  MousePointerClick,
  ExternalLink
} from 'lucide-react';
import { ProcessStep, StepType, UiSnippet } from '@/types/process';
import { MenuPathEditor } from '@/components/menu-path-editor';
import { StepContentRenderer } from '@/components/step-content-renderer';
import { StepCopyableFields } from './step-copyable-fields';
import { StepErrorGuides } from './step-error-guides';
import { StepUiSnippets } from './step-ui-snippets';
import { ImageSnippetModal } from '@/components/image-snippet-modal';

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
  const [activeModal, setActiveModal] = useState<'screenshot' | 'snippet' | null>(null);

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
            <option value="subprocess">⊞ زیر-فرایند (Sub-Process)</option>
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

      {/* Step Screenshot Attachment */}
      {step.imageUrl ? (
        <div className="mb-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-14 h-10 rounded-lg border overflow-hidden bg-black/10 shrink-0 border-slate-200 dark:border-slate-700">
                <img src={step.imageUrl} alt="اسکرین‌شات گام" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  اسکرین‌شات پیوست این مرحله (WebP)
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  ✓ فشرده‌شده و آماده نمایش در اجرای زنده
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModal('screenshot')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                تغییر تصویر
              </button>
              <button
                type="button"
                onClick={() => onUpdateStep(stepIndex, { imageUrl: undefined })}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="حذف تصویر"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setActiveModal('screenshot')}
            className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-slate-500 hover:text-blue-600 dark:text-slate-400 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold"
          >
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span>+ پیوست اسکرین‌شات کامل این گام (فشرده‌سازی WebP و پشتیبانی از Ctrl+V)</span>
          </button>
        </div>
      )}

      {/* Sub-Process Connection Field */}
      {step.stepType === 'subprocess' && (
        <div className="mb-3 p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <GitFork className="w-4 h-4" />
            <span>تنظیم پیوند زیر-فرایند (Sub-Process Link):</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={step.subProcessSlug || ''}
              onChange={(e) => onUpdateStep(stepIndex, { 
                subProcessSlug: e.target.value.trim(),
                subProcessTitle: step.subProcessTitle || step.title
              })}
              placeholder="شناسه یا اسلاگ فرایند فرزند (مثال: tax-token-generate)..."
              className="flex-1 text-xs p-2 rounded-lg border bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-500">
            اسلاگ فرایندی که مایلید به عنوان زیر-فرایند فرزند در این مرحله پیوست شود را وارد فرمایید.
          </p>
        </div>
      )}

      {/* Step Description & Callout Helpers */}
      <div className="mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            دستورالعمل اجرایی و شرح تفصیلی گام
          </label>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveModal('snippet')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
              title="افزودن دکمه یا آیکون تصویری کلیک به متن و فهرست"
            >
              <MousePointerClick className="w-2.5 h-2.5" />
              <span>+ دکمه/آیکون کلیک</span>
            </button>
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

      {/* Micro UI Click Elements & Icons */}
      <StepUiSnippets
        snippets={step.uiSnippets || []}
        onAddSnippet={(snippet, insertInline) => {
          const currentSnippets = step.uiSnippets || [];
          const updatedSnippets = [...currentSnippets, snippet];

          let updatedMarkdown = step.contentMarkdown || '';
          if (insertInline) {
            const macro = ` ![icon:${snippet.title}](${snippet.iconUrl}) `;
            updatedMarkdown = updatedMarkdown ? `${updatedMarkdown}${macro}` : macro;
          }

          onUpdateStep(stepIndex, {
            uiSnippets: updatedSnippets,
            contentMarkdown: updatedMarkdown,
          });
        }}
        onRemoveSnippet={(snippetIdx) => {
          const currentSnippets = (step.uiSnippets || []).filter((_, i) => i !== snippetIdx);
          onUpdateStep(stepIndex, { uiSnippets: currentSnippets });
        }}
      />

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

      {/* Image / Snippet Modal */}
      {activeModal && (
        <ImageSnippetModal
          isOpen={!!activeModal}
          mode={activeModal}
          initialScreenshotUrl={step.imageUrl}
          onClose={() => setActiveModal(null)}
          onScreenshotSaved={(url) => {
            onUpdateStep(stepIndex, { imageUrl: url });
          }}
          onSnippetSaved={(snippet, insertInline) => {
            const currentSnippets = step.uiSnippets || [];
            const updatedSnippets = [...currentSnippets, snippet];

            let updatedMarkdown = step.contentMarkdown || '';
            if (insertInline) {
              const macro = ` ![icon:${snippet.title}](${snippet.iconUrl}) `;
              updatedMarkdown = updatedMarkdown ? `${updatedMarkdown}${macro}` : macro;
            }

            onUpdateStep(stepIndex, {
              uiSnippets: updatedSnippets,
              contentMarkdown: updatedMarkdown,
            });
          }}
        />
      )}
    </div>
  );
}
