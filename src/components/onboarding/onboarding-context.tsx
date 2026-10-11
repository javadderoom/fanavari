'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  badge?: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'omni-search',
    targetSelector: '[data-tour="omni-search"]',
    title: 'جستجوی هوشمند و سراسری (Omni-Search)',
    description: 'هر عنوان فرایند، کد خطای سیستمی (مانند ERR-403)، نام سامانه یا کلیدواژه را اینجا جستجو کنید تا فوراً گام‌های مربوط به آن را بیابید.',
    badge: 'گام ۱ از ۵',
    placement: 'bottom',
  },
  {
    id: 'scope-filter',
    targetSelector: '[data-tour="scope-filter"]',
    title: 'دسته‌بندی‌ها و حوزه‌های عملیاتی',
    description: 'دستورالعمل‌ها را بر اساس حوزه‌های مالی، منابع انسانی، فناوری اطلاعات یا نوع پرتال تفکیک و فیلتر کنید.',
    badge: 'گام ۲ از ۵',
    placement: 'bottom',
  },
  {
    id: 'process-card',
    targetSelector: '[data-tour="process-card"]',
    title: 'ورود به اجرای گام‌به‌گام فرایند',
    description: 'با کلیک روی هر فرایند، وارد راهنمای تعاملی می‌شوید: مسیر منوهای نرم‌افزار، فیلدهای کپی‌کردنی و چک‌لیست گام‌ها با ذخیره خودکار در دسترس شماست.',
    badge: 'گام ۳ از ۵',
    placement: 'top',
  },
  {
    id: 'nav-systems',
    targetSelector: '[data-tour="nav-systems"]',
    title: 'بانک جامع سامانه‌ها و نرم‌افزارها',
    description: 'دایرکتوری کامل پرتال‌های دولتی، نرم‌افزارهای دسکتاپ و ابزارهای مهندسی به همراه دستورالعمل‌های هرکدام را در این بخش مشاهده کنید.',
    badge: 'گام ۴ از ۵',
    placement: 'bottom',
  },
  {
    id: 'pwa-install',
    targetSelector: '[data-tour="pwa-install"]',
    title: 'نصب اپلیکیشن و دسترسی آفلاین (PWA)',
    description: 'سامانه فرآیندنما یک اپلیکیشن مدرن قابل نصب روی موبایل و رایانه است که حتی در صورت قطعی اینترنت، راهنماهای پیشین را در اختیارتان می‌گذارد.',
    badge: 'گام ۵ از ۵',
    placement: 'top',
  },
];

interface OnboardingContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (index: number) => void;
}

const DEFAULT_CONTEXT: OnboardingContextType = {
  isActive: false,
  currentStepIndex: 0,
  currentStep: TOUR_STEPS[0],
  totalSteps: TOUR_STEPS.length,
  startTour: () => {},
  endTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  goToStep: () => {},
};

const OnboardingContext = createContext<OnboardingContextType>(DEFAULT_CONTEXT);

const STORAGE_KEY = 'farayandnama-tour-completed';

function SearchParamsTourListener({ onTrigger }: { onTrigger: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tourParam = searchParams?.get('tour');
    if (tourParam === '1' || tourParam === 'start' || tourParam === 'true') {
      const timer = setTimeout(onTrigger, 400);
      return () => clearTimeout(timer);
    }
  }, [searchParams, onTrigger]);

  return null;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const triggerTourStart = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  // First-time auto-start on homepage (if user has never seen it)
  useEffect(() => {
    if (pathname !== '/') return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Give the page 1.2s to render so target elements are placed
        const timer = setTimeout(() => {
          if (!localStorage.getItem(STORAGE_KEY)) {
            setCurrentStepIndex(0);
            setIsActive(true);
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable / private mode
    }
  }, [pathname]);

  const startTour = useCallback(() => {
    if (pathname !== '/') {
      router.push('/?tour=1');
      return;
    }
    setCurrentStepIndex(0);
    setIsActive(true);
  }, [pathname, router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const currentStep = useMemo(() => {
    return TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  }, [currentStepIndex]);

  const value = useMemo(
    () => ({
      isActive,
      currentStepIndex,
      currentStep,
      totalSteps: TOUR_STEPS.length,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipTour,
      goToStep,
    }),
    [isActive, currentStepIndex, currentStep, startTour, endTour, nextStep, prevStep, skipTour, goToStep]
  );

  return (
    <OnboardingContext.Provider value={value}>
      <React.Suspense fallback={null}>
        <SearchParamsTourListener onTrigger={triggerTourStart} />
      </React.Suspense>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingTour(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  return context || DEFAULT_CONTEXT;
}
