'use client';

import React from 'react';
import { 
  Settings2, 
  ChevronDown, 
  Globe, 
  Lock, 
  CalendarClock, 
  Calendar,
  Flame,
  Workflow
} from 'lucide-react';
import { PersianMonth, PersianSeason, ProcessVisibility } from '@/types/process';
import { PERSIAN_MONTHS, getSeasonForMonth } from './types';

interface AdvancedSettingsSectionProps {
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  visibility: ProcessVisibility;
  setVisibility: (val: ProcessVisibility) => void;
  isPopular?: boolean;
  setIsPopular?: (val: boolean) => void;
  hasSchedule: boolean;
  setHasSchedule: (val: boolean) => void;
  scheduleMonth: PersianMonth;
  setScheduleMonth: (val: PersianMonth) => void;
  scheduleSeason: PersianSeason;
  setScheduleSeason: (val: PersianSeason) => void;
  scheduleStartDay: number;
  setScheduleStartDay: (val: number) => void;
  scheduleEndDay: number;
  setScheduleEndDay: (val: number) => void;
  scheduleDeadlineDays: number;
  setScheduleDeadlineDays: (val: number) => void;
  scheduleIsMandatory: boolean;
  setScheduleIsMandatory: (val: boolean) => void;
  scheduleNotes: string;
  setScheduleNotes: (val: string) => void;
  targetUrl: string;
  setTargetUrl: (val: string) => void;
  tagsInput: string;
  setTagsInput: (val: string) => void;
  nextProcessId?: string;
  setNextProcessId?: (val: string) => void;
  nextProcessNote?: string;
  setNextProcessNote?: (val: string) => void;
  availableProcesses?: { id: string; title: string; slug: string }[];
}

