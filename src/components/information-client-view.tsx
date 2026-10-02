'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  FileText,
  BookOpen,
  HelpCircle,
  Pin,
  Search,
  Building2,
  Laptop,
  ArrowLeft,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Sparkles,
  Filter
} from 'lucide-react';
import { InformationPost, InformationType, OrganizationEntity, SystemTool } from '@/types/process';

interface InformationClientViewProps {
  initialPosts: InformationPost[];
  departments: OrganizationEntity[];
  systems: SystemTool[];
}

const TYPE_FILTERS: { key: string; label: string; icon: any }[] = [
  { key: 'all', label: 'همه مطالب', icon: Sparkles },
  { key: 'announcement', label: 'اطلاعیه‌های رسمی', icon: Megaphone },
  { key: 'circular', label: 'بخشنامه‌ها و دستورالعمل‌ها', icon: FileText },
  { key: 'guide', label: 'معرفی سامانه‌ها و راهنما', icon: BookOpen },
  { key: 'article', label: 'پایگاه دانش و مقالات', icon: HelpCircle },
];

export function InformationClientView({
  initialPosts,
  departments,
  systems,
}: InformationClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((item) => {
      // Type filter
      if (activeType !== 'all' && item.type !== activeType) return false;

      // Department filter
      if (selectedDept !== 'all') {
        if (item.departmentSlug !== selectedDept && item.departmentId !== selectedDept) {
          return false;
        }
      }

      // System filter
      if (selectedSystem !== 'all') {
        if (item.systemToolSlug !== selectedSystem && item.systemToolId !== selectedSystem) {
          return false;
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        item.content.toLowerCase().includes(q) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(q)) ||
        (item.systemToolName && item.systemToolName.toLowerCase().includes(q)) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [initialPosts, activeType, selectedDept, selectedSystem, searchQuery]);

  const pinnedPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.isPinned);
  }, [filteredPosts]);

  const regularPosts = useMemo(() => {
    return filteredPosts.filter((p) => !p.isPinned);
  }, [filteredPosts]);

  const getTypeMeta = (type: InformationType) => {
    switch (type) {
      case 'circular':
        return {
          label: 'بخشنامه و ابلاغیه',
          icon: FileText,
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        };
      case 'guide':
        return {
          label: 'معرفی سامانه و راهنما',
          icon: BookOpen,
          badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
        };
      case 'article':
        return {
          label: 'پایگاه دانش / مقاله',
          icon: HelpCircle,
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        };
      default:
        return {
          label: 'اطلاعیه رسمی',
          icon: Megaphone,
          badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
        };
    }
  };

  const getPriorityMeta = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'فوری / بااهمیت',
          badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse',
          isUrgent: true,
        };
      case 'high':
        return {
          label: 'مهم',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          isUrgent: false,
        };
      default:
        return {
          label: 'عادی',
          badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
          isUrgent: false,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div
        className="glass-panel-strong rounded-3xl p-5 sm:p-6 border shadow-lg space-y-4"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، متن بخشنامه‌ها، راهنماها یا سامانه‌ها..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm border outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Department & System Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-secondary)',
                }}
              >
                <option value="all">همه سازمان‌ها</option>
                {departments.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-secondary)',
                }}
              >
                <option value="all">همه سامانه‌ها</option>
                {systems.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            const isSelected = activeType === f.key;
            const count =
              f.key === 'all'
                ? initialPosts.length
                : initialPosts.filter((p) => p.type === f.key).length;

            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveType(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Announcements Section */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <h2 className="text-sm font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              اطلاعیه‌های برگزیده و مهم (سنجاق‌شده)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedPosts.map((post) => {
              const typeMeta = getTypeMeta(post.type);
              const priorityMeta = getPriorityMeta(post.priority);
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={post.id || post.slug}
                  className="glass-card rounded-2xl p-5 border relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between"
                  style={{
                    borderColor: priorityMeta.isUrgent ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-glass)',
                    background: priorityMeta.isUrgent
                      ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), var(--bg-surface))'
                      : 'var(--bg-surface)',
                  }}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeMeta.badgeBg}`}>
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeMeta.label}</span>
                        </span>

                        {post.priority !== 'normal' && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${priorityMeta.badgeBg}`}>
                            {priorityMeta.isUrgent && <AlertTriangle className="w-3 h-3" />}
                            <span>{priorityMeta.label}</span>
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400" dir="ltr">
                        <Calendar className="w-3 h-3" />
                        <span>{'\u200E' + new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/information/${post.slug}`}
                      className="text-base font-black hover:text-indigo-600 transition-colors line-clamp-2 block mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {post.title}
                    </Link>

                    {/* Summary */}
                    {post.summary && (
                      <p className="text-xs line-clamp-2 leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {post.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t flex items-center justify-between text-xs mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.departmentName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Building2 className="w-3 h-3" />
                          <span>{post.departmentName}</span>
                        </span>
                      )}
                      {post.systemToolName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                          <Laptop className="w-3 h-3" />
                          <span>{post.systemToolName}</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/information/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <span>مشاهده کامل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Posts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            فهرست مطالب و بخشنامه‌ها ({regularPosts.length})
          </h2>
        </div>

        {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl p-8">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              مطلبی با این مشخصات یافت نشد
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              فیلترهای انتخابی یا عبارت جستجو را تغییر دهید تا سایر اطلاعیه‌ها و بخشنامه‌ها نمایش داده شوند.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularPosts.map((post) => {
              const typeMeta = getTypeMeta(post.type);
              const priorityMeta = getPriorityMeta(post.priority);
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={post.id || post.slug}
                  className="glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    borderColor: 'var(--border-glass)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeMeta.badgeBg}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeMeta.label}</span>
                      </span>

                      {post.priority !== 'normal' && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityMeta.badgeBg}`}>
                          {priorityMeta.isUrgent && <AlertTriangle className="w-3 h-3" />}
                          <span>{priorityMeta.label}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/information/${post.slug}`}
                      className="text-sm font-black hover:text-indigo-600 transition-colors line-clamp-2 block mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {post.title}
                    </Link>

                    {/* Summary */}
                    {post.summary ? (
                      <p className="text-xs line-clamp-2 leading-relaxed mb-4 text-slate-500">
                        {post.summary}
                      </p>
                    ) : (
                      <p className="text-xs line-clamp-2 leading-relaxed mb-4 text-slate-400">
                        {post.content.slice(0, 110)}...
                      </p>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t flex items-center justify-between text-xs mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                      {post.departmentName && (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 line-clamp-1 max-w-[120px]">
                          {post.departmentName}
                        </span>
                      )}
                      {!post.departmentName && post.systemToolName && (
                        <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 line-clamp-1 max-w-[120px]">
                          {post.systemToolName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                        {'\u200E' + new Date(post.publishedAt).toLocaleDateString('fa-IR')}
                      </span>
                      <Link
                        href={`/information/${post.slug}`}
                        className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="مشاهده کامل"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
