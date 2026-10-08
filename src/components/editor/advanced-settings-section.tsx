'use client';

import React from 'react';
import { 
  Settings2, 
  ChevronDown, 
  Globe, 
  Lock, 
  CalendarClock, 
  Calendar 
} from 'lucide-react';
import { PersianMonth, PersianSeason, ProcessVisibility } from '@/types/process';
import { PERSIAN_MONTHS, getSeasonForMonth } from './types';

interface AdvancedSettingsSectionProps {
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  visibility: ProcessVisibility;
  setVisibility: (val: ProcessVisibility) => void;
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
}

export function AdvancedSettingsSection({
  showAdvanced,
  setShowAdvanced,
  visibility,
  setVisibility,
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
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span>تنظیمات تکمیلی، زمان‌بندی و گاه‌شمار سالانه (اختیاری)</span>
          {hasSchedule && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              دارای زمان‌بندی ({scheduleMonth})
            </span>
          )}
          {tagsInput.trim() && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              تگ‌ها
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
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
        </div>
      )}
    </div>
  );
}
