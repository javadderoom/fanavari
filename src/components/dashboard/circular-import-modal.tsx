'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Layers, 
  Workflow, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Calendar, 
  Send, 
  Building2, 
  Radio, 
  HelpCircle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { notify } from '@/lib/notify';
import { parseCircularToProcesses, ParsedCircularResult, ParsedProcessDraft } from '@/lib/circular-parser';
import { Process } from '@/types/process';

interface CircularImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: Process[]) => void;
}

const SAMPLE_1 = `*#سامانه: یکپارچه‌یِ دانش‌آموزی (سیدا)

#مخاطب: مدیران محترم مدارس نمونه دولتی مقطع متوسطه دوم *

*#موضوع:
💢 امکان دریافت مجوز انتقالی مدارس نمونه دولتی پیش از فعال شدن سامانه نقل و انتقال سال تحصیلی ۱۴۰۶-۱۴۰۵ بصورت زیر میسر می‌باشد.*

📌لازم به ذکر می‌باشد درخواست انتقال می‌بایست در *مدرسه مبدأ* طبق مراحل ذیل ثبت گردد.

*⭕️مراحل جهت مشاهده و اقدام در مدرسه مبدأ؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات اولیه
◀️ عملیات پیش ثبت‌نام
◀️ مجوزهای ثبت‌نام
◀️ *+* ایجاد

🔻پس از ثبت درخواست، این مجوز می‌بایست توسط معاون آموزش متوسطه استان (مقصد) تأیید شود.

*⭕️مراحل جهت مشاهده و اقدام در مدرسه مقصد؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات ضمن سال
◀️ ثبت‌نام میان‌پایه
◀️ افزودن دانش‌آموزان خارج از مدرسه


مرکز توسعه آموزش مجازی، فناوری و امنیت اطلاعات
* آدرس کانال در پیام رسان بله:*
🆔 @Fanavari_Setad

🖥️ درگاه خدمات یکپارچه وزارت آموزش و پرورش
🌐 My.Medu.ir

🗓 *تاریخ:  ۱۴۰۵/۰۷/۲۵*`;

const SAMPLE_2 = `*ٖ#سامانه: یکپارچه‌یِ دانش‌آموزی (سیدا)

#مخاطب: مدیران محترم مدارس با ماهیت حفظ قرآن کریم*

* #موضوع:
💢کشوی مجوزهای ثبت نام در سال تحصیلی ۱۴۰۶-۱۴۰۵ فعال گردید.*

*📌 مراحل جهت مشاهده و اقدام؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات پیش ثبت‌نام
◀️ مجوزهای ثبت‌نام
◀️ *+* جدید

مرکز توسعه آموزش مجازی، فناوری و امنیت اطلاعات
* آدرس کانال در پیام رسان بله:*
🆔 @Fanavari_Setad

🖥️ درگاه خدمات یکپارچه وزارت آموزش و پرورش
🌐 My.Medu.ir

🗓*تاریخ: ۱۴۰۵/۰۷/۲۰*`;

