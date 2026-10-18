'use client';

import React from 'react';
import Link from 'next/link';
import { Process } from '@/types/process';
import { Layers, ShieldAlert, ArrowLeft, ExternalLink, Sparkles, Laptop, Building2, Globe, Eye, Bookmark, Users, Workflow } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';

interface ProcessCardProps {
  process: Process;
  onSelect?: (process: Process) => void;
}

export function ProcessCard({ process, onSelect }: ProcessCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(process.id);
  const errorCount = process.steps.reduce((acc, step) => acc + (step.errorGuides?.length || 0), 0);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      // If modal preview is desired, we can call onSelect, but the card defaults to dedicated page
      onSelect(process);
    }
  };

  return (
    <Link
      href={`/process/${process.slug}`}
      onClick={handleClick}
      className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 relative overflow-hidden block"
    >
      {/* Popular Glow Indicator */}
      {process.isPopular && (
        <div className="absolute top-0 left-0">
          <div className="flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-br-2xl text-amber-600 bg-amber-500/10 border-b border-r border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>پرمراجعه</span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {process.scope === 'software' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1">
                <Laptop className="w-3 h-3" />
                <span>نرم‌افزار</span>
              </span>
            ) : process.scope === 'portal' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>سامانه برخط</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>سازمانی</span>
              </span>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-xl font-bold"
              style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-border)'
              }}
            >
              {process.departmentName}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(process.id, process.title);
            }}
            aria-label={bookmarked ? 'حذف از نشان‌شده‌ها' : 'افزودن به نشان‌شده‌ها'}
            title={bookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن این فرایند'}
            className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 active:scale-90 ${
              bookmarked
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 transition-transform duration-200 ${bookmarked ? 'fill-current scale-110' : ''}`} />
          </button>
        </div>

        {/* Process Title */}
        <h3 className="text-base sm:text-lg font-black leading-snug mb-2 group-hover:text-blue-600 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {process.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {process.description}
        </p>
      </div>

      {/* Card Footer / Metadata */}
      <div>
        {/* System Tag & Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-4 pt-3 border-t text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span className="px-2 py-0.5 rounded-md font-medium truncate max-w-[190px]"
            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
            title={process.targetSystem}
          >
            {process.targetSystem}
          </span>

          {process.audience && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold truncate max-w-[180px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
              title={`مخاطب: ${process.audience}`}
            >
              <Users className="w-3 h-3 shrink-0" />
              <span className="truncate">{process.audience}</span>
            </span>
          )}

          {process.nextProcessId && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              title="این فرایند به صورت زنجیره‌ای به مرحله بعدی متصل است"
            >
              <Workflow className="w-3 h-3 shrink-0" />
              <span>زنجیره‌ای</span>
            </span>
          )}

          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold"
            style={{ background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)' }}
          >
            <Layers className="w-3 h-3" />
            {process.totalSteps} گام
          </span>

          {errorCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold"
              style={{ background: 'var(--badge-rose-bg)', color: 'var(--badge-rose-text)' }}
            >
              <ShieldAlert className="w-3 h-3" />
              {errorCount} خطا
            </span>
          )}

          {typeof process.viewCount === 'number' && process.viewCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold"
              style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
              title="تعداد دفعات مشاهده"
            >
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{process.viewCount.toLocaleString('fa-IR')}</span>
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-blue-600 group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
            <span>مشاهده صفحه کامل و فلوچارت</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>

          {process.targetUrl && (
            <span className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition-colors" title="سامانه برخط">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
