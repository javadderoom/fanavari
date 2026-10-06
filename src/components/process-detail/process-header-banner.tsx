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
  Clock, 
  Share2, 
  Printer, 
  ExternalLink,
  Columns2
} from 'lucide-react';

interface ProcessHeaderBannerProps {
  process: Process;
  currentProcess: Process;
  isRestricted: boolean;
  matchingRoleGrant?: any;
  matchingDeptGrant?: any;
  matchingUserGrant?: any;
  onOpenAccessModal: () => void;
  onToggleSidecar?: () => void;
  isSidecarOpen?: boolean;
}

export function ProcessHeaderBanner({
  process,
  currentProcess,
  isRestricted,
  matchingRoleGrant,
  matchingDeptGrant,
  matchingUserGrant,
  onOpenAccessModal,
  onToggleSidecar,
  isSidecarOpen = false,
}: ProcessHeaderBannerProps) {
  return (
    <div
      className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden"
      style={{ borderColor: 'var(--border-glass)' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center flex-wrap gap-2">
            {process.scope === 'software' ? (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Laptop className="w-3.5 h-3.5" />
                <span>دستورالعمل نرم‌افزار</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>فرایند سازمانی و اداری</span>
              </span>
            )}

            <span
              className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"
              style={
                currentProcess.visibility === 'restricted'
                  ? { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
                  : { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }
              }
            >
              {currentProcess.visibility === 'restricted' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>محدود و محرمانه</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>عمومی</span>
                </>
              )}
            </span>

            {isRestricted && (matchingRoleGrant || matchingDeptGrant || matchingUserGrant) && (
              <span className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {matchingRoleGrant 
                    ? `دسترسی فعال: سمت ${matchingRoleGrant.roleName}`
                    : matchingDeptGrant
                    ? `دسترسی فعال: واحد ${matchingDeptGrant.department?.name || 'سازمانی'}`
                    : 'دسترسی فعال شخصی'}
                </span>
              </span>
            )}

            <span
              className="text-xs px-2.5 py-1 rounded-xl font-bold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
            >
              {process.departmentName}
            </span>

            <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-3.5 h-3.5" />
              زمان تخمینی: {process.estimatedMinutes} دقیقه
            </span>

            <span
              className="text-xs px-2.5 py-1 rounded-xl font-medium"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            >
              سامانه: {process.targetSystem}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
            {process.title}
          </h1>

          <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {process.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
          {onToggleSidecar && (
            <button
              onClick={onToggleSidecar}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105 ${
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
            onClick={onOpenAccessModal}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            title="مدیریت دسترسی‌ها و اشتراک‌گذاری"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>اشتراک‌گذاری و دسترسی</span>
          </button>

          <Link
            href={`/process/${process.slug}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-105"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
            title="مشاهده نسخه چاپی رسمی، خوانا و بدون منو (A4 / PDF)"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>نسخه چاپی / PDF</span>
          </Link>

          {process.targetUrl && (
            <a
              href={process.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
            >
              <span>ورود به سامانه</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