export function CircularImportModal({ isOpen, onClose, onSuccess }: CircularImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedCircularResult | null>(null);
  const [draftProcesses, setDraftProcesses] = useState<ParsedProcessDraft[]>([]);
  const [saveAsDraft, setSaveAsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Parse text whenever rawText changes
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedResult(null);
      setDraftProcesses([]);
      return;
    }
    try {
      const res = parseCircularToProcesses(rawText);
      setParsedResult(res);
      setDraftProcesses(res.processes);
    } catch (err) {
      console.error('Parsing error:', err);
    }
  }, [rawText]);

  if (!isOpen) return null;

  const handleUpdateProcessField = (index: number, field: keyof ParsedProcessDraft, value: any) => {
    setDraftProcesses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveToDatabase = async () => {
    if (!draftProcesses.length) {
      notify.error('هیچ فرایندی برای ثبت شناسایی نشده است.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloads = draftProcesses.map((d) => ({
        ...d,
        isPublished: !saveAsDraft,
      }));

      const res = await fetch('/api/processes/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processes: payloads, isPublished: !saveAsDraft }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت فرایندها در پایگاه داده');
      }

      if (saveAsDraft) {
        notify.success(`${data.count} فرایند به عنوان پیش‌نویس ذخیره شدند. می‌توانید از تب «بایگانی / پیش‌نویس» آن‌ها را بازبینی و سپس منتشر فرمایید.`);
      } else {
        notify.success(`${data.count} فرایند با موفقیت در پایگاه داده ذخیره و منتشر شدند.`);
      }

      onSuccess(data.processes);
      onClose();
    } catch (err: any) {
      console.error('Import save failed:', err);
      notify.error(err.message || 'خطا در ثبت اطلاعات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                تبدیل هوشمند بخشنامه و پیام‌های اداری به فرایند
              </h3>
              <p className="text-xs text-slate-500">
                استخراج خودکار سامانه، مخاطبان، مراحل مرحله‌به‌مرحله و اتصال زنجیره‌ای فرایندهای مرتبط
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                متن پیام اطلاعیه یا بخشنامه را اینجا الصاق فرمایید:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_1)}
                  className="text-[11px] px-2.5 py-1 rounded-lg font-bold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  نمونه ۱ (زنجیره‌ای مبدأ و مقصد)
                </button>
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_2)}
                  className="text-[11px] px-2.5 py-1 rounded-lg font-bold text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all cursor-pointer"
                >
                  نمونه ۲ (تک مرحله‌ای)
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="متن پیام بخشنامه کانال بله یا تلگرام (حاوی #سامانه، #مخاطب، #موضوع و مراحل با ⬅️ یا ◀️)..."
              className="w-full p-3.5 rounded-2xl text-xs border outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed transition-all resize-y"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Parsed Preview Section */}
          {parsedResult && draftProcesses.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Overall Metadata Bar */}
              <div 
                className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
              >
                <div className="flex items-center flex-wrap gap-2.5">
                  <span className="px-2.5 py-1 rounded-xl font-bold bg-blue-500/15 text-blue-600 border border-blue-500/20">
                    سامانه: {parsedResult.metadata.targetSystem}
                  </span>
                  {parsedResult.metadata.audience && (
                    <span className="px-2.5 py-1 rounded-xl font-bold bg-indigo-500/15 text-indigo-600 border border-indigo-500/20">
                      مخاطب: {parsedResult.metadata.audience}
                    </span>
                  )}
                  {parsedResult.metadata.targetUrl && (
                    <span className="px-2.5 py-1 rounded-xl font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{parsedResult.metadata.targetUrl}</span>
                    </span>
                  )}
                </div>

                <div>
                  {parsedResult.isMultiStage ? (
                    <span className="px-3 py-1 rounded-xl font-black bg-emerald-500 text-white shadow-xs">
                      فرایند چندمرحله‌ای متصل ({draftProcesses.length} فرایند زنجیره‌ای)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl font-black bg-blue-600 text-white shadow-xs">
                      فرایند تک مرحله‌ای
                    </span>
                  )}
                </div>
              </div>

              {/* Draft Process Cards */}
              <div className="space-y-4">
                {draftProcesses.map((draft, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const isChainedToNext = typeof draft.nextProcessDraftIndex === 'number';

                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border transition-all overflow-hidden"
                      style={{ 
                        background: 'var(--bg-surface)', 
                        borderColor: isChainedToNext ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)' 
                      }}
                    >
                      {/* Card Header Accordion */}
                      <div 
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-500/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            isChainedToNext ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                              {draft.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span>سامانه: {draft.targetSystem}</span>
                              {draft.audience && (
                                <>
                                  <span>•</span>
                                  <span>مخاطب: {draft.audience}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="font-bold text-emerald-600">{draft.steps.length} گام اجرایی</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isChainedToNext && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                              <Workflow className="w-3 h-3" />
                              <span>متصل به گام بعدی</span>
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Card Body Details */}
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          {/* Editable Metadata Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                عنوان فرایند:
                              </label>
                              <input 
                                type="text"
                                value={draft.title}
                                onChange={(e) => handleUpdateProcessField(idx, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                جامعه هدف و مخاطب:
                              </label>
                              <input 
                                type="text"
                                value={draft.audience || ''}
                                onChange={(e) => handleUpdateProcessField(idx, 'audience', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                              />
                            </div>
                          </div>

                          {/* Chaining Note Banner */}
                          {isChainedToNext && draft.nextProcessNote && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                              <Workflow className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                              <div className="space-y-1">
                                <span className="font-bold block">
                                  🔗 اتصال خودکار به فرایند مقصد (بخش ۲):
                                </span>
                                <p className="leading-relaxed opacity-90">
                                  {draft.nextProcessNote}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Steps List */}
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block mb-2">
                              مراحل و مسیر منوهای شناسایی‌شده ({draft.steps.length} گام):
                            </span>
                            <div className="space-y-1.5">
                              {draft.steps.map((st, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className="p-2.5 rounded-xl border flex items-start gap-2.5 text-xs"
                                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
                                >
                                  <span className="w-5 h-5 rounded-lg bg-blue-500/15 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                    {st.orderIndex}
                                  </span>
                                  <div className="flex-1 space-y-0.5">
                                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                      {st.title}
                                    </div>
                                    {st.targetMenuPath && (
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        مسیر منو: {st.targetMenuPath}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={saveAsDraft}
                onChange={(e) => setSaveAsDraft(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <div className="flex flex-col text-right">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  ذخیره به عنوان پیش‌نویس (عدم انتشار مستقیم)
                </span>
                <span className="text-[10px] text-slate-500">
                  فرایندها در تب «بایگانی / پیش‌نویس» قرار می‌گیرند تا ابتدا آن‌ها را بازبینی و سپس منتشر فرمایید.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSubmitting || draftProcesses.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                saveAsDraft
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {saveAsDraft
                      ? `ثبت پیش‌نویس (${draftProcesses.length} فرایند جهت بازبینی)`
                      : `ثبت و انتشار مستقیم (${draftProcesses.length} فرایند)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
