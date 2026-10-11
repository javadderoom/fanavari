'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';

      if (isLocalhost || isHttps) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.error('PWA Service Worker registration failed:', err);
          });
      }
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }
    }

    // 3. Check dismissed flag in localStorage
    try {
      const dismissedUntil = localStorage.getItem('fanavari-pwa-dismissed-until');
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch (e) {
      setIsDismissed(false);
    }

    // 4. Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (e) {
      console.error('PWA install prompt error:', e);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      // Dismiss for 7 days
      localStorage.setItem('fanavari-pwa-dismissed-until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch (e) {}
  };

  // Only render if install prompt is available, not already standalone, and not dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-20 lg:bottom-5 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-[9990] animate-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className="p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3"
        style={{
          background: 'var(--bg-glass-strong)',
          borderColor: 'var(--accent-border)',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            }}
          >
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>
              نصب اپلیکیشن فرآیندنما
            </h4>
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              دسترسی سریع و تمام‌صفحه در موبایل و دسکتاپ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نصب</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-slate-500/10 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="بستن اعلان نصب"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
