'use client';

import React, { useState } from 'react';
import { 
  MousePointerClick, 
  Plus, 
  Trash2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UiSnippet } from '@/types/process';
import { ImageSnippetModal } from '@/components/image-snippet-modal';

interface StepUiSnippetsProps {
  snippets: UiSnippet[];
  onAddSnippet: (snippet: UiSnippet, insertInlineMarkdown?: boolean) => void;
  onRemoveSnippet: (index: number) => void;
}

export function StepUiSnippets({
  snippets,
  onAddSnippet,
  onRemoveSnippet,
}: StepUiSnippetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            المان‌ها و دکمه‌های هدف کلیک (عکس‌های ریز WebP)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            (<span dir="ltr">{snippets.length}</span>)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>+ دکمه/آیکون جدید</span>
        </button>
      </div>

      {snippets.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          دکمه یا آیکون تصویری برای این مرحله ثبت نشده است. می‌توانید دکمه‌هایی مانند «تایید نهایی»، «جستجو» یا «چاپ» را به عنوان عکس ریز ثبت فرمایید تا اپراتور بلافاصله آن را تشخیص دهد.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {snippets.map((snippet, idx) => (
            <div
              key={snippet.id || idx}
              className="flex items-center justify-between gap-2 p-2 rounded-xl border bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-2xs group hover:border-amber-400/50 transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={snippet.iconUrl}
                    alt={snippet.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {snippet.title}
                    </span>
                    {snippet.badgeText && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0" dir="ltr">
                        {snippet.badgeText}
                      </span>
                    )}
                  </div>
                  {snippet.description && (
                    <span className="text-[10px] text-slate-400 truncate block">
                      {snippet.description}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveSnippet(idx)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                title="حذف این المان"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ImageSnippetModal
          isOpen={isModalOpen}
          mode="snippet"
          onClose={() => setIsModalOpen(false)}
          onSnippetSaved={(newSnippet, insertInline) => {
            onAddSnippet(newSnippet, insertInline);
          }}
        />
      )}
    </div>
  );
}
