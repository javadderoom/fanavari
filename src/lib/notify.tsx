'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

type ConfirmResolver = (value: boolean) => void;

interface ConfirmState extends ConfirmDialogOptions {
  isOpen: boolean;
  resolve: ConfirmResolver | null;
}

// Global event handlers
let notifyToastListeners: ((toast: ToastItem) => void)[] = [];
let confirmDialogHandler: ((options: ConfirmDialogOptions) => Promise<boolean>) | null = null;

export const notify = {
  success: (message: string) => {
    const item: ToastItem = { id: `toast-${Date.now()}-${Math.random()}`, type: 'success', message };
    notifyToastListeners.forEach((fn) => fn(item));
  },
  error: (message: string) => {
    const item: ToastItem = { id: `toast-${Date.now()}-${Math.random()}`, type: 'error', message };
    notifyToastListeners.forEach((fn) => fn(item));
  },
  info: (message: string) => {
    const item: ToastItem = { id: `toast-${Date.now()}-${Math.random()}`, type: 'info', message };
    notifyToastListeners.forEach((fn) => fn(item));
  },
  confirm: (options: ConfirmDialogOptions | string): Promise<boolean> => {
    const opts: ConfirmDialogOptions = typeof options === 'string' ? { message: options } : options;
    if (confirmDialogHandler) {
      return confirmDialogHandler(opts);
    }
    // Fallback if Toaster is not mounted yet
    return Promise.resolve(false);
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    resolve: null,
  });

  useEffect(() => {
    const handleNewToast = (item: ToastItem) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 4000);
    };

    notifyToastListeners.push(handleNewToast);

    confirmDialogHandler = (opts: ConfirmDialogOptions) => {
      return new Promise<boolean>((resolve) => {
        setConfirmDialog({
          isOpen: true,
          title: opts.title || 'تایید عملیات',
          message: opts.message,
          confirmText: opts.confirmText || 'تایید و ادامه',
          cancelText: opts.cancelText || 'انصراف',
          isDestructive: opts.isDestructive ?? true,
          resolve,
        });
      });
    };

    return () => {
      notifyToastListeners = notifyToastListeners.filter((fn) => fn !== handleNewToast);
      confirmDialogHandler = null;
    };
  }, []);

  const handleConfirm = () => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(true);
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(false);
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  return (
    <>
      {/* Toast notifications container */}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
            }`}
            style={{ background: 'var(--bg-glass-strong)' }}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Modal Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 duration-150"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                }`}
              >
                {confirmDialog.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black">{confirmDialog.title}</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
