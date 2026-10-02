'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Process, SearchResult } from '@/types/process';
import { searchProcesses, highlightMatchText } from '@/lib/search-engine';
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowLeft, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Globe, 
  Clock, 
  Tag, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface OmniSearchProps {
  processes: Process[];
  onSelectProcess: (process: Process, initialStepIndex?: number) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  { label: 'ثبت پرسنل جدید', query: 'ثبت پرسنل جدید', category: 'HR' },
  { label: 'خطای ۴۰۳', query: '۴۰۳', category: 'خطایابی' },
  { label: 'شماره شبا', query: 'شماره شبا', category: 'مالی' },
  { label: 'کلید SSH', query: 'ssh-keygen', category: 'DevOps' },
  { label: 'سامانه مودیان', query: 'سامانه مودیان', category: 'مالیات' },
  { label: 'توکن دیجیتال', query: 'توکن دیجیتال', category: 'امنیت' },
];

export function OmniSearch({ processes, onSelectProcess, inputRef }: OmniSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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

  // Deep omni-search calculations with relevance ranking
  const searchResults: SearchResult[] = useMemo(() => {
    return searchProcesses(processes, query);
  }, [processes, query]);

  const hasQuery = query.trim().length > 0;

  // Match type visual badge helper
  const renderMatchBadge = (match: SearchResult['bestMatch']) => {
    switch (match.type) {
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
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="جستجوی همه‌جانبه (مانند گوگل): نام فرایند، کد خطا (مثل ۴۰۳)، شماره شبا، نام سامانه یا مرحله..."
            className="w-full bg-transparent border-none outline-none text-base sm:text-lg font-medium placeholder:text-slate-400"
            style={{ color: 'var(--text-primary)' }}
            aria-label="جستجوی هوشمند در فرایندها"
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

        {/* Quick Suggestion Pills */}
        <div className="px-4 sm:px-6 py-2.5 border-t flex items-center flex-wrap gap-2 text-xs"
          style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
        >
          <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            جستجوهای پرتکرار:
          </span>
          {POPULAR_SEARCH_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(item.query);
                activeInputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg transition-all duration-200 font-medium cursor-pointer hover:scale-105 active:scale-95"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)'
              }}
            >
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
          {/* Results Summary Header */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-card)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>نتایج هوشمند جستجو</span>
              <span className="px-2 py-0.5 rounded-full text-[11px]"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
              >
                {searchResults.length} فرایند منطبق
              </span>
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              مرتب‌شده بر اساس حداکثر ارتباط با کلیدواژه (Relevance Score)
            </span>
          </div>

          {/* Results List */}
          <div className="divide-y max-h-[60vh] overflow-y-auto" style={{ borderColor: 'var(--border-glass)' }}>
            {searchResults.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500 opacity-80" />
                <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  هیچ نتیجه‌ای یافت نشد
                </h4>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  عبارتی با عنوان «{query}» در متن فرایندها، مراحل، فیلدها یا خطایابی‌ها پیدا نشد. لطفاً از کلمات کلیدی عام‌تر یا کد ارور استفاده فرمایید.
                </p>
              </div>
            ) : (
              searchResults.map((result) => {
                const { process, score, bestMatch } = result;
                return (
                  <div
                    key={process.id}
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

                      {/* Score Indicator & Step count */}
                      <div className="flex items-center gap-2 self-start sm:self-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {process.estimatedMinutes} دقیقه
                        </span>
                        <span>•</span>
                        <span>{process.totalSteps} مرحله</span>
                      </div>
                    </div>

                    {/* Google-like Contextual Match Snippet (Crucial for the user!) */}
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
