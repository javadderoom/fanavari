'use client';

import React, { useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { UiSnippet } from '@/types/process';

interface UiSnippetCardProps {
  snippet: UiSnippet;
  /** Height of the image box, e.g. 'h-28'. Width is always full. */
  imageHeightClass?: string;
  className?: string;
}

/**
 * Full-bleed guide button/icon card.
 * The image takes the entire box; title/badge/description are only
 * rendered as a fallback when the image URL is missing or fails to load.
 */
export function UiSnippetCard({
  snippet,
  imageHeightClass = 'h-28',
  className = '',
}: UiSnippetCardProps) {
  const [failed, setFailed] = useState(false);

  if (!snippet.iconUrl || failed) {
    return (
      <div
        className={`p-3 rounded-xl border flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${className}`}
        title={snippet.title}
      >
        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <MousePointerClick className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {snippet.title}
            </span>
            {snippet.badgeText && (
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                dir="ltr"
              >
                {snippet.badgeText}
              </span>
            )}
          </div>
          {snippet.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {snippet.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs ${className}`}
      title={snippet.title}
    >
      <img
        src={snippet.iconUrl}
        alt={snippet.title}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className={`w-full ${imageHeightClass} object-contain select-none`}
      />
    </div>
  );
}
