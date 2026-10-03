'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  ChevronLeft, 
  Navigation, 
  ArrowLeft, 
  ArrowRight, 
  Edit3, 
  Check, 
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { parseMenuPath } from './menu-path-display';

interface MenuPathEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

const QUICK_SUGGESTIONS = [
  'صفحه اصلی',
  'داشبورد',
  'تنظیمات سیستم',
  'امور پرسنلی',
  'کاربران و دسترسی‌ها',
  'ثبت درخواست جدید',
  'تایید و ارسال نهایی'
];

export function MenuPathEditor({ value, onChange, placeholder = 'افزودن سطح بعدی منو...' }: MenuPathEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);

  const tags = parseMenuPath(value);

  // Commit updated array of tags back to parent string
  const updateTags = (newTags: string[]) => {
    onChange(newTags.join(' > '));
  };

  // Add new tag or split pasted string by common delimiters
  const handleAddTag = (textToAdd?: string) => {
    const raw = textToAdd !== undefined ? textToAdd : inputValue;
    if (!raw.trim()) return;

    // Support typing or pasting multiple items separated by >, /, ->
    const newItems = parseMenuPath(raw);
    if (newItems.length > 0) {
      updateTags([...tags, ...newItems]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      updateTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    updateTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveTag = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tags.length) return;

    const copy = [...tags];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateTags(copy);
  };

  return (
    <div className="space-y-2.5">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
          <span>مسیر گام‌به‌گام کلیک در منوی سامانه (باکس‌های سلسله‌مراتبی)</span>
        </label>

        {/* Toggle between interactive Tag Pills and Raw Text input */}
        <button
          type="button"
          onClick={() => setIsRawMode(!isRawMode)}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>{isRawMode ? 'نمایش تگ‌های تصویری' : 'ویرایش متنی ساده (Raw)'}</span>
        </button>
      </div>

      {isRawMode ? (
        /* ================= RAW TEXT MODE ================= */
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="مثلاً: صفحه اصلی > تنظیمات > کاربران > ثبت جدید"
            className="w-full p-2.5 text-xs rounded-xl border font-mono outline-none transition-all focus:ring-2 focus:ring-blue-500"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          />
          <span className="text-[10px] text-slate-500 mt-1 block">
            سطوح را با علامت <code className="text-blue-600 font-bold">&gt;</code> از هم جدا کنید. با بازگشت به حالت تگ، به باکس تبدیل می‌شوند.
          </span>
        </div>
      ) : (
        /* ================= INTERACTIVE TAGS BOX MODE ================= */
        <div 
          className="p-3 rounded-2xl border transition-all"
          style={{ 
            background: 'var(--bg-surface)', 
            borderColor: tags.length > 0 ? 'rgba(37, 99, 235, 0.3)' : 'var(--border-subtle)' 
          }}
        >
          {/* Render Active Sequence Pills */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {tags.map((tag, idx) => {
                const isLast = idx === tags.length - 1;

                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all shadow-xs ${
                        isLast
                          ? 'bg-blue-600 text-white font-black border-blue-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {/* Step index */}
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isLast ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <span>{tag}</span>

                      {/* Reorder Arrows (visible if more than 1 tag) */}
                      {tags.length > 1 && (
                        <div className="flex items-center gap-0.5 opacity-70 hover:opacity-100 mr-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveTag(idx, 'left')}
                              className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                              title="جابجایی به مرحله قبل"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx < tags.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveTag(idx, 'right')}
                              className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                              title="جابجایی به مرحله بعد"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                          isLast ? 'hover:bg-blue-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500'
                        }`}
                        title="حذف این مرحله"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {!isLast && (
                      <ChevronLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="py-2 px-1 text-xs text-slate-400 font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
              <span>هنوز مسیری ثبت نشده است. سطح اول منو را از زیر اضافه کنید:</span>
            </div>
          )}

          {/* Add Next Level Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? 'نام منوی اول (مثلاً: منوی اصلی)...' : 'نام مرحله بعدی منو را بنویسید و Enter بزنید...'}
                className="w-full py-2 px-3 text-xs rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleAddTag()}
              disabled={!inputValue.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-xs bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن گام</span>
            </button>
          </div>

          {/* Quick Click Suggestions */}
          <div className="mt-2.5 pt-2 border-t flex flex-wrap items-center gap-1.5 text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>پیشنهادهای سریع:</span>
            </span>
            {QUICK_SUGGESTIONS.map((sug, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleAddTag(sug)}
                className="px-2 py-0.5 rounded-lg border text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors cursor-pointer"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
