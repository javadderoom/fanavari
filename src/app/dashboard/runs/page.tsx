'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission } from '@/lib/permissions';
import { WorkflowRun } from '@/types/process';
import { ProcessRunAuditModal } from '@/components/process-detail/process-run-audit-modal';
import { notify } from '@/lib/notify';
import { 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ExternalLink, 
  Printer, 
  Check, 
  Ban, 
  Loader2, 
  Layers, 
  User, 
  FileText,
  Activity,
  ArrowLeft
} from 'lucide-react';

export default function DashboardRunsPage() {
  const { currentUser, isSuperAdmin } = useUserSession();

  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [stats, setStats] = useState<{
    totalRuns: number;
    completedRuns: number;
    inProgressRuns: number;
    pendingApprovalRuns: number;
    approvedRuns: number;
  }>({
    totalRuns: 0,
    completedRuns: 0,
    inProgressRuns: 0,
    pendingApprovalRuns: 0,
    approvedRuns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  // Audit Modal State
  const [selectedRunForAudit, setSelectedRunForAudit] = useState<WorkflowRun | null>(null);

  const canSupervise = hasPermission(
    currentUser.permissions,
    Permissions.ADMINISTRATOR | Permissions.VIEW_AUDIT_LOGS | Permissions.EDIT_PROCESSES
  ) || isSuperAdmin;

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/runs?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.runs) setRuns(data.runs);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load workflow runs:', err);
      notify.error('خطا در بارگذاری لاگ‌های ممیزی اجرا.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      // Status filter
      if (statusFilter !== 'all' && run.status !== statusFilter) {
        return false;
      }

      // Approval filter
      if (approvalFilter !== 'all') {
        if (approvalFilter === 'pending' && run.supervisorApprovalStatus !== 'pending') return false;
        if (approvalFilter === 'approved' && run.supervisorApprovalStatus !== 'approved') return false;
        if (approvalFilter === 'rejected' && run.supervisorApprovalStatus !== 'rejected') return false;
        if (approvalFilter === 'none' && run.supervisorApprovalStatus !== 'none') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = run.title.toLowerCase().includes(q);
        const matchesOperator = run.operatorName.toLowerCase().includes(q);
        const matchesProcess = (run.process?.title || '').toLowerCase().includes(q);
        const matchesRunNumber = String(run.runNumber).includes(q);
        const matchesId = run.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOperator && !matchesProcess && !matchesRunNumber && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [runs, statusFilter, approvalFilter, searchQuery]);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return 'کمتر از ۱ دقیقه';
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (mins === 0) return `${remainingSecs} ثانیه`;
    if (remainingSecs === 0) return `${mins} دقیقه`;
    return `${mins} دقیقه و ${remainingSecs} ثانیه`;
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>ISO 9001:2015 AUDIT HUB</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold">• کارتابل پایش و نظارت</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            کارتابل ممیزی کیفیت و اجراهای رسمی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            بررسی و نظارت بر اجراهای زنده اپراتورها، تایید ایست‌های بازرسی کیفی، امضای دیجیتال ناظران و صدور گواهینامه‌های رسمی انطباق.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRuns}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>به‌روزرسانی داده‌ها</span>
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کل اجراهای ثبت‌شده</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono" dir="ltr">
            {stats.totalRuns}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">پوشش کامل فرایندها</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">در حال اجرا (Live)</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono" dir="ltr">
            {stats.inProgressRuns}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">پایش زنده زمان و گام‌ها</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کارتابل ناظران (در انتظار)</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono" dir="ltr">
            {stats.pendingApprovalRuns}
          </div>
          <span className="text-[11px] text-rose-500 font-bold mt-1 block">نیازمند بررسی و امضا</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">تایید شده با مهر ISO</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono" dir="ltr">
            {stats.approvedRuns}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">انطباق تضمین کیفیت</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="glass-panel-strong rounded-3xl p-4 sm:p-5 border shadow-sm space-y-4"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان اجرا، نام اپراتور، عنوان فرایند، یا کد ممیزی..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                پاکسازی
              </button>
            )}
          </div>

          {/* Supervisor Approval Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setApprovalFilter('all');
                setStatusFilter('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                approvalFilter === 'all' && statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              همه (<span dir="ltr">{runs.length}</span>)
            </button>

            <button
              type="button"
              onClick={() => {
                setApprovalFilter('pending');
                setStatusFilter('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                approvalFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>کارتابل ناظران (<span dir="ltr">{stats.pendingApprovalRuns}</span>)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setApprovalFilter('approved');
                setStatusFilter('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                approvalFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تایید شده (<span dir="ltr">{stats.approvedRuns}</span>)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('in_progress');
                setApprovalFilter('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>در حال اجرا (<span dir="ltr">{stats.inProgressRuns}</span>)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Runs List Table / Cards */}
      <div 
        className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden flex flex-col"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              فهرست اجراهای رسمی و اسناد ممیزی
            </h3>
            <span className="text-xs font-bold text-slate-400">(<span dir="ltr">{filteredRuns.length}</span> مورد)</span>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-emerald-600" />
              <p className="text-xs text-slate-400">در حال دریافت اطلاعات لاگ‌های ممیزی...</p>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                موردی با فیلترهای انتخابی یافت نشد.
              </p>
            </div>
          ) : (
            filteredRuns.map((run) => {
              const isCompleted = run.status === 'completed';
              const isPendingApproval = run.supervisorApprovalStatus === 'pending';
              const isApproved = run.supervisorApprovalStatus === 'approved';
              const isRejected = run.supervisorApprovalStatus === 'rejected';

              return (
                <div 
                  key={run.id}
                  className="p-4 sm:p-5 hover:bg-slate-500/5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Run Info */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20" dir="ltr">
                        RUN #{run.runNumber}
                      </span>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                        {run.title}
                      </h4>

                      {/* Status Badges */}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                      }`}>
                        {isCompleted ? 'خاتمه‌یافته ✓' : 'در حال اجرا (Live)'}
                      </span>

                      {/* Supervisor Approval Status Badge */}
                      {isPendingApproval ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>نیازمند امضای ناظر</span>
                        </span>
                      ) : isApproved ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>ممهور به مهر ISO 9001</span>
                        </span>
                      ) : isRejected ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-800 border border-rose-500/40 flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          <span>عدم انطباق ثبت شد</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>مجری: <strong className="text-slate-700 dark:text-slate-200">{run.operatorName}</strong> ({run.operatorRole || 'اپراتور'})</span>
                      <span>•</span>
                      <span>فرایند: <strong className="text-slate-700 dark:text-slate-200">{run.process?.title || '—'}</strong></span>
                      {run.totalDurationSeconds ? (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300" dir="ltr">⏱️ {formatDuration(run.totalDurationSeconds)}</span>
                        </>
                      ) : null}
                      <span>•</span>
                      <span className="font-mono text-[11px]" dir="ltr">
                        {new Date(run.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>

                    {/* Notes preview */}
                    {run.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                        توضیحات اجرا: {run.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions & Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Inspect & Sign-off Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedRunForAudit(run)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isPendingApproval && canSupervise
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:scale-102'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      title="بررسی جزییات لاگ‌ها و ثبت تاییدیه ناظر"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{canSupervise ? 'بررسی و امضای ممیزی' : 'مشاهده لاگ ممیزی'}</span>
                    </button>

                    {/* Print ISO Certificate */}
                    {run.process?.slug && (
                      <Link
                        href={`/process/${run.process.slug}/print?runId=${run.id}`}
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                        title="چاپ گواهی انطباق رسمی یا صدور PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>چاپ گواهی ISO</span>
                      </Link>
                    )}

                    {/* Jump to Live Process */}
                    {run.process?.slug && (
                      <Link
                        href={`/process/${run.process.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="مشاهده فرایند در پنجره جدید"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Supervisor Audit & Sign-off Modal */}
      {selectedRunForAudit && (
        <ProcessRunAuditModal
          run={selectedRunForAudit}
          processTitle={selectedRunForAudit.process?.title || selectedRunForAudit.title}
          processSlug={selectedRunForAudit.process?.slug || ''}
          isOpen={!!selectedRunForAudit}
          onClose={() => setSelectedRunForAudit(null)}
          onRunUpdated={(updated) => {
            setSelectedRunForAudit(updated);
            // Refresh list in place
            setRuns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            fetchRuns();
          }}
        />
      )}
    </div>
  );
}
