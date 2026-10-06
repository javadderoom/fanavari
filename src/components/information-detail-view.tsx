'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { InformationPost, ProcessVisibility } from '@/types/process';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission } from '@/lib/permissions';
import { InformationAccessModal } from './information-access-modal';
import { notify } from '@/lib/notify';
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
  AlertTriangle,
  UserCheck,
  FileEdit,
  Lock,
  Globe,
  Printer,
  ShieldCheck,
  Check,
  Copy,
  Users
} from 'lucide-react';

interface InformationDetailViewProps {
  post: InformationPost;
}

export function InformationDetailView({ post }: InformationDetailViewProps) {
  const { currentUser } = useUserSession();
  const searchParams = useSearchParams();

  const [currentPost, setCurrentPost] = useState<InformationPost>(post);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-claim invite token if present in URL
  useEffect(() => {
    const claimToken = searchParams.get('claim');
    if (!claimToken) return;

    async function redeemClaim() {
      try {
        const res = await fetch(`/api/information/${post.id}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
          },
          body: JSON.stringify({ claimToken }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          notify.success('دسترسی شما با موفقیت از طریق پیوند دعوت فعال گردید!');
          // Refresh access grants from server
          const grantsRes = await fetch(`/api/information/${post.id}/access`, {
            headers: {
              'x-user-id': currentUser.id,
              'x-user-permissions': String(currentUser.permissions),
            },
          });
          if (grantsRes.ok) {
            const grantsData = await grantsRes.json();
            setCurrentPost((prev) => ({
              ...prev,
              accessGrants: grantsData.accessGrants || [],
            }));
          }
          // Clean URL parameter without page reload
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('claim');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        } else if (!res.ok) {
          notify.error(data.error || 'لینک دعوت نامعتبر است یا منقضی شده است.');
        }
      } catch (err) {
        console.error('Claim redemption error:', err);
      }
    }

    redeemClaim();
  }, [searchParams, post.id, currentUser.id, currentUser.permissions]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      notify.success('لینک مستقیم مطلب در کلیپ‌بورد کپی شد.');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

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

  const isSuperAdmin =
    hasPermission(currentUser.permissions, Permissions.ADMINISTRATOR) ||
    hasPermission(currentUser.permissions, Permissions.MANAGE_INFORMATION);
  const isAuthor = Boolean(currentPost.authorId && currentPost.authorId === currentUser.id);
  const isRestricted = currentPost.visibility === 'restricted';

  // Multi-Audience Union Match:
  const matchingUserGrant = (currentPost.accessGrants || []).find((g) => g.userId === currentUser.id);
  const matchingDeptGrant = (currentPost.accessGrants || []).find(
    (g) => g.departmentId && currentUser.departmentId && g.departmentId === currentUser.departmentId
  );
  const matchingRoleGrant = (currentPost.accessGrants || []).find(
    (g) => g.roleName && currentUser.roleName && g.roleName.trim().toLowerCase() === currentUser.roleName.trim().toLowerCase()
  );

  const hasGrant = Boolean(matchingUserGrant || matchingDeptGrant || matchingRoleGrant);
  const hasAccess = !isRestricted || isSuperAdmin || isAuthor || hasGrant;
  const canManageAccess = isSuperAdmin || isAuthor;

  const typeMeta = getTypeMeta(currentPost.type);
  const priorityMeta = getPriorityMeta(currentPost.priority);
  const TypeIcon = typeMeta.icon;

  // Render Access Gate Lock Screen
  if (!hasAccess) {
    return (
      <div
        className="max-w-2xl mx-auto my-16 p-8 rounded-3xl border text-center space-y-6 glass-panel-strong shadow-2xl animate-in fade-in"
        dir="rtl"
        style={{
          borderColor: 'var(--border-glass)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block">
            بخشنامه و اطلاعیه سازمانی محرمانه
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            دسترسی به این مطلب محدود است
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            این بخشنامه یا راهنما به صورت اختصاصی برای رده‌های سازمانی خاص (نظیر مدیران مدارس، معاونین یا واحد مربوطه) صادر شده است و حساب شما در حال حاضر مجوز مشاهده آن را ندارد.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] inline-flex items-center gap-2">
          <span>حساب جاری شما:</span>
          <strong className="text-[var(--text-primary)]">{currentUser.name}</strong>
          <span>(سمت: {currentUser.roleName})</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/information"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
          >
            بازگشت به پایگاه بخشنامه‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Draft notice */}
      {currentPost.isPublished === false && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <FileEdit className="w-4 h-4 shrink-0 text-amber-500" />
          <span>این مطلب در وضعیت «پیش‌نویس» قرار دارد و هنوز به‌صورت عمومی منتشر نشده است.</span>
        </div>
      )}

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
        {/* Badges row & Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${typeMeta.badgeBg}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{typeMeta.label}</span>
            </span>

            {currentPost.priority !== 'normal' && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${priorityMeta.badgeBg}`}>
                {priorityMeta.isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{priorityMeta.label}</span>
              </span>
            )}

            {currentPost.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Pin className="w-3.5 h-3.5 fill-indigo-500" />
                <span>مطلب ویژه سنجاق‌شده</span>
              </span>
            )}

            {/* Visibility Badge */}
            <span
              className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"
              style={
                isRestricted
                  ? { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
                  : { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }
              }
            >
              {isRestricted ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>محدود سازمانی (RBAC)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>عمومی</span>
                </>
              )}
            </span>

            {/* Grant cohort matching badge */}
            {isRestricted && (matchingRoleGrant || matchingDeptGrant || matchingUserGrant) && (
              <span className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  دسترسی سازمانی مجاز ({matchingRoleGrant ? `سمت: ${matchingRoleGrant.roleName}` : matchingDeptGrant ? 'واحد تابعه' : 'اختصاصی'})
                </span>
              </span>
            )}
          </div>

          {/* Top Actions: Access Modal Trigger, Share, Print */}
          <div className="flex items-center gap-2">
            {canManageAccess && (
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
              >
                <Users className="w-3.5 h-3.5" />
                <span>توزیع چندمخاطبه</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              title="اشتراک‌گذاری"
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="چاپ بخشنامه"
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black leading-snug mb-4" style={{ color: 'var(--text-primary)' }}>
          {currentPost.title}
        </h1>

        {/* Context metadata (Department / System / Author / Date) */}
        <div className="flex items-center gap-4 flex-wrap pt-4 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          {currentPost.departmentName && (
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>سازمان متولی: {currentPost.departmentName}</span>
            </div>
          )}

          {currentPost.systemToolName && (
            <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
              <Laptop className="w-4 h-4 shrink-0" />
              <span>سامانه مرتبط: {currentPost.systemToolName}</span>
            </div>
          )}

          {currentPost.authorName && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>نگارنده: {currentPost.authorName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400 font-mono mr-auto" dir="ltr">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{'\u200E' + new Date(currentPost.publishedAt).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>
      </div>

      {/* Summary Callout Box (if present) */}
      {currentPost.summary && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-sm leading-relaxed font-medium">
          <span className="font-bold block mb-1 text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
            خلاصه اجرایی:
          </span>
          {currentPost.summary}
        </div>
      )}

      {/* Main Content Body */}
      <div
        className="glass-panel rounded-3xl p-6 sm:p-8 border shadow-sm max-w-none"
        style={{
          borderColor: 'var(--border-glass)',
          background: 'var(--bg-surface)',
        }}
      >
        {/<[a-z][\s\S]*>/i.test(currentPost.content) ? (
          <div
            className="rendered-document-content text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20"
            style={{ fontFamily: 'var(--font-sans)' }}
            dangerouslySetInnerHTML={{ __html: currentPost.content }}
          />
        ) : (
          <div
            className="rendered-document-content text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {currentPost.content}
          </div>
        )}
      </div>

      {/* External Reference / Download Link (if present) */}
      {currentPost.targetUrl && (
        <div
          className="glass-card rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">منبع رسمی یا فایل پیوست:</span>
            <span className="font-mono text-xs text-blue-600 break-all" dir="ltr">
              {currentPost.targetUrl}
            </span>
          </div>

          <a
            href={currentPost.targetUrl}
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

        {currentPost.systemToolSlug && (
          <Link
            href={`/system/${currentPost.systemToolSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>مشاهده سایر فرایندهای {currentPost.systemToolName || 'سامانه'}</span>
          </Link>
        )}
      </div>

      {/* Multi-Audience Access Configuration Modal */}
      {isAccessModalOpen && (
        <InformationAccessModal
          post={currentPost}
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          onUpdate={(updated) => setCurrentPost(updated)}
        />
      )}
    </article>
  );
}
