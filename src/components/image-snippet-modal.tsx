'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Crop, 
  Sparkles, 
  Loader2, 
  Trash2, 
  MousePointerClick,
  Info,
  Edit3
} from 'lucide-react';
import { 
  convertImageToWebP, 
  cropImageToWebP, 
  formatBytes, 
  WebPConversionResult 
} from '@/lib/image-utils';
import { UiSnippet } from '@/types/process';
import { notify } from '@/lib/notify';
import { ScreenshotEditorModal } from './screenshot-editor-modal';

interface ImageSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'screenshot' | 'snippet'; // 'screenshot' = full step screenshot, 'snippet' = micro UI click icon
  onScreenshotSaved?: (imageUrl: string) => void;
  onSnippetSaved?: (snippet: UiSnippet, insertInlineMarkdown?: boolean) => void;
  initialScreenshotUrl?: string;
}

export function ImageSnippetModal({
  isOpen,
  onClose,
  mode,
  onScreenshotSaved,
  onSnippetSaved,
  initialScreenshotUrl,
}: ImageSnippetModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialScreenshotUrl || null);
  const [conversionStats, setConversionStats] = useState<WebPConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Micro Snippet Form Fields
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetDescription, setSnippetDescription] = useState('');
  const [snippetBadgeText, setSnippetBadgeText] = useState('');
  const [insertInlineMarkdown, setInsertInlineMarkdown] = useState(true);

  // Drag and paste states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      if (mode === 'screenshot' && initialScreenshotUrl) {
        setPreviewUrl(initialScreenshotUrl);
      } else {
        setSelectedFile(null);
        setPreviewUrl(null);
        setConversionStats(null);
      }
      setSnippetTitle('');
      setSnippetDescription('');
      setSnippetBadgeText('');
    }
  }, [isOpen, mode, initialScreenshotUrl]);

  // Global paste handler when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File | Blob) => {
    setIsProcessing(true);
    try {
      // Convert to WebP client-side prior to network upload
      const options = mode === 'snippet'
        ? { maxWidth: 300, maxHeight: 300, quality: 0.92 }
        : { maxWidth: 1920, maxHeight: 1920, quality: 0.85 };

      const result = await convertImageToWebP(file, options);
      setConversionStats(result);
      setSelectedFile(result.blob);

      // Create preview URL
      const localUrl = URL.createObjectURL(result.blob);
      setPreviewUrl(localUrl);

      // Auto-suggest snippet title if empty
      if (mode === 'snippet' && !snippetTitle) {
        setSnippetTitle('دکمه / آیکون راهنما');
      }
    } catch (err: any) {
      console.error('WebP conversion failed:', err);
      notify.error('خطا در تبدیل تصویر به فرمت WebP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessFile(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !previewUrl) {
      notify.error('لطفاً تصویری انتخاب یا از حافظه موقت جای‌گذاری (Paste) فرمایید.');
      return;
    }

    if (mode === 'snippet' && !snippetTitle.trim()) {
      notify.error('لطفاً عنوان یا نام دکمه/آیکون را وارد فرمایید.');
      return;
    }

    setIsUploading(true);
    try {
      let finalUrl = previewUrl || '';

      // If a new file was selected, upload it to /api/upload (Vercel Blob or local disk)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile, 'image.webp');
        formData.append('folder', mode === 'snippet' ? 'snippets' : 'screenshots');
        if (snippetTitle) {
          formData.append('name', snippetTitle.trim());
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'آپلود تصویر به مخزن ناموفق بود.');
        }

        const data = await res.json();
        finalUrl = data.url;
      }

      if (mode === 'screenshot' && onScreenshotSaved) {
        onScreenshotSaved(finalUrl);
        notify.success('اسکرین‌شات با فرمت فشرده WebP با موفقیت ذخیره شد.');
      } else if (mode === 'snippet' && onSnippetSaved) {
        const newSnippet: UiSnippet = {
          id: `snippet-${Date.now()}`,
          title: snippetTitle.trim(),
          iconUrl: finalUrl,
          description: snippetDescription.trim() || undefined,
          badgeText: snippetBadgeText.trim() || undefined,
        };
        onSnippetSaved(newSnippet, insertInlineMarkdown);
        notify.success('المان تصویری کلیک با فرمت فشرده WebP افزوده شد.');
      }

      onClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      notify.error(err.message || 'خطا در بارگذاری و ذخیره تصویر.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="glass-panel-strong w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              mode === 'snippet' ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'
            }`}>
              {mode === 'snippet' ? <MousePointerClick className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                {mode === 'snippet' ? 'افزودن دکمه یا آیکون کلیک (عکس ریز)' : 'بارگذاری اسکرین‌شات کامل گام'}
              </h3>
              <p className="text-[11px] text-slate-400">
                فرمت فشرده <span dir="ltr" className="font-mono text-emerald-600 font-bold">WebP</span> • سازگار با Vercel Blob
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Dropzone & Preview Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer relative ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : previewUrl
                ? 'border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {isProcessing ? (
              <div className="py-8 space-y-2">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  در حال تبدیل به WebP و فشرده‌سازی خودکار...
                </p>
              </div>
            ) : previewUrl ? (
              <div className="space-y-3">
                <div className="relative inline-block max-w-full">
                  <img
                    src={previewUrl}
                    alt="پیش‌نمایش تصویر"
                    className={`mx-auto rounded-xl border shadow-sm object-contain ${
                      mode === 'snippet' ? 'max-h-24 max-w-24 p-1 bg-white dark:bg-slate-800' : 'max-h-56'
                    }`}
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setConversionStats(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 cursor-pointer"
                    title="حذف و انتخاب مجدد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStudioOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش و حریم خصوصی (تار کردن، کادر، فلش، متن)</span>
                  </button>
                </div>

                {conversionStats && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>فشرده‌سازی WebP:</span>
                    <span dir="ltr" className="font-mono">{formatBytes(conversionStats.compressedSize)}</span>
                    {conversionStats.compressionRatio > 0 && (
                      <span dir="ltr" className="text-emerald-600 font-bold">
                        ({conversionStats.compressionRatio}% کاهش حجم)
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-[11px] text-slate-400">
                  برای تعویض، تصویر جدیدی را بکشید یا دکمه Paste (<kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1 rounded">Ctrl+V</kbd>) را بفشارید.
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-blue-500/10 text-blue-600">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  انتخاب فایل، کشیدن و رها کردن یا Paste از کلیپ‌بورد
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  کلیدهای <kbd className="font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">Ctrl+V</kbd> را در هر کجای این پنجره برای چسباندن اسکرین‌شات بزنید.
                </p>
              </div>
            )}
          </div>

          {/* Micro Snippet Extra Information */}
          {mode === 'snippet' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  نام یا عنوان دکمه/آیکون: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="مثال: دکمه چاپ کارنامه، آیکون چرخ‌دنده تنظیمات"
                  className="w-full text-xs p-2.5 rounded-xl border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    راهنمای مکان یا توضیح (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={snippetDescription}
                    onChange={(e) => setSnippetDescription(e.target.value)}
                    placeholder="مثال: گوشه بالا چپ، منوی پرونده"
                    className="w-full text-xs p-2 rounded-xl border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    کلید میانبر یا برچسب (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={snippetBadgeText}
                    onChange={(e) => setSnippetBadgeText(e.target.value)}
                    placeholder="مثال: Alt+P یا F5"
                    className="w-full text-xs p-2 rounded-xl border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Inline Markdown Insertion Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={insertInlineMarkdown}
                  onChange={(e) => setInsertInlineMarkdown(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span>درج خودکار به عنوان چیپ تصویری در متن دستورالعمل (<code className="font-mono text-[10px] text-amber-600">![icon:عنوان](...)</code>)</span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || isProcessing || (!previewUrl && !selectedFile)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'snippet'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال آپلود و ذخیره در Blob...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{mode === 'snippet' ? 'افزودن دکمه تصویری' : 'تایید و ذخیره اسکرین‌شات'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screenshot Studio Modal */}
      {isStudioOpen && previewUrl && (
        <ScreenshotEditorModal
          isOpen={isStudioOpen}
          imageUrl={previewUrl}
          onClose={() => setIsStudioOpen(false)}
          onSave={(newWebPUrl) => {
            setPreviewUrl(newWebPUrl);
            setSelectedFile(null);
            setConversionStats(null);
          }}
        />
      )}
    </div>
  );
}
