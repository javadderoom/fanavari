'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Check, 
  Undo2, 
  RotateCcw, 
  EyeOff, 
  Square, 
  Circle, 
  MoveUpRight, 
  Type, 
  Hash, 
  Palette, 
  Loader2, 
  Sparkles,
  MousePointer
} from 'lucide-react';
import { notify } from '@/lib/notify';

export type ToolType = 'select' | 'blur' | 'rect' | 'circle' | 'arrow' | 'stepNumber' | 'text';

export interface Annotation {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  text?: string;
  stepNum?: number;
}

interface ScreenshotEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (newWebPUrl: string) => void;
}

const COLOR_PALETTE = [
  { name: 'قرمز', hex: '#ef4444' },
  { name: 'کهربایی', hex: '#f59e0b' },
  { name: 'آبی', hex: '#3b82f6' },
  { name: 'سبز', hex: '#10b981' },
  { name: 'بنفش', hex: '#8b5cf6' },
];

const STROKE_WIDTHS = [
  { label: 'باریک', width: 2 },
  { label: 'متوسط', width: 4 },
  { label: 'ضخیم', width: 6 },
];

export function ScreenshotEditorModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}: ScreenshotEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('rect');
  const [currentColor, setCurrentColor] = useState<string>('#ef4444');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(4);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Text annotation inline input state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  // Next step counter
  const nextStepNum = annotations.filter((a) => a.type === 'stepNumber').length + 1;

  // Load Base Image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      notify.error('خطا در بارگذاری تصویر اولیه.');
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // Main Render Canvas Logic
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = baseImg.naturalWidth || baseImg.width;
    canvas.height = baseImg.naturalHeight || baseImg.height;

    // 1. Draw Original Image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // Helper to draw single annotation
    const drawItem = (item: Annotation) => {
      ctx.save();

      if (item.type === 'blur') {
        // High-Quality Privacy Pixelation
        const x = Math.min(item.x, (item.x + (item.width || 0)));
        const y = Math.min(item.y, (item.y + (item.height || 0)));
        const w = Math.abs(item.width || 0);
        const h = Math.abs(item.height || 0);

        if (w > 2 && h > 2) {
          const pixelSize = Math.max(8, Math.round(Math.min(w, h) / 8));
          const miniCanvas = document.createElement('canvas');
          miniCanvas.width = Math.max(1, Math.floor(w / pixelSize));
          miniCanvas.height = Math.max(1, Math.floor(h / pixelSize));
          const miniCtx = miniCanvas.getContext('2d');
          if (miniCtx) {
            miniCtx.drawImage(canvas, x, y, w, h, 0, 0, miniCanvas.width, miniCanvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(miniCanvas, 0, 0, miniCanvas.width, miniCanvas.height, x, y, w, h);
            ctx.imageSmoothingEnabled = true;

            // Translucent frosted mask border
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
          }
        }
      } else if (item.type === 'rect') {
        const x = Math.min(item.x, item.x + (item.width || 0));
        const y = Math.min(item.y, item.y + (item.height || 0));
        const w = Math.abs(item.width || 0);
        const h = Math.abs(item.height || 0);

        // Translucent highlight fill
        ctx.fillStyle = `${item.color}15`;
        ctx.fillRect(x, y, w, h);

        // High-contrast rounded rectangle stroke
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.lineJoin = 'round';
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 8);
          ctx.stroke();
        } else {
          ctx.strokeRect(x, y, w, h);
        }
      } else if (item.type === 'circle') {
        const rx = Math.abs(item.width || 0) / 2;
        const ry = Math.abs(item.height || 0) / 2;
        const cx = item.x + (item.width || 0) / 2;
        const cy = item.y + (item.height || 0) / 2;

        ctx.fillStyle = `${item.color}15`;
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (item.type === 'arrow') {
        const startX = item.x;
        const startY = item.y;
        const endX = item.endX ?? item.x;
        const endY = item.endY ?? item.y;

        const headLength = Math.max(14, item.strokeWidth * 3.5);
        const angle = Math.atan2(endY - startY, endX - startX);

        ctx.strokeStyle = item.color;
        ctx.fillStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.lineCap = 'round';

        // Shaft
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'stepNumber') {
        const radius = 16;
        // Outer badge circle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Number text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Vazirmatn, var(--font-vazirmatn), sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(item.stepNum || 1), item.x, item.y + 1);
      } else if (item.type === 'text' && item.text) {
        // Persian Text Callout Pill / Speech Box
        ctx.font = 'bold 14px Vazirmatn, var(--font-vazirmatn), Tahoma, sans-serif';
        ctx.direction = 'rtl';
        const textMetrics = ctx.measureText(item.text);
        const textWidth = textMetrics.width;
        const paddingX = 12;
        const paddingY = 8;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = 32;

        const boxX = item.x - boxWidth / 2;
        const boxY = item.y - boxHeight - 8;

        // Background Box with Dark Tint and Colored Border
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;

        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        }

        // Pointer triangle below callout
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(item.x - 6, boxY + boxHeight);
        ctx.lineTo(item.x + 6, boxY + boxHeight);
        ctx.lineTo(item.x, boxY + boxHeight + 6);
        ctx.closePath();
        ctx.fill();

        // Persian text rendering
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, item.x, boxY + boxHeight / 2);
      }

      ctx.restore();
    };

    // 2. Draw Committed Annotations
    annotations.forEach(drawItem);

    // 3. Draw Active Draft (In-Progress Drag)
    if (currentDraft) {
      drawItem(currentDraft);
    }
  }, [annotations, currentDraft, imageLoaded]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Convert mouse screen coordinates to canvas coordinate space
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeTool === 'stepNumber') {
      // Direct stamp placement
      setAnnotations((prev) => [
        ...prev,
        {
          id: `step-${Date.now()}`,
          type: 'stepNumber',
          x: coords.x,
          y: coords.y,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          stepNum: nextStepNum,
        },
      ]);
      return;
    }

    if (activeTool === 'text') {
      // Trigger text input at click location
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setTextInputPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        canvasX: coords.x,
        canvasY: coords.y,
      });
      setTextInputValue('');
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    setIsDrawing(true);
    setCurrentDraft({
      id: `draft-${Date.now()}`,
      type: activeTool,
      x: coords.x,
      y: coords.y,
      endX: coords.x,
      endY: coords.y,
      width: 0,
      height: 0,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    });
  };

  // Mouse Move Event Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentDraft) return;
    const coords = getCanvasCoords(e);

    setCurrentDraft((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        endX: coords.x,
        endY: coords.y,
        width: coords.x - prev.x,
        height: coords.y - prev.y,
      };
    });
  };

  // Mouse Up Event Handler
  const handleMouseUp = () => {
    if (!isDrawing || !currentDraft) return;
    setIsDrawing(false);

    const isNonEmpty =
      (currentDraft.width && Math.abs(currentDraft.width) > 4) ||
      (currentDraft.height && Math.abs(currentDraft.height) > 4) ||
      (currentDraft.endX && Math.abs(currentDraft.endX - currentDraft.x) > 4);

    if (isNonEmpty) {
      setAnnotations((prev) => [...prev, currentDraft]);
    }
    setCurrentDraft(null);
  };

  // Commit Text Annotation
  const handleCommitText = () => {
    if (textInputPos && textInputValue.trim()) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: `text-${Date.now()}`,
          type: 'text',
          x: textInputPos.canvasX,
          y: textInputPos.canvasY,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          text: textInputValue.trim(),
        },
      ]);
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  // Save Canvas as WebP & Upload to Vercel Blob
  const handleSaveAndApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const webpBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas WebP export failed'));
          },
          'image/webp',
          0.88
        );
      });

      const formData = new FormData();
      formData.append('file', webpBlob, 'annotated-screenshot.webp');
      formData.append('folder', 'annotated');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'خطا در ذخیره تصویر ویرایش‌شده در مخزن.');
      }

      const data = await res.json();
      notify.success('تصویر ویرایش‌شده با موفقیت ذخیره و جایگزین گردید.');
      onSave(data.url);
      onClose();
    } catch (err: any) {
      console.error('Failed to export annotated image:', err);
      notify.error(err.message || 'خطا در ذخیره‌سازی تصویر.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="glass-panel-strong w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col h-[92vh]"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        {/* Studio Top Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-3 bg-slate-900 text-white" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black">
                استودیوی حریم خصوصی و علامت‌گذاری اسکرین‌شات
              </h3>
              <p className="text-[10px] text-slate-400">
                تار کردن اطلاعات حساس (Blur) • کادربندی و فلش • شماره‌گذاری گام‌ها و توضیحات فارسی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <button
                type="button"
                onClick={() => setAnnotations((prev) => prev.slice(0, -1))}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="بازگشت (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بازگشت</span>
              </button>
            )}

            {annotations.length > 0 && (
              <button
                type="button"
                onClick={() => setAnnotations([])}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="پاکسازی تمام علامت‌ها"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پاکسازی</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Toolbar (Tools, Colors, Stroke Widths) */}
        <div className="p-2 sm:p-3 border-b flex items-center justify-between gap-3 flex-wrap bg-slate-950/90 text-white" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Tool Selector Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTool('blur')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'blur'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="تار کردن داده‌های محرمانه (کد ملی، رمز، تلفن)"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-300" />
              <span>تار کردن (Blur)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('rect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'rect'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم کادر مستطیل دور دکمه یا فیلد"
            >
              <Square className="w-3.5 h-3.5" />
              <span>مستطیل</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'circle'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم دایره دور آیکون یا گزینه"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>دایره</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'arrow'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم فلش اشاره‌گر به محل کلیک"
            >
              <MoveUpRight className="w-3.5 h-3.5" />
              <span>فلش</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('stepNumber')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'stepNumber'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="درج نشانگر شماره‌دار ترتیبی گام"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>نشانگر #{nextStepNum}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'text'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="درج یادداشت یا برچسب متنی فارسی"
            >
              <Type className="w-3.5 h-3.5" />
              <span>متن فارسی</span>
            </button>
          </div>

          {/* Color Palette & Stroke Controls */}
          {activeTool !== 'blur' && (
            <div className="flex items-center gap-3">
              {/* Colors */}
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTE.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setCurrentColor(col.hex)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      currentColor === col.hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
                {STROKE_WIDTHS.map((st) => (
                  <button
                    key={st.width}
                    type="button"
                    onClick={() => setCurrentStrokeWidth(st.width)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      currentStrokeWidth === st.width ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas Display Viewport */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-auto flex items-center justify-center relative select-none">
          {!imageLoaded ? (
            <div className="text-center space-y-2 text-slate-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
              <p className="text-xs font-bold">در حال آماده‌سازی بوم ویرایش...</p>
            </div>
          ) : (
            <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-slate-800">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-h-[68vh] max-w-full object-contain cursor-crosshair block"
              />

              {/* Floating Inline Persian Text Input */}
              {textInputPos && (
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 border border-purple-500 p-1.5 rounded-xl shadow-xl flex items-center gap-1 animate-in zoom-in-95"
                  style={{ left: textInputPos.x, top: textInputPos.y }}
                >
                  <input
                    ref={textInputRef}
                    type="text"
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitText();
                      if (e.key === 'Escape') setTextInputPos(null);
                    }}
                    placeholder="متن یادداشت فارسی را بنویسید..."
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-white border border-slate-700 outline-none w-56 font-bold"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={handleCommitText}
                    className="p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                    title="ثبت متن"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextInputPos(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    title="انصراف"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Studio Bottom Bar */}
        <div className="p-3 sm:p-4 border-t flex items-center justify-between gap-3 bg-slate-900 text-white" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-[11px] text-slate-400">
            {activeTool === 'blur' && 'برای تار کردن کادر روی اطلاعات حساس (رمز، نام، شماره) بکشید.'}
            {activeTool === 'rect' && 'برای کشیدن کادر دور المان مورد نظر درگ فرمایید.'}
            {activeTool === 'circle' && 'برای رسم حلقه دایره‌ای درگ فرمایید.'}
            {activeTool === 'arrow' && 'از نقطه مبدا به سمت دکمه مقصد بکشید تا فلش ایجاد شود.'}
            {activeTool === 'stepNumber' && 'روی هر بخش از صفحه کلیک کنید تا نشانگر شماره‌دار ثبت شود.'}
            {activeTool === 'text' && 'روی هر نقطه از تصویر کلیک کرده و متن فارسی خود را تایپ فرمایید.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer text-slate-300"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSaving || !imageLoaded}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تبدیل به WebP و ذخیره در مخزن...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ذخیره و اعمال بر روی گام</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
