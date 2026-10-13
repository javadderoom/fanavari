'use client';

import React from 'react';
import Link from 'next/link';
import { Process } from '@/types/process';
import { 
  Laptop, 
  Building2, 
  Lock, 
  Globe, 
  CheckCircle2, 
  Share2, 
  Printer, 
  ExternalLink,
  Columns2,
  Play,
  ShieldCheck,
  Sparkles,
  Eye,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { WorkflowRun } from '@/types/process';

interface ProcessHeaderBannerProps {
  process: Process;
  currentProcess: Process;
  isRestricted: boolean;
  matchingRoleGrant?: any;
  matchingDeptGrant?: any;
  matchingUserGrant?: any;
  onOpenAccessModal: () => void;
  onOpenShareModal?: () => void;
  canManageAccess?: boolean;
  onToggleSidecar?: () => void;
  isSidecarOpen?: boolean;
  onStartOfficialRun?: () => void;
  activeRun?: WorkflowRun | null;
}

export function ProcessHeaderBanner({
  process,
  currentProcess,
  isRestricted,
  matchingRoleGrant,
  matchingDeptGrant,
  matchingUserGrant,
  onOpenAccessModal,
  onOpenShareModal,
  canManageAccess = false,
  onToggleSidecar,
  isSidecarOpen = false,
  onStartOfficialRun,
  activeRun,
}: ProcessHeaderBannerProps) {
  return (
    <div
      className="glass-panel-strong rounded-2xl sm:rounded-3xl p-4 sm:p-8 border shadow-xl relative overflow-hidden"
      style={{ borderColor: 'var(--border-glass)' }}
    >
      {/* In-App Back Navigation Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:bg-slate-500/10 active:scale-95 shrink-0"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          title="بازگشت به فهرست یا صفحه قبلی"
        >
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0" />
          <span>بازگشت</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {process.scope === 'software' ? (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Laptop className="w-3.5 h-3.5" />
                <span>دستورالعمل نرم‌افزار</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>فرایند سازمانی و اداری</span>
              </span>
            )}

            <span
              className="text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold flex items-center gap-1"
              style={
                currentProcess.visibility === 'restricted'
                  ? { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
                  : { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }
              }
            >
              {currentProcess.visibility === 'restricted' ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>محرمانه</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>عمومی</span>
                </>
              )}
            </span>

            {isRestricted && (matchingRoleGrant || matchingDeptGrant || matchingUserGrant) && (
              <span className="text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>
                  {matchingRoleGrant 
                    ? `دسترسی: سمت ${matchingRoleGrant.roleName}`
                    : matchingDeptGrant
                    ? `دسترسی: واحد ${matchingDeptGrant.department?.name || 'سازمانی'}`
                    : 'دسترسی شخصی'}
                </span>
              </span>
            )}

            <span
              className="text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
            >
              {process.departmentName}
            </span>

            <span
              className="text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-medium"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            >
              سامانه: {process.targetSystem}
            </span>

            {currentProcess.isPopular && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-xl font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>پرمراجعه</span>
              </span>
            )}

            {typeof currentProcess.viewCount === 'number' && currentProcess.viewCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-xl font-medium"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentProcess.viewCount.toLocaleString('fa-IR')} بازدید</span>
              </span>
            )}

            {currentProcess.nextProcess && (
              <Link
                href={`/process/${currentProcess.nextProcess.slug}`}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-xl font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 transition-colors"
                title={`گام بعدی در زنجیره: ${currentProcess.nextProcess.title}`}
              >
                <Workflow className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>گام بعدی: {currentProcess.nextProcess.title}</span>
              </Link>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black leading-snug sm:leading-tight" style={{ color: 'var(--text-primary)' }}>
            {process.title}
          </h1>

          <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {process.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 self-stretch lg:self-center">
          {/* Tracked Execution Action */}
          {activeRun ? (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-black whitespace-nowrap">
                اجرای رسمی #{activeRun.runNumber} در جریان
              </span>
            </div>
          ) : onStartOfficialRun ? (
            <button
              onClick={onStartOfficialRun}
              type="button"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-105"
              title="آغاز رهگیری زنده این فرایند و ثبت در ممیزی رسمی ISO"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span className="whitespace-nowrap">شروع اجرای رسمی</span>
            </button>
          ) : null}

          {/* Sidecar is desktop-only */}
          {onToggleSidecar && (
            <button
              onClick={onToggleSidecar}
              type="button"
              className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105 ${
                isSidecarOpen
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
              }`}
              title="باز کردن سایدکار جهت اجرای همزمان کنار سایر پنجره‌ها"
            >
              <Columns2 className="w-4 h-4" />
              <span>{isSidecarOpen ? 'بستن سایدکار' : 'سایدکار همراه'}</span>
            </button>
          )}

          <button
            onClick={onOpenShareModal || onOpenAccessModal}
            type="button"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            title="اشتراک‌گذاری این فرایند با همکاران و پیام‌رسان‌ها"
          >
            <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="whitespace-nowrap">اشتراک‌گذاری</span>
          </button>

          {canManageAccess && (
            <button
              onClick={onOpenAccessModal}
              type="button"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              title="مدیریت دسترسی‌ها و محرمانگی این فرایند"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">دسترسی‌ها</span>
            </button>
          )}

          <Link
            href={`/process/${process.slug}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            title="مشاهده نسخه چاپی رسمی، خوانا و بدون منو (A4 / PDF)"
          >
            <Printer className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="whitespace-nowrap">چاپ / PDF</span>
          </Link>

          {process.targetUrl && (
            <a
              href={process.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
            >
              <span className="whitespace-nowrap">ورود به سامانه</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
