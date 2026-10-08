'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  AlertTriangle, 
  Pin, 
  ExternalLink, 
  Workflow, 
  Laptop, 
  FileText,
  Building2,
  Info
} from 'lucide-react';

interface StepContentRendererProps {
  content: string;
  tips?: string[];
  className?: string;
  isPrintView?: boolean;
}

/**
 * Parses inline markdown links, images, and formatting:
 * - [text](/process/slug) -> Next.js Link with icon
 * - [text](/systems/slug) -> Next.js Link with portal icon
 * - [text](/information/slug) -> Next.js Link with announcement icon
 * - [text](https://...) -> External link with ExternalLink icon
 * - ![alt](url) -> Inline / embedded image
 * - **bold** and `code`
 */
function renderInlineFormattedText(text: string, isPrintView = false): React.ReactNode[] {
  // Regex to match:
  // 1: Images ![alt](url)
  // 2: Links [text](url)
  // 3: Inline code `code`
  // 4: Bold **text**
  const regex = /(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    const fullMatch = match[0];

    // Image ![alt](url)
    if (fullMatch.startsWith('![')) {
      const alt = match[2];
      const url = match[3];
      const isIconSnippet = alt.startsWith('icon:') || alt.startsWith('ui:');

      if (isIconSnippet) {
        const label = alt.replace(/^(icon|ui):/, '').trim();
        nodes.push(
          <span key={`img-${matchIndex}`} className="inline-block my-1.5 align-middle">
            <img
              src={url}
              alt={label || 'دکمه راهنما'}
              title={label}
              className="rounded-xl border shadow-xs max-h-64 object-contain inline-block"
              style={{ borderColor: 'var(--border-glass)' }}
              loading="lazy"
            />
          </span>
        );
      } else {
        nodes.push(
          <span key={`img-${matchIndex}`} className="inline-block my-1.5 align-middle">
            <img
              src={url}
              alt={alt || 'تصویر راهنما'}
              className="rounded-xl border shadow-xs max-h-64 object-contain inline-block"
              style={{ borderColor: 'var(--border-glass)' }}
              loading="lazy"
            />
          </span>
        );
      }
    }
    // Link [text](url)
    else if (fullMatch.startsWith('[')) {
      const linkText = match[2];
      const url = match[3];

      const isInternalProcess = url.startsWith('/process');
      const isInternalSystem = url.startsWith('/system');
      const isInternalInfo = url.startsWith('/information');
      const isInternalOrg = url.startsWith('/organization');
      const isInternal = isInternalProcess || isInternalSystem || isInternalInfo || isInternalOrg || url.startsWith('/');

      if (isPrintView) {
        // High-contrast clean rendering for print
        nodes.push(
          <span key={`link-${matchIndex}`} className="font-bold underline text-blue-900">
            {linkText}
          </span>
        );
      } else if (isInternal) {
        let badgeIcon = <Workflow className="w-3 h-3 text-blue-500 shrink-0" />;
        let badgeBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';

        if (isInternalSystem) {
          badgeIcon = <Laptop className="w-3 h-3 text-purple-500 shrink-0" />;
          badgeBg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        } else if (isInternalInfo) {
          badgeIcon = <FileText className="w-3 h-3 text-emerald-500 shrink-0" />;
          badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        } else if (isInternalOrg) {
          badgeIcon = <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />;
          badgeBg = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
        }

        nodes.push(
          <Link
            key={`link-${matchIndex}`}
            href={url}
            className={`inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md text-xs font-bold border transition-all hover:scale-105 hover:underline shadow-xs ${badgeBg}`}
          >
            {badgeIcon}
            <span>{linkText}</span>
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={`link-${matchIndex}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-bold mx-0.5"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
    }
    // Inline code `code`
    else if (match[4]) {
      const codeText = match[5];
      nodes.push(
        <code
          key={`code-${matchIndex}`}
          className="px-1.5 py-0.5 mx-1 rounded-md text-xs font-mono font-bold"
          style={{ background: 'var(--bg-input)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}
        >
          {codeText}
        </code>
      );
    }
    // Bold **text**
    else if (match[6]) {
      const boldText = match[7];
      nodes.push(
        <strong key={`bold-${matchIndex}`} className="font-black text-slate-900 dark:text-slate-100">
          {boldText}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * Helper to determine if a step has meaningful, non-empty, non-placeholder content
 */
export function hasValidStepContent(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed === 'توضیحات و دستورالعمل اجرایی این گام را اینجا بنویسید...') return false;
  return true;
}

/**
 * Dedicated step content & callout renderer
 */
export function StepContentRenderer({
  content,
  tips = [],
  className = '',
  isPrintView = false,
}: StepContentRendererProps) {
  const hasContent = hasValidStepContent(content);
  const validTips = (tips || []).filter(t => t && t.trim().length > 0);

  if (!hasContent && validTips.length === 0) return null;

  // Split content by lines
  const lines = (hasContent ? content : '').split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentParagraphLines: string[] = [];

  const flushParagraph = (key: number) => {
    if (currentParagraphLines.length === 0) return;
    const textBlock = currentParagraphLines.join('\n').trim();
    if (textBlock) {
      renderedElements.push(
        <p key={`p-${key}`} className="leading-relaxed mb-3">
          {renderInlineFormattedText(textBlock, isPrintView)}
        </p>
      );
    }
    currentParagraphLines = [];
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Check for TIP Callout
    const isTip = 
      trimmed.startsWith('💡') || 
      trimmed.startsWith('> [!TIP]') || 
      trimmed.startsWith('> [!HINT]') ||
      /^نکته\s*(\([^\)]+\))?\s*:/i.test(trimmed);

    // Check for WARNING Callout
    const isWarning = 
      trimmed.startsWith('⚠️') || 
      trimmed.startsWith('> [!WARNING]') || 
      trimmed.startsWith('> [!CAUTION]') ||
      /^هشدار\s*(\([^\)]+\))?\s*:/i.test(trimmed);

    // Check for NOTE / IMPORTANT Callout
    const isNote = 
      trimmed.startsWith('📌') || 
      trimmed.startsWith('> [!NOTE]') || 
      trimmed.startsWith('> [!IMPORTANT]') ||
      /^توجه\s*(\([^\)]+\))?\s*:/i.test(trimmed);

    if (isTip || isWarning || isNote) {
      flushParagraph(lineIdx);

      // Clean the prefix
      let cleanText = trimmed
        .replace(/^(💡|> \[!TIP\]|> \[!HINT\]|⚠️|> \[!WARNING\]|> \[!CAUTION\]|📌|> \[!NOTE\]|> \[!IMPORTANT\])\s*/, '')
        .replace(/^(نکته|هشدار|توجه)\s*(\([^\)]+\))?\s*:\s*/, '')
        .trim();

      if (isTip) {
        renderedElements.push(
          <div
            key={`callout-${lineIdx}`}
            className="my-3 p-3.5 rounded-2xl flex items-start gap-3 border shadow-xs"
            style={{
              background: isPrintView ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
              borderColor: isPrintView ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-black text-amber-700 dark:text-amber-400 block mb-0.5">نکته کاربردی:</span>
              <span className="text-amber-950 dark:text-amber-200">
                {renderInlineFormattedText(cleanText, isPrintView)}
              </span>
            </div>
          </div>
        );
      } else if (isWarning) {
        renderedElements.push(
          <div
            key={`callout-${lineIdx}`}
            className="my-3 p-3.5 rounded-2xl flex items-start gap-3 border shadow-xs"
            style={{
              background: isPrintView ? '#fff1f2' : 'rgba(244, 63, 94, 0.08)',
              borderColor: isPrintView ? '#e11d48' : 'rgba(244, 63, 94, 0.3)',
            }}
          >
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-black text-rose-700 dark:text-rose-400 block mb-0.5">هشدار و پیش‌شرط مهم:</span>
              <span className="text-rose-950 dark:text-rose-200">
                {renderInlineFormattedText(cleanText, isPrintView)}
              </span>
            </div>
          </div>
        );
      } else if (isNote) {
        renderedElements.push(
          <div
            key={`callout-${lineIdx}`}
            className="my-3 p-3.5 rounded-2xl flex items-start gap-3 border shadow-xs"
            style={{
              background: isPrintView ? '#eef2ff' : 'rgba(99, 102, 241, 0.08)',
              borderColor: isPrintView ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Pin className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-black text-indigo-700 dark:text-indigo-400 block mb-0.5">توجه و الزام:</span>
              <span className="text-indigo-950 dark:text-indigo-200">
                {renderInlineFormattedText(cleanText, isPrintView)}
              </span>
            </div>
          </div>
        );
      }
    } else {
      if (trimmed === '') {
        flushParagraph(lineIdx);
      } else {
        currentParagraphLines.push(line);
      }
    }
  });

  flushParagraph(lines.length);

  // Render any structured tips passed in via the tips array
  if (tips && tips.length > 0) {
    tips.forEach((tipText, tIdx) => {
      renderedElements.push(
        <div
          key={`tip-arr-${tIdx}`}
          className="my-3 p-3.5 rounded-2xl flex items-start gap-3 border shadow-xs"
          style={{
            background: isPrintView ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)',
            borderColor: isPrintView ? '#10b981' : 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1 text-xs sm:text-sm font-medium leading-relaxed">
            <span className="font-black text-emerald-700 dark:text-emerald-400 block mb-0.5">
              نکته کلیدی گام:
            </span>
            <span className="text-emerald-950 dark:text-emerald-200">
              {renderInlineFormattedText(tipText, isPrintView)}
            </span>
          </div>
        </div>
      );
    });
  }

  return (
    <div className={`step-content-formatted text-sm sm:text-base ${className}`}>
      {renderedElements}
    </div>
  );
}
