'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { notify } from '@/lib/notify';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  FileCode,
  Sparkles,
  KeyRound,
  Layers,
  ArrowUpRight,
  Info,
  Clock,
  Check,
  Copy,
} from 'lucide-react';

interface IndexingStats {
  publicProcesses: number;
  publicSystems: number;
  publicPosts: number;
  staticRoutes: number;
  totalIndexableUrls: number;
}

interface IndexingStatusResponse {
  configured: boolean;
  clientEmail: string | null;
  hasPrivateKey: boolean;
  baseUrl: string;
  sitemapUrl: string;
  stats: IndexingStats;
}

export default function DashboardIndexingPage() {
  const { can, isSuperAdmin } = useUserSession();
  const isAdmin = can(Permissions.ADMINISTRATOR) || isSuperAdmin;

  const [data, setData] = useState<IndexingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single URL submission
  const [testUrl, setTestUrl] = useState('');
  const [testAction, setTestAction] = useState<'URL_UPDATED' | 'URL_DELETED'>('URL_UPDATED');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<any | null>(null);

  // Batch index all
  const [isIndexingAll, setIsIndexingAll] = useState(false);
  const [batchSummary, setBatchSummary] = useState<any | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/google-index');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        notify.error('خطا در دریافت وضعیت نمایه‌سازی گوگل');
      }
    } catch (err) {
      console.error(err);
      notify.error('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    notify.success('در کلیپ‌بورد کپی شد');
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) {
      notify.info('لطفاً آدرس صفحه را وارد کنید.');
      return;
    }

    setIsSubmittingSingle(true);
    setSingleResult(null);

    try {
      const res = await fetch('/api/admin/google-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify',
          url: testUrl.trim(),
          type: testAction,
        }),
      });

      const resJson = await res.json();
      setSingleResult(resJson);

      if (res.ok && resJson.result?.success) {
        notify.success('اعلان نمایه‌سازی با موفقیت به گوگل ارسال شد!');
      } else if (resJson.result?.skipped) {
        notify.info('شناسه‌های سرویس گوگل تنظیم نشده است؛ عملیات عبور کرد.');
      } else {
        notify.error(resJson.result?.error || resJson.error || 'خطا در ثبت اعلان در گوگل');
      }
    } catch (err: any) {
      notify.error(err.message || 'خطا در برقراری ارتباط');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  const handleIndexAll = async () => {
    const total = data?.stats?.totalIndexableUrls || 'تمام';
    const confirmed = await notify.confirm({
      title: 'ارسال همه صفحات به گوگل',
      message: `آیا مایل به ارسال ${total} صفحه عمومی سایت به Google Indexing API هستید؟`,
      confirmText: 'بله، ارسال شود',
      cancelText: 'انصراف',
    });

    if (!confirmed) return;

    setIsIndexingAll(true);
    setBatchSummary(null);
    try {
      const res = await fetch('/api/admin/google-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'index_all' }),
      });

      const json = await res.json();
      setBatchSummary(json.summary);

      if (json.summary?.skipped > 0 && json.summary?.succeeded === 0) {
        notify.info(`${json.summary.skipped} آدرس به دلیل نبود کلید گوگل اسکیپ شدند.`);
      } else {
        notify.success(
          `عملیات تکمیل شد: ${json.summary?.succeeded || 0} آدرس با موفقیت به گوگل ارسال شدند.`
        );
      }
    } catch (err: any) {
      notify.error(err.message || 'خطا در ارسال گروهی به گوگل');
    } finally {
      setIsIndexingAll(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        دسترسی به بخش مدیریت نمایه‌سازی گوگل تنها برای راهبران سیستم مجاز است.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                نمایه‌سازی و سئو گوگل (Google Indexing)
              </h1>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{
                  background: data?.configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: data?.configured ? '#10b981' : '#f59e0b',
                }}
              >
                {data?.configured ? 'API متصل' : 'نیازمند تنظیم'}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              سیستم خودکار ثبت و به‌روزرسانی سریع صفحات فرآیندنما در موتور جستجوی گوگل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            به‌روزرسانی وضعیت
          </button>
          {data?.sitemapUrl && (
            <a
              href={data.sitemapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white shadow-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              }}
            >
              <FileCode className="w-3.5 h-3.5" />
              مشاهده sitemap.xml
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>کل صفحات قابل نمایه</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
            {data?.stats?.totalIndexableUrls ?? '...'}
          </div>
          <div className="text-[11px] mt-1 text-slate-400">حاوی فرآیندها، سامانه‌ها و مقالات</div>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>فرایندهای عمومی</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
            {data?.stats?.publicProcesses ?? '...'}
          </div>
          <div className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400">ارسال خودکار در زمان انتشار</div>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>سامانه‌ها و نرم‌افزارها</span>
            <Search className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
            {data?.stats?.publicSystems ?? '...'}
          </div>
          <div className="text-[11px] mt-1 text-slate-400">ثبت شده در sitemap.xml</div>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>اطلاعیه‌ها و بخشنامه‌ها</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
            {data?.stats?.publicPosts ?? '...'}
          </div>
          <div className="text-[11px] mt-1 text-slate-400">عمومی و معتبر</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Single Page Submission */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                تست و ارسال آنی یک آدرس به گوگل
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              می‌توانید مسیر نسبی (مانند <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">/process/my-slug</code>) یا آدرس کامل را برای ثبت فوری یا حذف از فهرست گوگل ارسال کنید.
            </p>

            <form onSubmit={handleSingleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="مثال: /process/ثبت-نام-دانش-آموزان یا https://..."
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      background: 'var(--bg-canvas)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <select
                  value={testAction}
                  onChange={(e: any) => setTestAction(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none"
                  style={{
                    background: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="URL_UPDATED">ثبت / به‌روزرسانی (URL_UPDATED)</option>
                  <option value="URL_DELETED">حذف از گوگل (URL_DELETED)</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmittingSingle || !testUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  }}
                >
                  {isSubmittingSingle ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  ارسال به گوگل
                </button>
              </div>
            </form>

            {singleResult && (
              <div
                className="p-3.5 rounded-xl border text-xs font-mono overflow-x-auto space-y-1"
                style={{
                  background: 'var(--bg-canvas)',
                  borderColor: singleResult.result?.success
                    ? '#10b981'
                    : singleResult.result?.skipped
                    ? '#f59e0b'
                    : '#ef4444',
                }}
              >
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  {singleResult.result?.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : singleResult.result?.skipped ? (
                    <Info className="w-4 h-4 text-amber-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span>وضعیت پاسخ: {singleResult.result?.success ? 'موفقیت‌آمیز (200 OK)' : singleResult.result?.skipped ? 'صرف‌نظر (Skipped)' : 'خطا'}</span>
                </div>
                <pre className="text-[11px] leading-relaxed p-2 rounded bg-black/5 dark:bg-white/5">
                  {JSON.stringify(singleResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Full Re-Indexing Card */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  ارسال دسته‌جمعی تمام صفحات به گوگل
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {data?.stats?.totalIndexableUrls || 0} صفحه آماده
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              با کلیک روی این دکمه، تمام فرآیندهای عمومی، صفحات سیستم، بخش راهنما، ابزارها و اطلاعیه‌ها به صورت یکجا و کنترل‌شده (با رعایت سقف درخواست‌های گوگل) به Google Indexing API ارسال می‌شوند.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleIndexAll}
                disabled={isIndexingAll}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                }}
              >
                {isIndexingAll ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                شروع ارسال کلیه صفحات به گوگل
              </button>

              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-canvas)',
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                کنسول جستجوی گوگل (Search Console)
              </a>
            </div>

            {batchSummary && (
              <div
                className="p-4 rounded-xl border text-xs space-y-2 mt-4"
                style={{ background: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  گزارش ارسال گروهی:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    موفق: {batchSummary.succeeded}
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                    رد شده (اسکیپ): {batchSummary.skipped}
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                    ناموفق: {batchSummary.failed}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connection & Setup Guide */}
        <div className="space-y-6">
          {/* Status Box */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                وضعیت اتصال به گوگل
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>وضعیت کلید Service Account:</span>
                <span
                  className="font-bold flex items-center gap-1"
                  style={{ color: data?.configured ? '#10b981' : '#f59e0b' }}
                >
                  {data?.configured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {data?.configured ? 'فعال و معتبر' : 'تنظیم نشده'}
                </span>
              </div>

              <div className="pb-2 border-b space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="block" style={{ color: 'var(--text-secondary)' }}>ایمیل سرویس اختصاصی:</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] truncate" dir="ltr" style={{ color: 'var(--text-primary)' }}>
                    {data?.clientEmail || 'تعریف نشده'}
                  </span>
                  {data?.clientEmail && (
                    <button
                      onClick={() => handleCopy(data.clientEmail!, 'email')}
                      className="p-1 hover:opacity-75 transition-opacity"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="pb-2 border-b space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="block" style={{ color: 'var(--text-secondary)' }}>آدرس سایت پایه (Base URL):</span>
                <div className="font-mono text-[11px]" dir="ltr" style={{ color: 'var(--text-primary)' }}>
                  {data?.baseUrl || 'https://farayandnama.ir'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="block" style={{ color: 'var(--text-secondary)' }}>آدرس نقشه سایت (XML Sitemap):</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] truncate text-blue-500" dir="ltr">
                    {data?.sitemapUrl || 'https://farayandnama.ir/sitemap.xml'}
                  </span>
                  {data?.sitemapUrl && (
                    <button
                      onClick={() => handleCopy(data.sitemapUrl!, 'sitemap')}
                      className="p-1 hover:opacity-75 transition-opacity"
                    >
                      {copiedKey === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-3.5 text-xs"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                راهنمای راه‌اندازی گام به گام
              </h2>
            </div>

            <ol className="list-decimal list-inside space-y-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <li>
                در <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">Google Cloud Console</a> یک پروژه بسازید و <b>Web Search Indexing API</b> را فعال نمایید.
              </li>
              <li>
                یک <b>Service Account</b> جدید بسازید و یک کلید خصوصی JSON برای آن دانلود کنید.
              </li>
              <li>
                ایمیل Service Account را در <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">Google Search Console</a> دامنه <code>farayandnama.ir</code> به عنوان کاربر با دسترسی <b>Owner</b> اضافه کنید.
              </li>
              <li>
                دو متغیر زیر را در فایل <code>.env</code> یا کنترل‌پنل سرور (Vercel) قرار دهید:
                <div className="mt-1.5 p-2 rounded font-mono text-[10px] leading-tight bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" dir="ltr">
                  <div>GOOGLE_INDEXING_CLIENT_EMAIL="..."</div>
                  <div>GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
