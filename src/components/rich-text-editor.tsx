'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Unlink,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Code,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Sparkles,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'متن و محتوای دستورالعمل، اطلاعیه یا راهنما را اینجا بنویسید...',
  minHeight = '240px',
}: RichTextEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-400 underline hover:text-indigo-300 font-medium',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-full p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-slate-100',
        dir: 'rtl',
      },
    },
  });

  // Sync external value changes if content differs significantly
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && (value === '' || Math.abs(value.length - currentHtml.length) > 2)) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  };

  const handleSetLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.trim(), target: '_blank' })
        .run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  };

  const wordCount = editor?.storage.characterCount
    ? editor.storage.characterCount.words()
    : editor?.getText()?.trim()?.split(/\s+/).filter(Boolean).length || 0;
  const charCount = editor?.getText()?.length || 0;

  if (!editor) {
    return (
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-500 text-xs animate-pulse">
        در حال بارگذاری ویرایشگر پیشرفته...
      </div>
    );
  }

  const isTableActive = editor.isActive('table');

  const toolbarContent = (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border-b border-slate-800 text-slate-300">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="بازگشت (Undo)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="انجام مجدد (Redo)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="متن عادی (پاراگراف)"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            editor.isActive('paragraph') && !editor.isActive('heading')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="تیتر ۱ (Heading 1)"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="تیتر ۲ (Heading 2)"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="تیتر ۳ (Heading 3)"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Basic Text Formats: Bold, Italic, Underline, Strike, Highlight */}
      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="درشت (Bold)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="مورب (Italic)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="خط زیرین (Underline)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('underline')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="خط خورده (Strikethrough)"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="هایلایت متنی (Marker)"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fde047' }).run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('highlight')
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alignment (RTL Right, Center, Left, Justify) */}
      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="راست‌چین (پیش‌فرض فارسی)"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="وسط‌چین"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="چپ‌چین (برای عبارات انگلیسی/کد)"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="تراز دوطرفه (Justify)"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="لیست بالت‌دار"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="لیست شماره‌دار"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="نقل قول (Quote)"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('blockquote')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="خط جداکننده (Divider)"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Links & Tables & Code */}
      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          title="درج یا ویرایش پیوند (Link)"
          onClick={handleOpenLinkModal}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('link')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            title="حذف پیوند"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Table Trigger */}
        <button
          type="button"
          title="درج جدول ۳ در ۳"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isTableActive
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          title="بلاک کد"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('codeBlock')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Table Actions when cursor is inside a table */}
      {isTableActive && (
        <div className="flex items-center gap-1 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-lg text-xs">
          <span className="text-[10px] text-indigo-300 font-bold ml-1">عملیات جدول:</span>
          <button
            type="button"
            title="افزودن سطر"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-1 rounded hover:bg-indigo-800/50 text-indigo-200 transition-colors cursor-pointer"
          >
            <Rows className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="حذف سطر"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-1 rounded hover:bg-rose-900/50 text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="افزودن ستون"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="p-1 rounded hover:bg-indigo-800/50 text-indigo-200 transition-colors cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="حذف کل جدول"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-1 rounded hover:bg-rose-900/50 text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      )}

      {/* Full-Screen Toggle Button */}
      <div className="mr-auto">
        <button
          type="button"
          onClick={() => setIsFullScreen((prev) => !prev)}
          title={isFullScreen ? 'خروج از حالت تمام‌صفحه (Esc)' : 'ویرایش در حالت تمام‌صفحه'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isFullScreen
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
          }`}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>خروج از تمام‌صفحه</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>تمام‌صفحه (Full Screen)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* NORMAL EMBEDDED MODE */}
      {!isFullScreen ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm flex flex-col focus-within:border-indigo-500/80 transition-colors">
          {toolbarContent}

          {/* Editable Canvas */}
          <div
            className="overflow-y-auto cursor-text"
            style={{ minHeight }}
            onClick={() => editor.commands.focus()}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Metrics Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/90 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                تعداد واژه‌ها: <strong className="text-slate-300 font-mono">{'\u200E' + wordCount}</strong>
              </span>
              <span>•</span>
              <span>
                کاراکتر: <strong className="text-slate-300 font-mono">{'\u200E' + charCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">پشتیبانی از فرمت‌های WordPad و HTML کامل</span>
              <button
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline text-[11px] cursor-pointer"
              >
                باز کردن در پنجره بزرگ تمام‌صفحه ⤢
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* FULL-SCREEN IMMERSIVE WORD-LIKE DESKTOP MODE */
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-200">
          {/* Top Fullscreen Header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ویرایشگر تمام‌صفحه محتوا (مشابه Microsoft Word / WordPad)
                </h3>
                <p className="text-[11px] text-slate-400">
                  برای خروج از حالت تمام‌صفحه دکمه Esc روی کیبورد یا دکمه گوشه چپ را بزنید
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <Minimize2 className="w-4 h-4" />
              <span>خروج از تمام‌صفحه (Esc)</span>
            </button>
          </div>

          {/* Fullscreen Word Toolbar Ribbon */}
          <div className="shadow-inner">{toolbarContent}</div>

          {/* Document Work Area: Centered Paper Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
            <div
              className="w-full max-w-4xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-12 min-h-[85vh] cursor-text flex flex-col"
              onClick={() => editor.commands.focus()}
            >
              <EditorContent editor={editor} className="flex-1" />
            </div>
          </div>

          {/* Fullscreen Bottom Status Bar */}
          <div className="flex items-center justify-between px-8 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                تعداد کلمات: <strong className="text-white font-mono">{'\u200E' + wordCount}</strong>
              </span>
              <span>•</span>
              <span>
                کاراکترها: <strong className="text-white font-mono">{'\u200E' + charCount}</strong>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
              <span>میانبرها: Ctrl+B (بولد) | Ctrl+I (ایتالیک) | Ctrl+U (زیرخط) | Ctrl+Z (بازگشت)</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="text-indigo-400 hover:underline"
              >
                تایید و بازگشت به فرم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h4 className="text-sm font-bold text-white mb-2">درج یا ویرایش پیوند اینترنتی</h4>
            <p className="text-xs text-slate-400 mb-4">
              آدرس وب‌سایت یا فایل مورد نظر را وارد نمایید (مثال: https://example.gov.ir)
            </p>
            <input
              type="url"
              dir="ltr"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono mb-5"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSetLink();
                }
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
              >
                ثبت پیوند
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
