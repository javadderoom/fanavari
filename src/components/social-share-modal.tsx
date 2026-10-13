'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  FileText,
  Smartphone
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug?: string | null;
  url?: string | null;
  departmentName?: string | null;
  targetSystem?: string | null;
  description?: string | null;
}

export function SocialShareModal({
  isOpen,
  onClose,
  title,
  slug,
  url,
  departmentName,
  targetSystem,
  description,
}: SocialShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullText, setCopiedFullText] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Compute canonical URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://farayandnama.ir';
  const shareUrl = url 
    ? (url.startsWith('http') ? url : `${origin}${url}`)
    : slug
    ? `${origin}/process/${slug}`
    : typeof window !== 'undefined'
    ? window.location.href.split('?')[0].split('#')[0]
    : 'https://farayandnama.ir';

  // Formatted share text for messengers
  const shareText = `راهنمای «${title}»${targetSystem ? `\nسامانه: ${targetSystem}` : ''}${departmentName ? `\nمرجع: ${departmentName}` : ''}\nمشاهده و اجرای مرحله‌به‌مرحله در فرآیندنما:\n${shareUrl}`;

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLinkOnly = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      notify.success('نشانی اینترنتی فرایند کپی شد.');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      notify.error('خطا در کپی کردن نشانی.');
    }
  };

  const handleCopyFormattedText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedFullText(true);
      notify.success('عنوان و لینک با فرمت متنی کپی شد.');
      setTimeout(() => setCopiedFullText(false), 2000);
    } catch {
      notify.error('خطا در کپی کردن متن.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `راهنمای «${title}» در سامانه فرآیندنما`,
          url: shareUrl,
        });
        onClose();
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLinkOnly();
        }
      }
    } else {
      handleCopyLinkOnly();
    }
  };

  const openExternalShare = (shareLink: string) => {
    if (typeof window !== 'undefined') {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Messenger links
  const eitaaUrl = `https://eitaa.com/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const baleUrl = `https://ble.ir/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-md rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                اشتراک‌گذاری فرایند
              </h3>
              <p className="text-[11px] text-slate-500">
                ارسال دستورالعمل به همکاران و پیام‌رسان‌ها
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-500/10 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Process Quick Summary Card */}
        <div 
          className="p-3.5 rounded-2xl border text-xs space-y-1.5"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {targetSystem && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                سامانه: {targetSystem}
              </span>
            )}
            {departmentName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-500/10 text-slate-600 dark:text-slate-300">
                {departmentName}
              </span>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
            {title}
          </h4>
          {description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* 1-Click Direct Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
            نشانی مستقیم اینترنتی:
          </label>
          <div 
            className="flex items-center gap-1.5 p-1.5 rounded-2xl border"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)' }}
          >
            <input
              type="text"
              readOnly
              value={shareUrl}
              dir="ltr"
              className="flex-1 bg-transparent text-xs font-mono px-2 py-1 outline-none text-slate-700 dark:text-slate-300 select-all"
            />
            <button
              type="button"
              onClick={handleCopyLinkOnly}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی لینک</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Copy with formatted text shortcut */}
        <div>
          <button
            type="button"
            onClick={handleCopyFormattedText}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-500/5"
          >
            {copiedFullText ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copiedFullText ? 'متن کامل کپی شد' : 'کپی با عنوان و فرمت آماده برای ارسال در گروه‌ها'}</span>
          </button>
        </div>

        {/* Instant Messengers Grid */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 block">
            اشتراک مستقیم در پیام‌رسان‌ها:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Eitaa */}
            <button
              type="button"
              onClick={() => openExternalShare(eitaaUrl)}
              className="p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 bg-[#E8651B]/10 hover:bg-[#E8651B]/20 text-[#E8651B] border-[#E8651B]/25"
            >
              <div className="w-5 h-5 rounded-full bg-[#E8651B] text-white flex items-center justify-center text-[10px] font-black">
                ای
              </div>
              <span>ایتا (Eitaa)</span>
            </button>

            {/* Bale */}
            <button
              type="button"
              onClick={() => openExternalShare(baleUrl)}
              className="p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 bg-[#1EA362]/10 hover:bg-[#1EA362]/20 text-[#1EA362] border-[#1EA362]/25"
            >
              <div className="w-5 h-5 rounded-full bg-[#1EA362] text-white flex items-center justify-center text-[10px] font-black">
                ب
              </div>
              <span>بله (Bale)</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={() => openExternalShare(telegramUrl)}
              className="p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 text-[#24A1DE] border-[#24A1DE]/25"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>تلگرام</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => openExternalShare(whatsappUrl)}
              className="p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/25"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.57C9.33 7.57 9.15 7.58 8.97 7.89C8.79 8.21 8.24 8.73 8.24 9.78C8.24 10.84 9.01 11.85 9.12 12C9.23 12.16 10.63 14.32 12.8 15.26C14.61 16.04 14.98 15.89 15.39 15.85C15.8 15.81 16.72 15.3 16.91 14.77C17.1 14.24 17.1 13.79 17.04 13.7C16.98 13.6 16.83 13.55 16.6 13.43C16.38 13.32 15.28 12.78 15.08 12.71C14.87 12.63 14.73 12.6 14.58 12.82C14.44 13.04 14.03 13.55 13.9 13.7C13.78 13.85 13.65 13.87 13.43 13.76C13.2 13.65 12.48 13.41 11.63 12.65C10.97 12.06 10.52 11.33 10.39 11.11C10.27 10.89 10.38 10.77 10.49 10.66C10.59 10.56 10.72 10.39 10.83 10.26C10.95 10.13 10.99 10.04 11.06 9.89C11.14 9.75 11.1 9.62 11.04 9.51C10.99 9.39 10.57 8.37 10.4 7.95C10.23 7.55 10.06 7.6 9.92 7.6C9.79 7.59 9.64 7.57 9.53 7.57Z" />
              </svg>
              <span>واتساپ</span>
            </button>
          </div>
        </div>

        {/* Device Native Web Share Trigger */}
        {canNativeShare && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-500/10 text-slate-700 dark:text-slate-200"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
            >
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>اشتراک‌گذاری با سایر برنامه‌های دستگاه</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
