'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Process, 
  OrganizationEntity, 
  PersianMonth, 
  PersianSeason 
} from '@/types/process';
import { 
  Calendar, 
  CalendarClock, 
  CalendarDays, 
  Timer, 
  Building2, 
  Laptop, 
  ExternalLink, 
  ArrowLeft, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ChevronRight,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  ListOrdered
} from 'lucide-react';

export const PERSIAN_MONTHS: { name: PersianMonth; season: PersianSeason; index: number }[] = [
  { name: 'فروردین', season: 'بهار', index: 1 },
  { name: 'اردیبهشت', season: 'بهار', index: 2 },
  { name: 'خرداد', season: 'بهار', index: 3 },
  { name: 'تیر', season: 'تابستان', index: 4 },
  { name: 'مرداد', season: 'تابستان', index: 5 },
  { name: 'شهریور', season: 'تابستان', index: 6 },
  { name: 'مهر', season: 'پاییز', index: 7 },
  { name: 'آبان', season: 'پاییز', index: 8 },
  { name: 'آذر', season: 'پاییز', index: 9 },
  { name: 'دی', season: 'زمستان', index: 10 },
  { name: 'بهمن', season: 'زمستان', index: 11 },
  { name: 'اسفند', season: 'زمستان', index: 12 },
];

export const SEASON_CONFIG: Record<PersianSeason, {
  label: string;
  badgeClass: string;
  cardBorder: string;
  cardBg: string;
  accentColor: string;
}> = {
  بهار: {
    label: 'فصل بهار',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    cardBorder: 'border-emerald-500/30',
    cardBg: 'from-emerald-500/5 to-teal-500/5',
    accentColor: '#10b981',
  },
  تابستان: {
    label: 'فصل تابستان',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    cardBorder: 'border-amber-500/30',
    cardBg: 'from-amber-500/5 to-orange-500/5',
    accentColor: '#f59e0b',
  },
  پاییز: {
    label: 'فصل پاییز',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    cardBorder: 'border-rose-500/30',
    cardBg: 'from-rose-500/5 to-orange-500/5',
    accentColor: '#f43f5e',
  },
  زمستان: {
    label: 'فصل زمستان',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    cardBorder: 'border-sky-500/30',
    cardBg: 'from-sky-500/5 to-blue-500/5',
    accentColor: '#0ea5e9',
  },
};

/**
 * Returns the current Persian month name using standard Intl API.
 */
function getCurrentPersianMonth(): PersianMonth {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' });
    const formatted = formatter.format(new Date());
    const matched = PERSIAN_MONTHS.find(m => formatted.includes(m.name));
    return matched ? matched.name : 'تیر';
  } catch {
    return 'تیر';
  }
}

interface AdministrativeTimelineViewProps {
  initialProcesses: Process[];
  initialOrganizations: OrganizationEntity[];
}

