'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboardingTour } from './onboarding-context';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check, 
  HelpCircle,
  Compass
} from 'lucide-react';

interface TargetCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PADDING = 8;

export function SpotlightTour() {
  const { 
    isActive, 
    currentStep, 
    currentStepIndex, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTour 
  } = useOnboardingTour();

  const [coords, setCoords] = useState<TargetCoords | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update target coordinates
  const updateTargetPosition = useCallback(() => {
    if (!isActive) return;
    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      // Scroll into view if out of viewport
      const isInView = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!isInView) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    } else {
      setCoords(null);
    }
  }, [isActive, currentStep.targetSelector]);

  // Track position on step change, resize, and scroll
  useEffect(() => {
    if (!isActive) return;

    // Small delay to allow any layout shifts to complete
    const timeout = setTimeout(updateTargetPosition, 100);

    window.addEventListener('scroll', updateTargetPosition, { passive: true });
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', updateTargetPosition);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, currentStepIndex, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTour();
      } else if (e.key === 'ArrowLeft') {
        // In RTL, ArrowLeft navigates forward
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowRight') {
        // In RTL, ArrowRight navigates backward
        e.preventDefault();
        prevStep();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive) return null;

  // Calculate desktop tooltip position
  let popoverStyle: React.CSSProperties = {};
  if (!isMobile && coords) {
    const cardWidth = 360;
    const cardHeight = 220;
    const spaceBelow = window.innerHeight - (coords.y + coords.height);
    const placeTop = spaceBelow < cardHeight + 24 && coords.y > cardHeight + 24;

    const top = placeTop
      ? Math.max(16, coords.y - cardHeight - 16)
      : Math.min(window.innerHeight - cardHeight - 16, coords.y + coords.height + 16);

    // Center horizontally relative to target, clamped within viewport
    const idealLeft = coords.x + coords.width / 2 - cardWidth / 2;
    const left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, idealLeft));

    popoverStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 9999,
    };
  } else if (!isMobile && !coords) {
    // Fallback desktop centered if element not found
    popoverStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '380px',
      zIndex: 9999,
    };
  }

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div 
      className="fixed inset-0 z-[9990] select-none"
      role="dialog"
      aria-modal="true"
      aria-label="راهنمای تعاملی سامانه فرآیندنما"
    >
      {/* SVG Backdrop Mask */}
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 9991 }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {coords && (
              <rect
                x={Math.max(0, coords.x - PADDING)}
                y={Math.max(0, coords.y - PADDING)}
                width={coords.width + PADDING * 2}
                height={coords.height + PADDING * 2}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Semi-transparent dark overlay */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 10, 24, 0.76)"
          mask="url(#spotlight-mask)"
          className="pointer-events-auto cursor-pointer"
          onClick={skipTour}
        />

        {/* Pulsing ring around target element */}
        {coords && (
          <rect
            x={Math.max(0, coords.x - PADDING)}
            y={Math.max(0, coords.y - PADDING)}
            width={coords.width + PADDING * 2}
            height={coords.height + PADDING * 2}
            rx="16"
            ry="16"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            className="animate-pulse pointer-events-none"
          />
        )}
      </svg>

      {/* Popover Card */}
      <div
        ref={cardRef}
        style={popoverStyle}
        className={`pointer-events-auto transition-all duration-200 animate-in fade-in zoom-in-95 ${
          isMobile
            ? 'fixed bottom-20 left-3 right-3 z-[9999] max-w-lg mx-auto'
            : ''
        }`}
      >
        <div
          className="rounded-3xl p-5 sm:p-6 border shadow-2xl backdrop-blur-2xl"
          style={{
            backgroundColor: 'var(--bg-surface-elevated, #ffffff)',
            borderColor: 'var(--border-glass, rgba(59, 130, 246, 0.3))',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </span>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {currentStep.badge || `گام ${currentStepIndex + 1} از ${totalSteps}`}
              </span>
            </div>

            <button
              type="button"
              onClick={skipTour}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="بستن راهنما"
              title="بستن راهنما (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h3 
            className="text-base font-black mb-2 leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentStep.title}
          </h3>

          {/* Description */}
          <p 
            className="text-xs sm:text-sm leading-relaxed mb-5 font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {currentStep.description}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            {/* Step Indicators Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-blue-600 dark:bg-blue-400'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>قبلی</span>
                </button>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-white shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                }}
              >
                {isLastStep ? (
                  <>
                    <span>شروع کار با سامانه</span>
                    <Check className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>گام بعدی</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
