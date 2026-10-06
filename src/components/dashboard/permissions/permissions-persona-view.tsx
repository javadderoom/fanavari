'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Settings2, 
  FileText, 
  Sparkles, 
  Eye, 
  ShieldAlert, 
  Globe, 
  Building2, 
  Tag, 
  KeyRound,
  ArrowRight,
  Info
} from 'lucide-react';
import { Process, InformationPost } from '@/types/process';
import { 
  SimulatedPersona, 
  CatalogItemType, 
  FilterAccessStatus, 
  evaluateItemAccess, 
  AccessEvaluation 
} from './types';

interface PermissionsPersonaViewProps {
  processes: Process[];
  posts: InformationPost[];
  selectedPersona: SimulatedPersona;
  onOpenProcessAccess: (process: Process) => void;
  onOpenPostAccess: (post: InformationPost) => void;
}

export function PermissionsPersonaView({
  processes,
  posts,
  selectedPersona,
  onOpenProcessAccess,
  onOpenPostAccess,
}: PermissionsPersonaViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<CatalogItemType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterAccessStatus>('all');
  const [viewMode, setViewMode] = useState<'audit' | 'strict'>('audit');

  // Evaluate every item against the active simulated persona
  const evaluatedCatalog = useMemo(() => {
    const list: Array<{
      type: 'process' | 'post';
      rawProcess?: Process;
      rawPost?: InformationPost;
      id: string;
      title: string;
      slug: string;
      summary?: string;
      departmentName?: string;
      category?: string;
      visibility: string;
      evaluation: AccessEvaluation;
    }> = [];

    // Processes
    processes.forEach((proc) => {
      const evaluation = evaluateItemAccess(
        {
          visibility: proc.visibility,
          authorId: proc.authorId,
          accessGrants: proc.accessGrants || [],
        },
        selectedPersona
      );

      list.push({
        type: 'process',
        rawProcess: proc,
        id: proc.id,
        title: proc.title,
        slug: proc.slug,
        summary: proc.description,
        departmentName: proc.departmentName,
        category: proc.category,
        visibility: proc.visibility || 'public',
        evaluation,
      });
    });

    // Information Posts
    posts.forEach((post) => {
      const evaluation = evaluateItemAccess(
        {
          visibility: post.visibility,
          authorId: post.authorId,
          accessGrants: post.accessGrants || [],
        },
        selectedPersona
      );

      list.push({
        type: 'post',
        rawPost: post,
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary || post.content.slice(0, 150),
        departmentName: post.departmentName || undefined,
        category: post.type,
        visibility: post.visibility || 'public',
        evaluation,
      });
    });

    return list;
  }, [processes, posts, selectedPersona]);

  // Filter based on search query, type, and access status
  const filteredCatalog = useMemo(() => {
    return evaluatedCatalog.filter((item) => {
      // Type filter
      if (itemTypeFilter === 'process' && item.type !== 'process') return false;
      if (itemTypeFilter === 'information' && item.type !== 'post') return false;

      // In strict mode, restricted/inaccessible items are completely hidden (Zero-Leak simulation)
      if (viewMode === 'strict' && !item.evaluation.isAccessible) return false;

      // Status filter in audit mode
      if (viewMode === 'audit') {
        if (statusFilter === 'accessible' && !item.evaluation.isAccessible) return false;
        if (statusFilter === 'restricted' && item.evaluation.isAccessible) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = (item.summary || '').toLowerCase().includes(q);
        const matchesDept = (item.departmentName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesDept) return false;
      }

      return true;
    });
  }, [evaluatedCatalog, itemTypeFilter, statusFilter, viewMode, searchQuery]);

  // Aggregate stats
  const totalAccessibleCount = evaluatedCatalog.filter((i) => i.evaluation.isAccessible).length;
  const totalRestrictedCount = evaluatedCatalog.filter((i) => !i.evaluation.isAccessible).length;

  return (
    <div className="space-y-6">
      {/* Search & Mode Bar */}
      <div 
        className="glass-panel-strong rounded-3xl p-5 border shadow-sm space-y-4"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Omni Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تست شبیه‌سازی جستجو در این هویت (مثلاً: ثبت‌نام، سنجش، شاد، بیمه...)"
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-900 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'audit'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>نمای حسابرسی (تمام اسناد + وضعیت)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('strict')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'strict'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>نمای واقعی کاربر (Zero-Leak)</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-bold ml-1">نوع سند:</span>
            <button
              type="button"
              onClick={() => setItemTypeFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                itemTypeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              همه ({evaluatedCatalog.length})
            </button>
            <button
              type="button"
              onClick={() => setItemTypeFilter('process')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                itemTypeFilter === 'process'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              فرایندها و SOPها ({processes.length})
            </button>
            <button
              type="button"
              onClick={() => setItemTypeFilter('information')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                itemTypeFilter === 'information'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              بخشنامه‌ها و اطلاعیه‌ها ({posts.length})
            </button>
          </div>

          {/* Status Filter (only active in audit mode) */}
          {viewMode === 'audit' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold ml-1">وضعیت دسترسی:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                همه وضعیت‌ها
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('accessible')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'accessible'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                مجاز ({totalAccessibleCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('restricted')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'restricted'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                }`}
              >
                مسدود ({totalRestrictedCount})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {filteredCatalog.length === 0 ? (
        <div 
          className="rounded-3xl p-12 text-center border bg-slate-50/50 dark:bg-slate-900/30"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
            {viewMode === 'strict'
              ? 'هیچ سندی با معیارهای این کاربر یا جستجوی فعلی قابل مشاهده نیست'
              : 'موردی مطابق با فیلترهای انتخابی یافت نشد'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {viewMode === 'strict'
              ? 'سیاست امنیتی Zero-Leak کلیه اسناد محدودشده را از نتایج این هویت حذف کرده است.'
              : 'عبارت جستجو یا فیلتر دسترسی را تغییر دهید.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((item) => {
            const isAccessible = item.evaluation.isAccessible;
            const evalInfo = item.evaluation;

            return (
              <div
                key={`${item.type}-${item.id}`}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isAccessible
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md'
                    : 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20 opacity-85 hover:opacity-100'
                }`}
              >
                {/* Access Clearance Banner */}
                <div className="mb-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                        isAccessible
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isAccessible ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>مجاز ({evalInfo.level === 'ADMIN' ? 'مدیر ارشد' : evalInfo.level === 'MANAGER' ? 'مدیریت' : evalInfo.level === 'OPERATOR' ? 'عملیاتی' : 'مشاهده'})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>مسدود (Zero-Leak)</span>
                        </>
                      )}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.type === 'process' ? '⚙️ فرایند' : '📢 بخشنامه'}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{evalInfo.reasonLabel}</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-2 mb-4">
                  <h4 
                    className="font-black text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </h4>

                  {item.summary && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500">
                    {item.departmentName && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{item.departmentName}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.visibility === 'public' ? (
                        <>
                          <Globe className="w-3 h-3 text-emerald-500" />
                          <span>عمومی</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>محدودشده</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <a
                    href={item.type === 'process' ? `/process/${item.slug}` : `/information/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    <span>مشاهده صفحه</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === 'process' && item.rawProcess) {
                        onOpenProcessAccess(item.rawProcess);
                      } else if (item.type === 'post' && item.rawPost) {
                        onOpenPostAccess(item.rawPost);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>تنظیم دسترسی</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
