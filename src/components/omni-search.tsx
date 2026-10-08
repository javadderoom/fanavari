'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Process, SearchResult, InformationPost } from '@/types/process';
import { searchOmni } from '@/lib/search-engine';
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowLeft, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Globe, 
  Tag, 
  CheckCircle2, 
  ExternalLink,
  Megaphone,
  Lightbulb,
  Pin,
  Calendar,
  Filter
} from 'lucide-react';

interface OmniSearchProps {
  processes: Process[];
  announcements?: InformationPost[];
  onSelectProcess: (process: Process, initialStepIndex?: number) => void;
  onSelectAnnouncement?: (post: InformationPost) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function OmniSearch({ 
  processes, 
  announcements = [], 
  onSelectProcess, 
  onSelectAnnouncement,
  inputRef 
}: OmniSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'processes' | 'announcements'>('all');
  const internalInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = inputRef || internalInputRef;

  // Listen for '/' or Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        activeInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        activeInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInputRef, isFocused]);

  // Deep omni-search calculations with relevance ranking across processes & announcements
  const allSearchResults: SearchResult[] = useMemo(() => {
    return searchOmni(processes, announcements, query);
  }, [processes, announcements, query]);

  // Filter results according to active tab
  const filteredResults = useMemo(() => {
    if (activeFilter === 'processes') {
      return allSearchResults.filter(r => r.itemType !== 'information');
    }
    if (activeFilter === 'announcements') {
      return allSearchResults.filter(r => r.itemType === 'information');
    }
    return allSearchResults;
  }, [allSearchResults, activeFilter]);

  const processMatchCount = useMemo(() => {
    return allSearchResults.filter(r => r.itemType !== 'information').length;
  }, [allSearchResults]);

  const announcementMatchCount = useMemo(() => {
    return allSearchResults.filter(r => r.itemType === 'information').length;
  }, [allSearchResults]);

  const hasQuery = query.trim().length > 0;

  // Real-data dynamic suggestions aggregated from loaded processes & announcements
  const dynamicSuggestions = useMemo(() => {
    const suggestions: { label: string; query: string; category: string }[] = [];
    const seenQueries = new Set<string>();

    const addSuggestion = (label: string, searchKey: string, category: string) => {
      const q = searchKey.trim().toLowerCase();
      if (!q || seenQueries.has(q)) return;
      seenQueries.add(q);
      suggestions.push({ label, query: searchKey, category });
    };

    // 1. Real error codes present in processes
    for (const proc of processes) {
      for (const step of proc.steps || []) {
        for (const err of step.errorGuides || []) {
          if (err.errorCode && err.errorCode.length >= 3) {
            addSuggestion(`خطای ${err.errorCode}`, err.errorCode, 'کد خطا');
            if (suggestions.length >= 2) break;
          }
        }
        if (suggestions.length >= 2) break;
      }
      if (suggestions.length >= 2) break;
    }

    // 2. Real systems present in processes
    const systems = Array.from(new Set(processes.map(p => p.targetSystem).filter(Boolean)));
    for (const sys of systems) {
      addSuggestion(`سامانه ${sys}`, sys, 'سامانه');
      if (suggestions.length >= 4) break;
    }

    // 3. Real pinned or urgent announcements
    for (const post of announcements) {
      if (post.isPinned || post.priority === 'urgent') {
        const firstWord = post.title.split(' ')[0];
        addSuggestion(post.title, firstWord && firstWord.length > 2 ? firstWord : post.title, post.type === 'circular' ? 'بخشنامه' : 'اطلاعیه');
        if (suggestions.length >= 6) break;
      }
    }

    // 4. Common workflow keywords
    for (const proc of processes) {
      if (suggestions.length >= 6) break;
      const firstWord = proc.title.split(' ')[0];
      if (firstWord && firstWord.length > 3) {
        addSuggestion(proc.title, firstWord, proc.departmentName || 'فرایند');
      }
    }

    if (suggestions.length === 0) {
      return [
        { label: 'سامانه‌ها و پرتال‌ها', query: 'سامانه', category: 'پرتال' },
        { label: 'خطای ۴۰۳ عدم دسترسی', query: '403', category: 'خطا' },
      ];
    }

    return suggestions.slice(0, 5);
  }, [processes, announcements]);

  // Match type visual badge helper
  const renderMatchBadge = (match: SearchResult['bestMatch']) => {
    switch (match.type) {
      case 'circular':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)' }}
          >
            <FileText className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'announcement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)' }}
          >
            <Megaphone className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'tip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-amber-bg)', color: 'var(--badge-amber-text)' }}
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            {match.locationLabel}
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-rose-bg)', color: 'var(--badge-rose-text)' }}
          >
            <AlertTriangle className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'step':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)' }}
          >
            <Layers className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'field':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-amber-bg)', color: 'var(--badge-amber-text)' }}
          >
            <FileText className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)' }}
          >
            <Globe className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      case 'tag':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
          >
            <Tag className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
          >
            <CheckCircle2 className="w-3 h-3" />
            {match.locationLabel}
          </span>
        );
    }
  };

  const handleAnnouncementClick = (post: InformationPost) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(post);
    } else {
      router.push(`/information/${post.slug}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input Container */}
      <div 
        className="relative rounded-2xl transition-all duration-300 shadow-xl"
        style={{
          background: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(20px)',
          border: isFocused ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
          boxShadow: isFocused ? 'var(--accent-glow)' : 'var(--shadow-glass)',
        }}
      >
        <div className="flex items-center px-4 sm:px-6 py-3.5 sm:py-4 gap-3">
          {/* Animated Search Icon */}
          <div className="text-blue-500 flex items-center justify-center">
            <Search className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isFocused ? 'scale-110' : 'scale-100'}`} />
          </div>

          {/* Search Input */}
          <input
            ref={activeInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            placeholder="جستجوی همه‌جانبه: فرایندها، بخشنامه‌ها و اطلاعیه‌ها، کدهای خطا، فیلدها و سامانه‌ها..."
            className="w-full bg-transparent border-none outline-none text-base sm:text-lg font-medium placeholder:text-slate-400"
            style={{ color: 'var(--text-primary)' }}
            aria-label="جستجوی هوشمند در فرایندها و بخشنامه‌ها"
          />

          {/* Clear Query Button */}
          {hasQuery && (
            <button
              onClick={() => {
                setQuery('');
                activeInputRef.current?.focus();
              }}
              type="button"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="پاک کردن متن جستجو"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {/* Keyboard shortcut badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-faint)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span>میانبر</span>
            <kbd className="font-bold">/</kbd>
          </div>
        </div>

        {/* Real-Data Dynamic Quick Suggestion Pills */}
        <div className="px-4 sm:px-6 py-2.5 border-t flex items-center flex-wrap gap-2 text-xs"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            پیشنهادهای زنده:
          </span>
          {dynamicSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(item.query);
                activeInputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg transition-all duration-200 font-medium cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)'
              }}
            >
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                {item.category}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Search Results Dropdown / Panel */}
      {hasQuery && (
        <div 
          className="mt-3 rounded-2xl overflow-hidden glass-panel-strong transition-all duration-300 animate-in fade-in slide-in-from-top-2"
          style={{
            borderColor: 'var(--border-glass)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Results Summary Header & Filter Tabs */}
          <div className="px-5 py-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                نتایج هوشمند جستجو
              </span>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl border"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  همه ({allSearchResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('processes')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'processes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  فرایندها ({processMatchCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('announcements')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'announcements'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  بخشنامه‌ها و اطلاعیه‌ها ({announcementMatchCount})
                </button>
              </div>
            </div>

            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              مرتب‌شده بر اساس حداکثر ارتباط با کلیدواژه (Relevance Score)
            </span>
          </div>

          {/* Results List */}
          <div className="divide-y max-h-[60vh] overflow-y-auto" style={{ borderColor: 'var(--border-glass)' }}>
            {filteredResults.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500 opacity-80" />
                <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  هیچ نتیجه‌ای یافت نشد
                </h4>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  عبارتی با عنوان «{query}» در متن فرایندها، مراحل، بخشنامه‌ها یا خطایابی‌ها پیدا نشد. لطفاً از کلمات کلیدی عام‌تر یا کد ارور استفاده فرمایید.
                </p>
              </div>
            ) : (
              filteredResults.map((result, idx) => {
                const isAnnouncement = result.itemType === 'information';
                
                // RENDER ANNOUNCEMENT / CIRCULAR CARD
                if (isAnnouncement && result.post) {
                  const post = result.post;
                  return (
                    <div
                      key={`info-${post.id || idx}`}
                      onClick={() => handleAnnouncementClick(post)}
                      className="p-4 sm:p-5 transition-all duration-200 cursor-pointer group hover:bg-indigo-500/5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                            {post.type === 'circular' ? <FileText className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                          </span>
                          
                          <h4 className="text-base font-bold group-hover:text-indigo-600 transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {post.title}
                          </h4>

                          {/* Type Pill */}
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {post.type === 'circular' ? 'بخشنامه و دستورالعمل' : post.type === 'guide' ? 'راهنمای سامانه' : 'اطلاعیه رسمی'}
                          </span>

                          {post.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30">
                              فوری
                            </span>
                          )}

                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <Pin className="w-2.5 h-2.5 fill-amber-500" />
                              سنجاق‌شده
                            </span>
                          )}
                        </div>

                        {/* Date indicator */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono" dir="ltr">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>

                      {/* Google-like Contextual Match Snippet */}
                      <div className="mt-2.5 p-3 rounded-xl flex flex-col gap-1.5 transition-colors"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {renderMatchBadge(result.bestMatch)}
                          <span className="text-[11px] font-mono text-indigo-500">
                            ضریب ارتباط: {result.score} امتیاز
                          </span>
                        </div>

                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          <span className="text-xs font-semibold ml-1.5" style={{ color: 'var(--text-muted)' }}>
                            بخش منطبق:
                          </span>
                          «{result.bestMatch.snippet}»
                        </p>
                      </div>

                      {/* Action Hint */}
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">
                          {post.departmentName ? `مرجع: ${post.departmentName}` : 'مرکز بخشنامه‌ها و پایگاه اطلاعات'}
                        </span>
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-[-4px] transition-transform">
                          <span>مطالعه کامل بخشنامه / اطلاعیه</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                }

                // RENDER PROCESS CARD
                const process = result.process!;
                const { score, bestMatch } = result;
                return (
                  <div
                    key={`proc-${process.id || idx}`}
                    onClick={() => onSelectProcess(process, bestMatch.stepIndex)}
                    className="p-4 sm:p-5 transition-all duration-200 cursor-pointer group hover:bg-blue-500/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        {/* Process Title */}
                        <h4 className="text-base font-bold group-hover:text-blue-600 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {process.title}
                        </h4>
                        {/* Department Badge */}
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                        >
                          {process.departmentName}
                        </span>
                      </div>

                      {/* Step count */}
                      <div className="flex items-center gap-2 self-start sm:self-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{process.totalSteps} مرحله</span>
                      </div>
                    </div>

                    {/* Google-like Contextual Match Snippet */}
                    <div className="mt-2.5 p-3 rounded-xl flex flex-col gap-1.5 transition-colors"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {renderMatchBadge(bestMatch)}
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-faint)' }}>
                          ضریب ارتباط: {score} امتیاز
                        </span>
                      </div>

                      {/* Highlighted text snippet */}
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-xs font-semibold ml-1.5" style={{ color: 'var(--text-muted)' }}>
                          بخش منطبق:
                        </span>
                        «{bestMatch.snippet}»
                      </p>
                    </div>

                    {/* Action Hint Row */}
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span>سامانه: {process.targetSystem}</span>
                        {process.targetUrl && (
                          <span className="inline-flex items-center gap-0.5 text-blue-500">
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-[-4px] transition-transform">
                        <span>مشاهده نقشه فرایند</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
