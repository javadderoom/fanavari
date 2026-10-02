import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbInformationPostBySlug, getDbInformationPosts } from '@/lib/db-service';
import {
  Home,
  Megaphone,
  FileText,
  BookOpen,
  HelpCircle,
  Pin,
  Calendar,
  Building2,
  Laptop,
  ArrowRight,
  ExternalLink,
  Share2,
  Clock,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const post = await getDbInformationPostBySlug(decodedSlug);
  if (!post) {
    return { title: 'مطلب اطلاعاتی یافت نشد | سامانه فناوری' };
  }

  return {
    title: `${post.title} | سامانه فناوری`,
    description: post.summary || post.content.slice(0, 150),
  };
}

export default async function InformationDetailPage({ params }: Props) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const post = await getDbInformationPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'circular':
        return {
          label: 'بخشنامه و دستورالعمل اداری',
          icon: FileText,
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        };
      case 'guide':
        return {
          label: 'معرفی سامانه و راهنمای کاربری',
          icon: BookOpen,
          badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
        };
      case 'article':
        return {
          label: 'مقاله و پایگاه دانش',
          icon: HelpCircle,
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        };
      default:
        return {
          label: 'اطلاعیه رسمی',
          icon: Megaphone,
          badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
        };
    }
  };

  const getPriorityMeta = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'فوری / بسیار مهم',
          badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30',
          isUrgent: true,
        };
      case 'high':
        return {
          label: 'مهم',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          isUrgent: false,
        };
      default:
        return {
          label: 'عادی',
          badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
          isUrgent: false,
        };
    }
  };

  const typeMeta = getTypeMeta(post.type);
  const priorityMeta = getPriorityMeta(post.priority);
  const TypeIcon = typeMeta.icon;

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <Link href="/information" className="hover:text-indigo-600">
            پایگاه اطلاعات و بخشنامه‌ها
          </Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Container */}
        <article className="space-y-6">
          {/* Header Card */}
          <div
            className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden"
            style={{
              borderColor: priorityMeta.isUrgent ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-glass)',
              background: priorityMeta.isUrgent
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), var(--bg-surface))'
                : 'var(--bg-surface)',
            }}
          >
            {/* Badges row */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${typeMeta.badgeBg}`}>
                  <TypeIcon className="w-3.5 h-3.5" />
                  <span>{typeMeta.label}</span>
                </span>

                {post.priority !== 'normal' && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${priorityMeta.badgeBg}`}>
                    {priorityMeta.isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{priorityMeta.label}</span>
                  </span>
                )}

                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Pin className="w-3.5 h-3.5 fill-indigo-500" />
                    <span>مطلب ویژه سنجاق‌شده</span>
                  </span>
                )}
              </div>

              {/* Publication Date */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono" dir="ltr">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{'\u200E' + new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black leading-snug mb-4" style={{ color: 'var(--text-primary)' }}>
              {post.title}
            </h1>

            {/* Context metadata (Department / System / Author) */}
            <div className="flex items-center gap-4 flex-wrap pt-4 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
              {post.departmentName && (
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>سازمان متولی: {post.departmentName}</span>
                </div>
              )}

              {post.systemToolName && (
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <Laptop className="w-4 h-4 shrink-0" />
                  <span>سامانه مرتبط: {post.systemToolName}</span>
                </div>
              )}

              {post.authorName && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>نگارنده: {post.authorName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Callout Box (if present) */}
          {post.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-sm leading-relaxed font-medium">
              <span className="font-bold block mb-1 text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                خلاصه اجرایی:
              </span>
              {post.summary}
            </div>
          )}

          {/* Main Content Body */}
          <div
            className="glass-panel rounded-3xl p-6 sm:p-8 border shadow-sm prose dark:prose-invert max-w-none"
            style={{
              borderColor: 'var(--border-glass)',
              background: 'var(--bg-surface)',
            }}
          >
            <div
              className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {post.content}
            </div>
          </div>

          {/* External Reference / Download Link (if present) */}
          {post.targetUrl && (
            <div className="glass-card rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ borderColor: 'var(--border-glass)' }}
            >
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">منبع رسمی یا فایل پیوست:</span>
                <span className="font-mono text-xs text-blue-600 break-all" dir="ltr">
                  {post.targetUrl}
                </span>
              </div>

              <a
                href={post.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>مشاهده پیوند و دریافت فایل</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Bottom Back Button & Navigation */}
          <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              href="/information"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به پایگاه اطلاعات و بخشنامه‌ها</span>
            </Link>

            {post.systemToolSlug && (
              <Link
                href={`/system/${post.systemToolSlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>مشاهده سایر فرایندهای {post.systemToolName || 'سامانه'}</span>
              </Link>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
