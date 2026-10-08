'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LookupUser {
  id: string;
  name: string;
  roleName: string;
  avatarUrl?: string | null;
  maskedEmail: string;
}

/**
 * Browser-login page for the authoring Chrome extension.
 * Flow: search author → issue token → the extension's relay content script
 * reads the <meta name="fanavari-ext-token"> below and stores it.
 */
export default function ExtensionAuthPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LookupUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [issuedUser, setIssuedUser] = useState<LookupUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 3) {
      setError('برای جستجو حداقل ۳ کاراکتر وارد کنید.');
      return;
    }
    setError(null);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/lookup?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطای جستجو');
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در جستجو');
    } finally {
      setIsSearching(false);
    }
  };

  const handleIssue = async (user: LookupUser) => {
    setError(null);
    setIsIssuing(true);
    try {
      const res = await fetch('/api/extension/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در صدور توکن');
      setIssuedToken(data.token);
      setIssuedUser(user);
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
            حساب نویسنده را انتخاب کنید تا افزونه کروم به سامانه متصل شود
          </p>
        </div>

        {issuedToken && issuedUser ? (
          <div className="text-center space-y-3">
            <div
              className="p-4 rounded-2xl border text-sm font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}
            >
              ✅ افزونه برای «{issuedUser.name}» متصل شد.
              <br />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                می‌توانید این برگه را ببندید و به افزونه بازگردید.
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setIssuedToken(null); setIssuedUser(null); }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              اتصال حساب دیگر
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="نام یا ایمیل نویسنده..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? '...' : 'جستجو'}
              </button>
            </form>

            {error && (
              <p className="text-xs font-bold text-rose-600">{error}</p>
            )}

            <div className="space-y-2">
              {results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  disabled={isIssuing}
                  onClick={() => handleIssue(u)}
                  className="w-full p-3 rounded-xl border text-right flex items-center justify-between hover:border-blue-500 transition-colors cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <div className="text-sm font-bold">{u.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {u.roleName} • {u.maskedEmail}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">اتصال ←</span>
                </button>
              ))}
            </div>
          </>
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
