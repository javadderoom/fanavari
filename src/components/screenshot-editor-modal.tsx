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
  Loader2, 
  Sparkles,
  MousePointer,
  Crop,
  CornerDownLeft
} from 'lucide-react';
import { notify } from '@/lib/notify';

export type ToolType = 
  | 'crop' 
  | 'click' 
  | 'rect' 
  | 'circle' 
  | 'arrow' 
  | 'stepNumber' 
  | 'text' 
  | 'blur';

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

interface HistoryItem {
  baseImage: HTMLImageElement;
  annotations: Annotation[];
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
  { name: 'رز', hex: '#f43f5e' },
];

const STROKE_WIDTHS = [
  { label: 'باریک', width: 2 },
  { label: 'متوسط', width: 4 },
  { label: 'ضخیم', width: 6 },
];

const TEXT_PRESETS = [
  { label: '💡 نکته:', text: '💡 نکته: ' },
  { label: '📌 توجه:', text: '📌 توجه: ' },
  { label: '⚠️ هشدار:', text: '⚠️ هشدار: ' },
  { label: '👈 کلیک:', text: '👈 کلیک بر روی این گزینه' },
];

export function ScreenshotEditorModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}: ScreenshotEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const initialBaseImageRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('click');
  const [currentColor, setCurrentColor] = useState<string>('#ef4444');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(4);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Undo / History Stack
  const [historyStack, setHistoryStack] = useState<HistoryItem[]>([]);

  // Crop State
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Text annotation inline input state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  // Next step counter
  const nextStepNum = annotations.filter((a) => a.type === 'stepNumber').length + 1;

  // Resolves the exact Persian font family from the document (Vazirmatn)
  const getCanvasFont = useCallback((size = 14, weight = 'bold') => {
    if (typeof window !== 'undefined') {
      const bodyFont = getComputedStyle(document.body).fontFamily;
      if (bodyFont) {
        return `${weight} ${size}px ${bodyFont}`;
      }
    }
    return `${weight} ${size}px 'Vazirmatn', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Tahoma, sans-serif`;
  }, []);

  // Load Base Image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setImageLoaded(false);
    setAnnotations([]);
    setHistoryStack([]);
    setCropRect(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseImageRef.current = img;
      initialBaseImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        baseImageRef.current = fallbackImg;
        initialBaseImageRef.current = fallbackImg;
        setImageLoaded(true);
      };
      fallbackImg.onerror = () => {
        notify.error('خطا در بارگذاری تصویر اولیه.');
      };
      fallbackImg.src = imageUrl;
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // Vector Mouse Pointer Drawer for Click Tool
  const drawMousePointer = useCallback((
    ctx: CanvasRenderingContext2D,
    targetX: number,
    targetY: number,
    color: string
  ) => {
    ctx.save();
    ctx.beginPath();
    // Arrow tip points right at targetX, targetY
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(targetX + 3, targetY + 19);
    ctx.lineTo(targetX + 7, targetY + 14);
    ctx.lineTo(targetX + 13, targetY + 23);
    ctx.lineTo(targetX + 16, targetY + 21);
    ctx.lineTo(targetX + 10, targetY + 12);
    ctx.lineTo(targetX + 16, targetY + 12);
    ctx.closePath();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }, []);

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
        const x = Math.min(item.x, item.x + (item.width || 0));
        const y = Math.min(item.y, item.y + (item.height || 0));
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
      } else if (item.type === 'click') {
        // Highlight indicator for clicking this button
        // 1. Outer halo ring
        ctx.fillStyle = `${item.color}25`;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // 2. Crisp target ring
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Center bullseye dot
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // 4. Vector OS cursor pointer
        drawMousePointer(ctx, item.x, item.y, item.color);

        // 5. Attached click badge pill
        const label = item.text || 'کلیک';
        ctx.font = getCanvasFont(11, 'bold');
        ctx.direction = 'rtl';
        const metrics = ctx.measureText(label);
        const badgeW = Math.max(metrics.width + 12, 34);
        const badgeH = 20;
        const badgeX = item.x + 8;
        const badgeY = item.y + 24;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
        }

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, badgeX + badgeW / 2, badgeY + badgeH / 2);
      } else if (item.type === 'rect') {
        const x = Math.min(item.x, item.x + (item.width || 0));
        const y = Math.min(item.y, item.y + (item.height || 0));
        const w = Math.abs(item.width || 0);
        const h = Math.abs(item.height || 0);

        // Translucent highlight fill
        ctx.fillStyle = `${item.color}15`;
        ctx.fillRect(x, y, w, h);

        // Rounded rectangle stroke
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

        // Number text with Persian font
        ctx.fillStyle = '#ffffff';
        ctx.font = getCanvasFont(15, 'bold');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(item.stepNum || 1), item.x, item.y + 1);
      } else if (item.type === 'text' && item.text) {
        // Persian Text Callout Pill / Speech Box with Vazirmatn font
        ctx.font = getCanvasFont(14, 'bold');
        ctx.direction = 'rtl';
        const textMetrics = ctx.measureText(item.text);
        const textWidth = Math.max(textMetrics.width, 50);
        const paddingX = 14;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = 34;

        const isNearTop = item.y < boxHeight + 20;
        const boxX = Math.max(8, item.x - boxWidth / 2);
        const boxY = isNearTop ? item.y + 12 : item.y - boxHeight - 12;

        // Background Box with Dark Slate Tint and Colored Border
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;

        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        }
        ctx.shadowBlur = 0;

        // Pointer triangle to (item.x, item.y)
        ctx.fillStyle = item.color;
        ctx.beginPath();
        if (isNearTop) {
          ctx.moveTo(item.x, item.y + 2);
          ctx.lineTo(item.x - 7, boxY);
          ctx.lineTo(item.x + 7, boxY);
        } else {
          ctx.moveTo(item.x, item.y - 2);
          ctx.lineTo(item.x - 7, boxY + boxHeight);
          ctx.lineTo(item.x + 7, boxY + boxHeight);
        }
        ctx.closePath();
        ctx.fill();

        // Persian text rendering
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, boxX + boxWidth / 2, boxY + boxHeight / 2);
      }

      ctx.restore();
    };

    // 2. Draw Committed Annotations
    annotations.forEach(drawItem);

    // 3. Draw Active Draft (In-Progress Drag)
    if (currentDraft && activeTool !== 'crop') {
      drawItem(currentDraft);
    }

    // 4. Draw Crop Overlay (if crop is active or in progress)
    if (cropRect && cropRect.width > 2 && cropRect.height > 2) {
      const cx = Math.min(cropRect.x, cropRect.x + cropRect.width);
      const cy = Math.min(cropRect.y, cropRect.y + cropRect.height);
      const cw = Math.abs(cropRect.width);
      const ch = Math.abs(cropRect.height);

      ctx.save();
      // Dark overlay outside the crop box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, canvas.width, cy); // Top
      ctx.fillRect(0, cy + ch, canvas.width, canvas.height - (cy + ch)); // Bottom
      ctx.fillRect(0, cy, cx, ch); // Left
      ctx.fillRect(cx + cw, cy, canvas.width - (cx + cw), ch); // Right

      // Dashed crop boundary
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cx, cy, cw, ch);
      ctx.setLineDash([]);

      // Corner handles
      const cornerLen = Math.min(18, cw / 4, ch / 4);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'square';
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(cx, cy + cornerLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + cornerLen, cy);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(cx + cw - cornerLen, cy);
      ctx.lineTo(cx + cw, cy);
      ctx.lineTo(cx + cw, cy + cornerLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(cx, cy + ch - cornerLen);
      ctx.lineTo(cx, cy + ch);
      ctx.lineTo(cx + cornerLen, cy + ch);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(cx + cw - cornerLen, cy + ch);
      ctx.lineTo(cx + cw, cy + ch);
      ctx.lineTo(cx + cw, cy + ch - cornerLen);
      ctx.stroke();

      // Dimension indicator badge
      const dimText = `${Math.round(cw)} × ${Math.round(ch)} px`;
      ctx.font = getCanvasFont(11, 'bold');
      const dimMetrics = ctx.measureText(dimText);
      const badgeW = dimMetrics.width + 16;
      const badgeH = 22;
      const badgeX = cx + cw / 2 - badgeW / 2;
      const badgeY = cy > 28 ? cy - 26 : cy + ch + 6;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dimText, cx + cw / 2, badgeY + badgeH / 2);

      ctx.restore();
    }
  }, [annotations, currentDraft, cropRect, activeTool, imageLoaded, getCanvasFont, drawMousePointer]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Ensure canvas redraws once web fonts are fully loaded
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        redrawCanvas();
      });
    }
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

  // Push current state to undo history
  const pushToHistory = useCallback(() => {
    if (baseImageRef.current) {
      setHistoryStack((prev) => [
        ...prev,
        {
          baseImage: baseImageRef.current!,
          annotations: [...annotations],
        },
      ]);
    }
  }, [annotations]);

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeTool === 'crop') {
      setIsDrawing(true);
      setCropStart(coords);
      setCropRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
      return;
    }

    if (activeTool === 'click') {
      pushToHistory();
      setAnnotations((prev) => [
        ...prev,
        {
          id: `click-${Date.now()}`,
          type: 'click',
          x: coords.x,
          y: coords.y,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          text: 'کلیک',
        },
      ]);
      return;
    }

    if (activeTool === 'stepNumber') {
      pushToHistory();
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
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (activeTool === 'crop' && cropStart) {
      const minX = Math.min(cropStart.x, coords.x);
      const minY = Math.min(cropStart.y, coords.y);
      const w = Math.abs(coords.x - cropStart.x);
      const h = Math.abs(coords.y - cropStart.y);
      setCropRect({ x: minX, y: minY, width: w, height: h });
      return;
    }

    if (currentDraft) {
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
    }
  };

  // Mouse Up Event Handler
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'crop') {
      if (cropRect && (cropRect.width < 12 || cropRect.height < 12)) {
        setCropRect(null);
      }
      return;
    }

    if (!currentDraft) return;

    const isNonEmpty =
      (currentDraft.width && Math.abs(currentDraft.width) > 4) ||
      (currentDraft.height && Math.abs(currentDraft.height) > 4) ||
      (currentDraft.endX && Math.abs(currentDraft.endX - currentDraft.x) > 4);

    if (isNonEmpty) {
      pushToHistory();
      setAnnotations((prev) => [...prev, currentDraft]);
    }
    setCurrentDraft(null);
  };

  // Commit Text Annotation
  const handleCommitText = () => {
    if (textInputPos && textInputValue.trim()) {
      pushToHistory();
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

  // Apply Interactive Crop
  const handleApplyCrop = () => {
    if (!cropRect || cropRect.width < 10 || cropRect.height < 10 || !baseImageRef.current) return;

    const baseImg = baseImageRef.current;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.round(cropRect.width);
    cropCanvas.height = Math.round(cropRect.height);
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCtx.imageSmoothingEnabled = true;
    cropCtx.imageSmoothingQuality = 'high';
    cropCtx.drawImage(
      baseImg,
      Math.round(cropRect.x),
      Math.round(cropRect.y),
      cropCanvas.width,
      cropCanvas.height,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    const croppedDataUrl = cropCanvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      pushToHistory();
      const offsetX = Math.round(cropRect.x);
      const offsetY = Math.round(cropRect.y);

      // Adjust existing annotations relative to cropped boundaries
      setAnnotations((prev) =>
        prev
          .map((a) => ({
            ...a,
            x: a.x - offsetX,
            y: a.y - offsetY,
            endX: a.endX !== undefined ? a.endX - offsetX : undefined,
            endY: a.endY !== undefined ? a.endY - offsetY : undefined,
          }))
          .filter(
            (a) =>
              a.x >= -30 &&
              a.x <= cropCanvas.width + 30 &&
              a.y >= -30 &&
              a.y <= cropCanvas.height + 30
          )
      );

      baseImageRef.current = newImg;
      setCropRect(null);
      setActiveTool('rect');
      notify.success('تصویر با موفقیت برش داده شد.');
    };
    newImg.src = croppedDataUrl;
  };

  const handleCancelCrop = () => {
    setCropRect(null);
    if (activeTool === 'crop') {
      setActiveTool('rect');
    }
  };

  // Global Undo Handler
  const handleUndo = useCallback(() => {
    if (cropRect) {
      setCropRect(null);
      return;
    }

    if (historyStack.length > 0) {
      const lastState = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));
      baseImageRef.current = lastState.baseImage;
      setAnnotations(lastState.annotations);
      setCropRect(null);
      notify.info('آخرین تغییر بازگردانی شد.');
      return;
    }

    if (annotations.length > 0) {
      setAnnotations((prev) => prev.slice(0, -1));
    }
  }, [cropRect, historyStack, annotations]);

  // Reset to initial image
  const handleResetAll = () => {
    if (initialBaseImageRef.current) {
      pushToHistory();
      baseImageRef.current = initialBaseImageRef.current;
      setAnnotations([]);
      setCropRect(null);
      notify.info('تصویر به حالت اولیه بازنشانی گردید.');
    }
  };

  // Keyboard shortcut listener (Ctrl+Z, Escape, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'Escape') {
        if (textInputPos) {
          setTextInputPos(null);
        } else if (cropRect) {
          handleCancelCrop();
        }
      } else if (e.key === 'Enter') {
        if (cropRect && activeTool === 'crop') {
          handleApplyCrop();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, textInputPos, cropRect, activeTool]);

  // Save Canvas as WebP & Upload to Storage
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
          0.90
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="glass-panel-strong w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col h-[94vh]"
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
                استودیوی ویرایش و نشانه‌گذاری اسکرین‌شات
              </h3>
              <p className="text-[10px] text-slate-400">
                برش (Crop) • نشانگر کلیک • کادر و فلش • یادداشت فارسی • تار کردن حریم خصوصی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(annotations.length > 0 || historyStack.length > 0 || cropRect) && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="بازگشت آخرین عمل (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بازگشت</span>
              </button>
            )}

            {(annotations.length > 0 || historyStack.length > 0) && (
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="بازنشانی به حالت اولیه"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بازنشانی کامل</span>
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
            {/* Crop Tool */}
            <button
              type="button"
              onClick={() => {
                setActiveTool('crop');
                setCropRect(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'crop'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="برش بخش دلخواه از تصویر (Crop)"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>برش تصویر</span>
            </button>

            {/* Click Indicator Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('click')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'click'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="نشانگر کلیک بر روی دکمه یا لینک مقصد"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>نشانگر کلیک</span>
            </button>

            {/* Rectangle Highlight */}
            <button
              type="button"
              onClick={() => setActiveTool('rect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'rect'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم کادر مستطیل دور دکمه، ورودی یا فیلد"
            >
              <Square className="w-3.5 h-3.5" />
              <span>مستطیل</span>
            </button>

            {/* Circle Highlight */}
            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'circle'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم حلقه دایره دور آیکون یا گزینه"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>دایره</span>
            </button>

            {/* Directional Arrow */}
            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'arrow'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="رسم فلش اشاره‌گر به محل اقدام"
            >
              <MoveUpRight className="w-3.5 h-3.5" />
              <span>فلش</span>
            </button>

            {/* Sequential Step Counter */}
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
              <span>شماره گام #{nextStepNum}</span>
            </button>

            {/* Persian Text / Callout */}
            <button
              type="button"
              onClick={() => setActiveTool('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'text'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="درج یادداشت یا کادر نکته فارسی با فونت وزیرمتن"
            >
              <Type className="w-3.5 h-3.5" />
              <span>متن و نکته</span>
            </button>

            {/* Privacy Redaction Blur */}
            <button
              type="button"
              onClick={() => setActiveTool('blur')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'blur'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="تار کردن داده‌های محرمانه (کد ملی، رمز عبور، شماره)"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-300" />
              <span>تار کردن (Blur)</span>
            </button>
          </div>

          {/* Color Palette & Stroke Controls */}
          {activeTool !== 'blur' && activeTool !== 'crop' && (
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
                className="max-h-[66vh] max-w-full object-contain cursor-crosshair block"
              />

              {/* Floating Inline Persian Text Input Popup */}
              {textInputPos && (
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 border border-purple-500 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 animate-in zoom-in-95 w-72"
                  style={{ left: textInputPos.x, top: textInputPos.y }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                    <span>درج یادداشت و نکته فارسی:</span>
                    <button
                      type="button"
                      onClick={() => setTextInputPos(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {TEXT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setTextInputValue(preset.text)}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInputValue}
                      onChange={(e) => setTextInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommitText();
                        if (e.key === 'Escape') setTextInputPos(null);
                      }}
                      placeholder="متن نکته را بنویسید..."
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none flex-1 font-bold"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={handleCommitText}
                      className="p-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shrink-0 shadow-sm"
                      title="ثبت متن"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Crop Confirmation Bar */}
              {cropRect && cropRect.width > 20 && cropRect.height > 20 && !isDrawing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 border border-emerald-500/60 p-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 backdrop-blur-md">
                  <span className="text-[11px] font-bold text-slate-300 px-1">
                    کادر برش آماده است ({Math.round(cropRect.width)} × {Math.round(cropRect.height)})
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تایید برش</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCrop}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>انصراف</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Studio Bottom Bar */}
        <div className="p-3 sm:p-4 border-t flex items-center justify-between gap-3 bg-slate-900 text-white" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-[11px] text-slate-400">
            {activeTool === 'crop' && 'برای برش کادر دلخواه را روی تصویر بکشید و تایید فرمایید.'}
            {activeTool === 'click' && 'روی دکمه یا لینک مورد نظر کلیک فرمایید تا نشانگر کلیک با فلش ثبت شود.'}
            {activeTool === 'rect' && 'برای کشیدن کادر دور المان مورد نظر درگ فرمایید.'}
            {activeTool === 'circle' && 'برای رسم حلقه دایره‌ای دور آیکون یا گزینه درگ فرمایید.'}
            {activeTool === 'arrow' && 'از نقطه مبدا به سمت دکمه مقصد بکشید تا فلش ایجاد شود.'}
            {activeTool === 'stepNumber' && 'روی هر بخش از صفحه کلیک کنید تا نشانگر شماره‌دار ثبت شود.'}
            {activeTool === 'text' && 'روی هر نقطه از تصویر کلیک کرده و متن یا نکته فارسی خود را ثبت فرمایید.'}
            {activeTool === 'blur' && 'برای تار کردن کادر روی اطلاعات حساس (رمز، نام، شماره) بکشید.'}
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
                  <span>در حال فشرده‌سازی WebP و ذخیره...</span>
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