export function AdvancedSettingsSection({
  showAdvanced,
  setShowAdvanced,
  visibility,
  setVisibility,
  isPopular,
  setIsPopular,
  hasSchedule,
  setHasSchedule,
  scheduleMonth,
  setScheduleMonth,
  scheduleSeason,
  setScheduleSeason,
  scheduleStartDay,
  setScheduleStartDay,
  scheduleEndDay,
  setScheduleEndDay,
  scheduleDeadlineDays,
  setScheduleDeadlineDays,
  scheduleIsMandatory,
  setScheduleIsMandatory,
  scheduleNotes,
  setScheduleNotes,
  targetUrl,
  setTargetUrl,
  tagsInput,
  setTagsInput,
  nextProcessId,
  setNextProcessId,
  nextProcessNote,
  setNextProcessNote,
  availableProcesses = [],
}: AdvancedSettingsSectionProps) {
  return (
    <div 
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        borderColor: showAdvanced ? 'var(--border-glass)' : 'var(--border-subtle)',
        background: 'var(--bg-input)'
      }}
    >
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full p-3.5 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-500/5 transition-colors select-none"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span>تنظیمات تکمیلی، زمان‌بندی و گاه‌شمار سالانه (اختیاری)</span>
          {isPopular && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              پرمراجعه
            </span>
          )}
          {hasSchedule && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              دارای زمان‌بندی ({scheduleMonth})
            </span>
          )}
          {tagsInput.trim() && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              تگ‌ها
            </span>
          )}
          {nextProcessId && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
              دارای فرایند مکمل
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
          <span>{showAdvanced ? 'بستن' : 'نمایش'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {showAdvanced && (
        <div className="p-4 border-t space-y-4 animate-in fade-in" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Visibility & Confidentiality Setting */}
          <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              سطح محرمانگی و دسترسی (Visibility)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                  visibility === 'public'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500/30'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 text-blue-500" />
                <div>
                  <div className="text-xs">عمومی (Public)</div>
                  <div className="text-[10px] font-normal opacity-80">در دسترس تمام پرسنل سازمان و قابل جستجو</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('restricted')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                  visibility === 'restricted'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                <div>
                  <div className="text-xs">محدود و محرمانه (Restricted)</div>
                  <div className="text-[10px] font-normal opacity-80">فقط شما، مدیران ارشد و افراد دارای دسترسی</div>
                </div>
              </button>
            </div>
          </div>

          {/* Popular / Featured Setting */}
          <div 
            className="p-3.5 rounded-xl border flex items-center justify-between gap-4" 
            style={{ 
              background: isPopular ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-surface)', 
              borderColor: isPopular ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)' 
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  علامت‌گذاری به عنوان پرمراجعه (Featured / Popular)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  نمایش نشان اختصاصی «پرمراجعه» در کاتالوگ و افزایش رتبه جستجو (فرایندهای با ۱۰+ بازدید نیز خودکار نشان می‌گیرند)
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(isPopular)}
                onChange={(e) => setIsPopular?.(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Administrative Timeline Section */}
          <div 
            className="rounded-xl p-3.5 border transition-all"
            style={{
              background: hasSchedule ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-surface)',
              borderColor: hasSchedule ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className={`w-4 h-4 ${hasSchedule ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    گاه‌شمار اجرایی سالانه (Administrative Timeline)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    تعیین بازه و مهلت اقدام در تقویم اداری ۱۲ ماهه
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasSchedule}
                  onChange={(e) => setHasSchedule(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {hasSchedule ? 'دارای زمان‌بندی' : 'بدون زمان‌بندی'}
                </span>
              </label>
            </div>

            {hasSchedule && (
              <div className="mt-3 pt-3 border-t border-blue-200/40 dark:border-blue-900/40 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Month Picker */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                      ماه اجرایی (فصل خودکار تعیین می‌شود)
                    </label>
                    <select
                      value={scheduleMonth}
                      onChange={(e) => {
                        const m = e.target.value as PersianMonth;
                        setScheduleMonth(m);
                        setScheduleSeason(getSeasonForMonth(m));
                      }}
                      className="w-full p-2 rounded-lg border text-xs font-medium outline-none cursor-pointer"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    >
                      {PERSIAN_MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m} (فصل {getSeasonForMonth(m)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Day */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                      روز شروع بازه (از ۱ تا ۳۱)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduleStartDay}
                      onChange={(e) => {
                        const val = Math.min(31, Math.max(1, Number(e.target.value)));
                        setScheduleStartDay(val);
                        setScheduleDeadlineDays(Math.max(1, scheduleEndDay - val + 1));
                      }}
                      className="w-full p-2 rounded-lg border text-xs font-mono outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* End Day */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                      روز پایان بازه (مهلت اقدام)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduleEndDay}
                      onChange={(e) => {
                        const val = Math.min(31, Math.max(1, Number(e.target.value)));
                        setScheduleEndDay(val);
                        setScheduleDeadlineDays(Math.max(1, val - scheduleStartDay + 1));
                      }}
                      className="w-full p-2 rounded-lg border text-xs font-mono outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-slate-700 dark:text-slate-300">
                      یادداشت گاه‌شمار
                    </label>
                    <input
                      type="text"
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      placeholder="مثلاً: طبق بخشنامه شماره ۱۴..."
                      className="w-full p-2 rounded-lg border text-xs outline-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Mandatory Toggle */}
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={scheduleIsMandatory}
                        onChange={(e) => setScheduleIsMandatory(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        مهلت قطعی و الزامی (مشمول جریمه یا مسدودی)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    بازه ثبت در تقویم: <strong>{`از ${scheduleStartDay} الی ${scheduleEndDay} ${scheduleMonth} ماه`}</strong>
                    {' • '}
                    <span>مهلت اقدام: <strong>{scheduleDeadlineDays} روز</strong></span>
                    {scheduleIsMandatory && <span className="text-rose-500 font-bold mr-1">• مهلت قطعی</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* URL Override & Estimated Minutes in 1 Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>نشانی اینترنتی اختصاصی (اختیاری)</span>
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://... (پیش‌فرض از سامانه خوانده می‌شود)"
                dir="ltr"
                className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
              برچسب‌ها و کلمات کلیدی (با ویرگول جدا کنید)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="مثلاً: آموزش، فرهنگیان، استعلام حکم..."
              className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Next / Sibling Process Chain (زنجیره فرایندی و فرایند مکمل) */}
          <div className="p-3.5 rounded-xl border space-y-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                فرایند مکمل و گام بعدی (زنجیره فرایندی)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              اگر این فرایند پیش‌نیاز یا گام اول از یک زنجیره دو یا چند مرحله‌ای است، می‌توانید فرایند بعدی را متصل کنید تا در گام نهایی و هنگام ثبت پایان فرایند، کاربر مستقیماً به آن هدایت شود.
            </p>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-400">
                  انتخاب فرایند مکمل / بعدی:
                </label>
                <select
                  value={nextProcessId || ''}
                  onChange={(e) => setNextProcessId?.(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  <option value="">بدون فرایند مکمل (پایان مسیر فرایند)</option>
                  {availableProcesses.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {nextProcessId && (
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-400">
                    توضیح یا راهنمای انتقال به فرایند بعدی (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={nextProcessNote || ''}
                    onChange={(e) => setNextProcessNote?.(e.target.value)}
                    placeholder="مثال: پس از دریافت تاییدیه نهایی، برای صدور حکم به فرایند زیر مراجعه کنید..."
                    className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
