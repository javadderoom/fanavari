'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_USERS } from '@/components/user-session-provider';

const ACTIVE_USER_KEY = 'fanavari-active-user';

interface BrowserAuthor {
  id: string;
  name: string;
  email: string;
  roleName: string;
  avatarUrl?: string | null;
}

type PageState =
  | { kind: 'loading' }
  | { kind: 'logged-out' }
  | { kind: 'no-author'; personaName: string }
  | { kind: 'ready'; author: BrowserAuthor }
  | { kind: 'connected'; author: BrowserAuthor };

/**
 * Browser-login page for the authoring Chrome extension.
 * Shows ONLY the account already logged in to this browser (the dashboard
 * persona stored in localStorage), resolved to its database author record.
 * Nobody else is listed or searchable. Logged out → must log in first.
 * On connect, the issued token is exposed via
 * <meta name="fanavari-ext-token"> for the extension relay to pick up.
 */
export default function ExtensionAuthPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedId = localStorage.getItem(ACTIVE_USER_KEY);
        if (!savedId) {
          if (!cancelled) setState({ kind: 'logged-out' });
          return;
        }
        const persona = DEMO_USERS.find((u) => u.id === savedId);
        if (!persona) {
          if (!cancelled) setState({ kind: 'logged-out' });
          return;
        }
        const res = await fetch(
          `/api/extension/session?email=${encodeURIComponent(persona.email)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.author) {
          setState({ kind: 'ready', author: data.author });
        } else {
          setState({ kind: 'no-author', personaName: persona.name });
        }
      } catch {
        if (!cancelled) setState({ kind: 'logged-out' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = async (author: BrowserAuthor) => {
    setError(null);
    setIsIssuing(true);
    try {
      const res = await fetch('/api/extension/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: author.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در صدور توکن');
      setIssuedToken(data.token);
      setState({ kind: 'connected', author });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در صدور توکن');
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
      dir="rtl"
    >
      {issuedToken && (
        <meta name="fanavari-ext-token" content={issuedToken} />
      )}

      <div
        className="w-full max-w-md rounded-3xl border p-6 sm:p-8 space-y-5 shadow-xl"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
      >
        <div className="text-center">
          <h1 className="text-xl font-black">ورود افزونه نویسندگی</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            فقط حساب واردشده در همین مرورگر متصل می‌شود
          </p>
        </div>

        {state.kind === 'loading' && (
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            در حال بررسی حساب مرورگر...
          </p>
        )}

        {state.kind === 'logged-out' && (
          <div
            className="p-4 rounded-2xl border text-xs leading-relaxed text-center space-y-3"
            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
          >
            <p>در این مرورگر وارد هیچ حسابی نشده‌اید.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              ورود به سامانه و انتخاب حساب
            </Link>
          </div>
        )}

        {state.kind === 'no-author' && (
          <div
            className="p-4 rounded-2xl border text-xs leading-relaxed text-center space-y-3"
            style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.3)' }}
          >
            <p>
              حساب «{state.personaName}» دسترسی نویسندگی ندارد.
              <br />
              با یک حساب نویسنده وارد شوید.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              تغییر حساب در سامانه
            </Link>
          </div>
        )}

        {state.kind === 'ready' && (
          <button
            type="button"
            disabled={isIssuing}
            onClick={() => handleConnect(state.author)}
            className="w-full p-4 rounded-2xl border text-right flex items-center justify-between hover:border-blue-500 transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="text-sm font-bold">{state.author.name}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {state.author.roleName} • {state.author.email}
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {isIssuing ? '...' : 'اتصال ←'}
            </span>
          </button>
        )}

        {state.kind === 'connected' && (
          <div
            className="p-4 rounded-2xl border text-sm font-bold text-center space-y-1"
            style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}
          >
            <div>✅ افزونه برای «{state.author.name}» متصل شد.</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              می‌توانید این برگه را ببندید و به افزونه بازگردید.
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:underline">
            بازگشت به سامانه
          </Link>
        </div>
      </div>
    </div>
  );
}