export function AdministrativeTimelineView({
  initialProcesses,
  initialOrganizations,
}: AdministrativeTimelineViewProps) {
  const currentMonth = useMemo(() => getCurrentPersianMonth(), []);

  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMandatory, setOnlyMandatory] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'stream'>('matrix');

  // Scheduled processes collection
  const scheduledProcesses = useMemo(() => {
    return initialProcesses.filter(p => Boolean(p.schedule && p.schedule.month));
  }, [initialProcesses]);

  // Filtered list
  const filteredProcesses = useMemo(() => {
    return scheduledProcesses.filter(p => {
      const schedule = p.schedule!;

      // Department filter
      if (selectedDept !== 'all') {
        const matchesDept = 
          p.departmentName === selectedDept || 
          p.departmentSlug === selectedDept;
        if (!matchesDept) return false;
      }

      // Season filter
      if (selectedSeason !== 'all') {
        const monthInfo = PERSIAN_MONTHS.find(m => m.name === schedule.month);
        const effectiveSeason = schedule.season || monthInfo?.season;
        if (effectiveSeason !== selectedSeason) return false;
      }

      // Month filter
      if (selectedMonth !== 'all' && schedule.month !== selectedMonth) {
        return false;
      }

      // Mandatory filter
      if (onlyMandatory && !schedule.isMandatory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = p.title.toLowerCase().includes(query);
        const inDesc = p.description.toLowerCase().includes(query);
        const inDept = p.departmentName.toLowerCase().includes(query);
        const inSystem = p.targetSystem.toLowerCase().includes(query);
        const inNotes = (schedule.notes || '').toLowerCase().includes(query);
        const inMonth = schedule.month.includes(query);
        if (!inTitle && !inDesc && !inDept && !inSystem && !inNotes && !inMonth) {
          return false;
        }
      }

      return true;
    });
  }, [scheduledProcesses, selectedDept, selectedSeason, selectedMonth, onlyMandatory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalScheduled = scheduledProcesses.length;
    const activeInCurrentMonth = scheduledProcesses.filter(p => p.schedule?.month === currentMonth).length;
    const mandatoryCount = scheduledProcesses.filter(p => p.schedule?.isMandatory).length;
    const deptsCount = new Set(scheduledProcesses.map(p => p.departmentName)).size;

    return {
      totalScheduled,
      activeInCurrentMonth,
      mandatoryCount,
      deptsCount,
    };
  }, [scheduledProcesses, currentMonth]);

  // Group processes by month for matrix view
  const processesByMonth = useMemo(() => {
    const map = new Map<PersianMonth, Process[]>();
    PERSIAN_MONTHS.forEach(m => map.set(m.name, []));

    filteredProcesses.forEach(p => {
      if (p.schedule?.month && map.has(p.schedule.month)) {
        map.get(p.schedule.month)!.push(p);
      }
    });

    return map;
  }, [filteredProcesses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Hero / Header Section */}
      <section 
        className="rounded-3xl p-6 sm:p-8 border relative overflow-hidden glass-panel"
        style={{
          borderColor: 'var(--border-glass)',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.04) 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>تقویم و گاه‌شمار اداری سالانه</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>ماه جاری: {currentMonth}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              گاه‌شمار اجرایی و تقویم سالانه فرایندها
            </h1>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              مشاهده و پایش زمان‌بندی بازه‌ها، مهلت‌های اقدام و مواعد اداری فرایندها در سازمان‌ها و سامانه‌های دولتی. با انتخاب سازمان مورد نظر، دوره‌های اجرایی سال را به تفکیک ماه‌ها و فصول رصد کنید.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div 
              className="p-3.5 rounded-2xl border text-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono block">
                <span dir="ltr">\u200E{stats.totalScheduled}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">فرایند زمان‌بندی شده</span>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-2xl font-black text-amber-500 font-mono block">
                <span dir="ltr">\u200E{stats.activeInCurrentMonth}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">فعال در {currentMonth}</span>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-2xl font-black text-rose-500 font-mono block">
                <span dir="ltr">\u200E{stats.mandatoryCount}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">مهلت قطعی و الزامی</span>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-glass-card)', borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-2xl font-black text-emerald-500 font-mono block">
                <span dir="ltr">\u200E{stats.deptsCount}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">سازمان و وزارتخانه</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section 
        className="rounded-3xl p-4 sm:p-5 border glass-panel space-y-4 shadow-sm"
        style={{
          borderColor: 'var(--border-glass)',
          background: 'var(--bg-glass-strong)',
        }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی عنوان فرایند، سامانه، سازمان، یا شیوه‌نامه اجرایی..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all focus:ring-2 focus:ring-blue-500/50"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                پاکسازی
              </button>
            )}
          </div>

          {/* Department Selector */}
          <div className="min-w-[220px]">
            <div className="relative">
              <Building2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all cursor-pointer"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="all">همه سازمان‌ها و وزارتخانه‌ها</option>
                {initialOrganizations.map((dept) => (
                  <option key={dept.slug} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div 
            className="flex items-center p-1 rounded-2xl border shrink-0"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ماتریس ۱۲ ماهه</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'stream'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">جریان گاه‌شمار</span>
            </button>
          </div>
        </div>

        {/* Season & Month Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">فصل:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedSeason('all');
                setSelectedMonth('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedSeason === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              همه فصل‌ها
            </button>
            {(['بهار', 'تابستان', 'پاییز', 'زمستان'] as PersianSeason[]).map((season) => {
              const cfg = SEASON_CONFIG[season];
              const isSelected = selectedSeason === season;
              return (
                <button
                  key={season}
                  type="button"
                  onClick={() => {
                    setSelectedSeason(isSelected ? 'all' : season);
                    setSelectedMonth('all');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? `${cfg.badgeClass} ring-2 ring-blue-500/30 font-black`
                      : 'border-transparent bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {season}
                </button>
              );
            })}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={onlyMandatory}
                onChange={(e) => setOnlyMandatory(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className={onlyMandatory ? 'text-rose-600 font-bold' : ''}>فقط مهلت‌های الزامی</span>
            </label>

            {(selectedDept !== 'all' || selectedSeason !== 'all' || selectedMonth !== 'all' || searchQuery || onlyMandatory) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('all');
                  setSelectedSeason('all');
                  setSelectedMonth('all');
                  setSearchQuery('');
                  setOnlyMandatory(false);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                بازنشانی فیلترها
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Views Container */}
      {filteredProcesses.length === 0 ? (
        <div 
          className="rounded-3xl p-12 text-center border glass-panel space-y-4"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CalendarClock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              فرایندی با این مشخصات زمان‌بندی یافت نشد
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              فیلترهای انتخابی یا عبارت جستجو را تغییر دهید، یا از بخش داشبورد تقویم اجرایی فرایندهای جدید را ثبت فرمایید.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDept('all');
              setSelectedSeason('all');
              setSelectedMonth('all');
              setSearchQuery('');
              setOnlyMandatory(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            مشاهده تمام فرایندهای زمان‌بندی‌شده
          </button>
        </div>
      ) : viewMode === 'matrix' ? (
        /* View 1: 12-Month Matrix View */
        <div className="space-y-8">
          {(['بهار', 'تابستان', 'پاییز', 'زمستان'] as PersianSeason[]).map((season) => {
            const seasonCfg = SEASON_CONFIG[season];
            const seasonMonths = PERSIAN_MONTHS.filter(m => m.season === season);
            
            // If filtering by season, hide other seasons
            if (selectedSeason !== 'all' && selectedSeason !== season) {
              return null;
            }

            return (
              <div 
                key={season} 
                className="space-y-4 rounded-3xl p-5 sm:p-6 border glass-panel"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-glass-card)' }}
              >
                {/* Season Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${seasonCfg.badgeClass}`}>
                      {seasonCfg.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      (ماه‌های {seasonMonths.map(m => m.name).join('، ')})
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 font-mono">
                    <span dir="ltr">
                      \u200E{seasonMonths.reduce((acc, m) => acc + (processesByMonth.get(m.name)?.length || 0), 0)}
                    </span>{' '}
                    فرایند
                  </span>
                </div>

                {/* 3 Months Columns in Season */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {seasonMonths.map((m) => {
                    const monthProcesses = processesByMonth.get(m.name) || [];
                    const isCurrent = m.name === currentMonth;
                    const isMonthFiltered = selectedMonth === m.name;

                    if (selectedMonth !== 'all' && selectedMonth !== m.name) {
                      return null;
                    }

                    return (
                      <div
                        key={m.name}
                        className={`rounded-2xl p-4 border flex flex-col transition-all duration-200 ${
                          isCurrent
                            ? 'ring-2 ring-blue-500/40 border-blue-500/40 bg-blue-500/[0.03] dark:bg-blue-500/[0.06]'
                            : 'border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40'
                        }`}
                      >
                        {/* Month Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                              {m.name}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                                ماه جاری
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            <span dir="ltr">\u200E{monthProcesses.length}</span>
                          </span>
                        </div>

                        {/* Month Process Cards */}
                        <div className="space-y-3 flex-1">
                          {monthProcesses.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                              فرایندی در این ماه برنامه‌ریزی نشده است
                            </div>
                          ) : (
                            monthProcesses.map((p) => (
                              <ProcessScheduleCard 
                                key={p.id} 
                                process={p} 
                                isCurrentMonth={isCurrent}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: Chronological Stream View */
        <div className="space-y-4">
          {filteredProcesses.map((p) => (
            <ProcessScheduleRow 
              key={p.id} 
              process={p} 
              isCurrentMonth={p.schedule?.month === currentMonth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Card component for displaying a scheduled process inside the Month Matrix
 */
function ProcessScheduleCard({
  process,
  isCurrentMonth,
}: {
  process: Process;
  isCurrentMonth: boolean;
}) {
  const schedule = process.schedule!;

  return (
    <div 
      className="p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 space-y-2.5"
      style={{
        background: 'var(--bg-surface)',
        borderColor: schedule.isMandatory ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-subtle)',
      }}
    >
      {/* Top Header: Timing & Priority */}
      <div className="flex items-center justify-between gap-2">
        <span 
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
        >
          <CalendarDays className="w-3 h-3" />
          <span>{schedule.timeframeLabel || `ماه ${schedule.month}`}</span>
        </span>

        {schedule.deadlineDays && (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          >
            <Timer className="w-3 h-3" />
            <span>
              مهلت:{' '}
              <span dir="ltr" className="font-mono inline-block">
                \u200E{schedule.deadlineDays}
              </span>{' '}
              روز
            </span>
          </span>
        )}
      </div>

      {/* Process Title */}
      <Link 
        href={`/process/${process.slug}`}
        className="block font-bold text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {process.title}
      </Link>

      {/* Meta tags: Department and System */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Building2 className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[130px]">{process.departmentName}</span>
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <Laptop className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[130px]">{process.targetSystem}</span>
        </span>
      </div>

      {/* Mandatory & Notes notice */}
      {schedule.notes && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic bg-slate-100/60 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
          {schedule.notes}
        </p>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
        <Link
          href={`/process/${process.slug}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>راهنمای اجرا</span>
          <ArrowLeft className="w-3 h-3" />
        </Link>

        {process.targetUrl && (
          <a
            href={process.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="ورود مستقیم به سامانه"
          >
            <span>ورود به سامانه</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Row component for chronological stream view
 */
function ProcessScheduleRow({
  process,
  isCurrentMonth,
}: {
  process: Process;
  isCurrentMonth: boolean;
}) {
  const schedule = process.schedule!;

  return (
    <div 
      className={`rounded-2xl p-4 sm:p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md ${
        isCurrentMonth 
          ? 'border-blue-500/40 bg-blue-500/[0.02] dark:bg-blue-500/[0.05]'
          : 'glass-panel'
      }`}
      style={{
        borderColor: schedule.isMandatory ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-subtle)',
        background: 'var(--bg-glass-card)',
      }}
    >
      {/* Timing badge & info */}
      <div className="flex items-start sm:items-center gap-3">
        <div 
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
            isCurrentMonth 
              ? 'bg-amber-500 text-white border-amber-600 shadow-md animate-pulse'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          }`}
        >
          <span className="text-[10px] font-bold leading-none">{schedule.month}</span>
          <span className="text-xs font-black font-mono leading-none mt-1">
            <span dir="ltr">\u200E{schedule.startDay || 1}</span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {schedule.timeframeLabel || `ماه ${schedule.month}`}
            </span>
            {schedule.deadlineDays && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                مهلت اقدام:{' '}
                <span dir="ltr" className="font-mono">
                  \u200E{schedule.deadlineDays}
                </span>{' '}
                روز
              </span>
            )}
            {schedule.isMandatory && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                الزامی و قطعی
              </span>
            )}
            {schedule.recurrence && (
              <span className="text-[10px] text-slate-400">
                • {schedule.recurrence === 'annual' ? 'سالیانه' : schedule.recurrence === 'quarterly' ? 'فصلی' : 'دوره‌ای'}
              </span>
            )}
          </div>

          <Link
            href={`/process/${process.slug}`}
            className="text-sm sm:text-base font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
            style={{ color: 'var(--text-primary)' }}
          >
            {process.title}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{process.departmentName}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>{process.targetSystem}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <span dir="ltr" className="font-mono font-bold">
                  \u200E{process.estimatedMinutes}
                </span>{' '}
                دقیقه
              </span>
            </span>
          </div>

          {schedule.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
              شیوه‌نامه: {schedule.notes}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {process.targetUrl && (
          <a
            href={process.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>ورود به سامانه</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <Link
          href={`/process/${process.slug}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all hover:scale-105"
        >
          <span>مشاهده فرایند</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
