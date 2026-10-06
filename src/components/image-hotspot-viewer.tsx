'use client';

import React, { useState } from 'react';
import { Hotspot } from '@/types/process';
import { 
  Maximize2, 
  X, 
  Info, 
  MousePointerClick, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw 
} from 'lucide-react';

interface ImageHotspotViewerProps {
  imageUrl: string;
  hotspots?: Hotspot[];
  alt?: string;
  className?: string;
}

export function ImageHotspotViewer({
  imageUrl,
  hotspots = [],
  alt = 'راهنمای تصویری مرحله',
  className = '',
}: ImageHotspotViewerProps) {
  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const hasHotspots = hotspots && hotspots.length > 0;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Interactive Screenshot Container */}
      <div 
        className="relative rounded-2xl overflow-hidden border shadow-md group transition-all"
        style={{ 
          background: 'var(--bg-input)', 
          borderColor: 'var(--border-glass)' 
        }}
      >
        {/* Top Floating Controls */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              setIsLightboxOpen(true);
              setZoomLevel(1);
            }}
            className="p-2 rounded-xl backdrop-blur-md bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="بزرگنمایی تمام‌صفحه و جزئیات (Lightbox)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مشاهده تمام‌صفحه</span>
          </button>
        </div>

        {/* Hotspots Info Indicator */}
        {hasHotspots && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md bg-blue-600/90 text-white text-[11px] font-bold shadow-md">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>{hotspots.length} نقطه راهنما</span>
            </span>
          </div>
        )}

        {/* Image with Pins */}
        <div className="relative w-full overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-slate-950/20">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full max-h-[480px] object-contain rounded-xl select-none"
            loading="lazy"
          />

          {/* Render Interactive Hotspots */}
          {hasHotspots &&
            hotspots.map((spot, idx) => {
              const isActive = activeHotspotIndex === idx;

              return (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                  style={{
                    left: `${Math.min(Math.max(spot.x, 2), 98)}%`,
                    top: `${Math.min(Math.max(spot.y, 2), 98)}%`,
                  }}
                  onClick={() => setActiveHotspotIndex(isActive ? null : idx)}
                >
                  {/* Glowing Animated Ring */}
                  <span className="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping" />
                  
                  {/* Pin Circle */}
                  <button
                    type="button"
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 scale-125 ring-4 ring-amber-300'
                        : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-110 ring-2 ring-white/80'
                    }`}
                    title={spot.title}
                  >
                    {idx + 1}
                  </button>

                  {/* Popover Card */}
                  {isActive && (
                    <div
                      className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 w-64 p-3 rounded-2xl shadow-2xl border backdrop-blur-xl z-30 animate-in zoom-in-95 text-right"
                      style={{
                        background: 'var(--bg-glass-strong)',
                        borderColor: 'var(--border-glow)',
                        color: 'var(--text-primary)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h5 className="text-xs font-black truncate">{spot.title}</h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveHotspotIndex(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {spot.note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Hotspots Quick Guide Bar below the screenshot */}
        {hasHotspots && (
          <div 
            className="p-3 border-t flex items-center gap-2 overflow-x-auto text-xs"
            style={{ 
              borderColor: 'var(--border-glass)',
              background: 'var(--bg-surface)' 
            }}
          >
            <span className="text-[11px] font-bold shrink-0 text-slate-400 ml-1">
              راهنمای نقاط:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {hotspots.map((spot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveHotspotIndex(idx)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeHotspotIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                      : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                  }`}
                >
                  <span className="font-mono text-[10px]">{idx + 1}.</span>
                  <span>{spot.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* Fullscreen Lightbox Modal                                                */}
      {/* ======================================================================= */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl animate-in fade-in">
          {/* Modal Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">{alt}</span>
              {hasHotspots && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  {hotspots.length} نقطه راهنما
                </span>
              )}
            </div>

            {/* Zoom and Close Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                  title="بزرگنمایی"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                  title="کوچک‌نمایی"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white cursor-pointer text-xs font-mono"
                  title="بازنشانی اندازه"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono text-white/80">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="بستن پنجره"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Image Body with Zoom */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative">
            <div 
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              />

              {/* Hotspots in Lightbox */}
              {hasHotspots &&
                hotspots.map((spot, idx) => (
                  <div
                    key={idx}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                    }}
                    onClick={() => setActiveHotspotIndex(activeHotspotIndex === idx ? null : idx)}
                  >
                    <button
                      type="button"
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm shadow-xl transition-all cursor-pointer ${
                        activeHotspotIndex === idx
                          ? 'bg-amber-500 text-slate-950 scale-125 ring-4 ring-amber-300'
                          : 'bg-blue-600 text-white hover:scale-110 ring-2 ring-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
