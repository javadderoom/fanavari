'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkflowRun } from '@/types/process';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { ProcessRunAuditModal } from './process-run-audit-modal';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  Award, 
  RefreshCw,
  Search,
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface ProcessRunsTabProps {
  processId: string;
  processSlug: string;
  processTitle: string;
  totalSteps: number;
  activeRunId?: string | null;
  onActivateRun?: (run: WorkflowRun) => void;
}

export function ProcessRunsTab({
  processId,
  processSlug,
  processTitle,
  totalSteps,
  activeRunId,
  onActivateRun,
}: ProcessRunsTabProps) {
  const { currentUser } = useUserSession();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [stats, setStats] = useState<{
    totalRuns: number;
    completedRuns: number;
    completionRatePercent: number;
    averageDurationSeconds: number | null;
    pendingSupervisor: number;
    approvedRuns: number;
  }>({
    totalRuns: 0,
    completedRuns: 0,
    completionRatePercent: 0,
    averageDurationSeconds: null,
    pendingSupervisor: 0,
    approvedRuns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [newRunTitle, setNewRunTitle] = useState('');
  const [newRunNotes, setNewRunNotes] = useState('');
  const [isStartingRun, setIsStartingRun] = useState(false);

  // Audit Log details modal
  const [selectedAuditRun, setSelectedAuditRun] = useState<WorkflowRun | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${processSlug}/runs`, {
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (!res.ok) throw new Error('Failed to load runs');
      const data = await res.json();
      setRuns(data.runs || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading workflow runs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [processSlug, currentUser.id]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleOpenStartModal = () => {
    setNewRunTitle(`اجرای رسمی ممیزی #${runs.length + 1}`);
    setNewRunNotes('');
    setIsStartModalOpen(true);
  };

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStartingRun(true);
    try {
      const res = await fetch(`/api/processes/${processSlug}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: newRunTitle.trim() || undefined,
          notes: newRunNotes.trim() || undefined,
          operatorName: currentUser.name,
          operatorRole: currentUser.roleName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify.success('اجرای رسمی جدید با موفقیت ایجاد گردید.');
        setIsStartModalOpen(false);
        await fetchRuns();
        if (onActivateRun && data.run) {
          onActivateRun(data.run);
        }
      } else {
        notify.error(data.error || 'خطا در ایجاد اجرای رسمی');
      }
    } catch (err: any) {
      console.error('Error starting run:', err);
      notify.error('خطای شبکه در آغاز اجرای رسمی');
    } finally {
      setIsStartingRun(false);
    }
  };

  const handleDeleteRun = async (run: WorkflowRun) => {
    const confirmed = await notify.confirm({
      title: 'حذف رکورد اجرای فرایند',
      message: `آیا از حذف لاگ اجرای شماره ${run.runNumber} اطمینان دارید؟ تمامی تاریخچه مراحل و ممیزی‌های این اجرا حذف خواهد شد.`,
      confirmText: 'حذف رکورد',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/processes/${processSlug}/runs/${run.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (res.ok) {
        notify.success('رکورد اجرا با موفقیت حذف شد.');
        setRuns((prev) => prev.filter((r) => r.id !== run.id));
        if (selectedAuditRun?.id === run.id) {
          setSelectedAuditRun(null);
        }
      } else {
        notify.error('خطا در حذف رکورد');
      }
    } catch (err) {
      notify.error('خطای شبکه در حذف رکورد');
    }
  };

  const formatSeconds = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    if (mins === 0) return `${remainingSecs} ثانیه`;
    return `${mins} دقیقه ${remainingSecs} ثانیه`;
  };

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  const filteredRuns = runs.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.operatorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(r.runNumber).includes(searchFilter);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border glass-panel transition-all hover:scale-[1.01]"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">کل دفعات اجرای رسمی</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {stats.totalRuns}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.completedRuns} اجرا با موفقیت خاتمه یافته است
          </div>
        </div>

        <div className="p-5 rounded-3xl border glass-panel transition-all hover:scale-[1.01]"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">نرخ تکمیل مراحل</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1" dir="ltr">
            <span>{stats.completionRatePercent}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            انطباق کامل با سرفصل‌های اجرایی
          </div>
        </div>

        <div className="p-5 rounded-3xl border glass-panel transition-all hover:scale-[1.01]"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">میانگین زمان اجرای استاندارد</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[var(--text-primary)]">
            {formatSeconds(stats.averageDurationSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            میانگین مدت زمان اتمام هر دوره اجرا
          </div>
        </div>

        <div className="p-5 rounded-3xl border glass-panel transition-all hover:scale-[1.01]"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">تاییدیه و ممیزی ناظر کیفی</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.approvedRuns}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.pendingSupervisor > 0 ? (
              <span className="text-amber-500 font-bold">{stats.pendingSupervisor} اجرا در انتظار تایید ناظر</span>
            ) : (
              'تمامی ممیزی‌ها بررسی شده است'
            )}
          </div>
        </div>
      </div>

      {/* Action Controls & Filter Bar */}
      <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenStartModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>شروع اجرای رسمی جدید (ثبت ممیزی)</span>
          </button>

          <button
            type="button"
            onClick={fetchRuns}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            title="به‌روزرسانی فهرست"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="جستجو در اپراتور یا عنوان..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="completed">تکمیل شده</option>
            <option value="in_progress">در حال اجرا</option>
            <option value="paused">متوقف شده</option>
            <option value="flagged">علامت‌گذاری شده</option>
          </select>
        </div>
      </div>

      {/* Active Run Banner (If one is currently being operated) */}
      {activeRunId && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-pulse">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>اجرای رسمی فعال در کنسول کاربری</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono" dir="ltr">
                  ACTIVE RUN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تمام گام‌های تکمیلی در تب نقشه فلوچارت و سایدبار به صورت لحظه‌ای در این لاگ ممیزی ذخیره می‌شوند.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Runs List Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-50" />
          <p className="text-xs">در حال بارگذاری لاگ اجراها و سوابق ممیزی...</p>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="p-12 rounded-3xl border text-center text-slate-400 space-y-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            هیچ لاگ اجرایی یافت نشد
          </h4>
          <p className="text-xs max-w-md mx-auto text-slate-500 leading-relaxed">
            تاکنون اجرای رسمی برای این فرایند ثبت نشده است. با کلیک بر روی دکمه «شروع اجرای رسمی جدید»، می‌توانید دوره اجرای استاندارد خود را آغاز و لاگ ISO 9001 آن را ثبت فرمایید.
          </p>
          <button
            type="button"
            onClick={handleOpenStartModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>شروع اولین اجرای رسمی</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRuns.map((run) => {
            const isThisRunActive = activeRunId === run.id;
            const progressPercent = run.totalStepsCount > 0 
              ? Math.round((run.completedStepsCount / run.totalStepsCount) * 100) 
              : 0;

            return (
              <div
                key={run.id}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  isThisRunActive
                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left (Run Details) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 font-mono text-slate-500">
                      #{run.runNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {run.title}
                        </h4>

                        {/* Status Badge */}
                        {run.status === 'completed' && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> تکمیل شده
                          </span>
                        )}
                        {run.status === 'in_progress' && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            در حال اجرا
                          </span>
                        )}
                        {run.status === 'paused' && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            متوقف شده
                          </span>
                        )}
                        {run.status === 'flagged' && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> عدم انطباق
                          </span>
                        )}

                        {/* Supervisor Badge */}
                        {run.supervisorApprovalStatus === 'approved' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> تایید ناظر
                          </span>
                        )}
                        {run.supervisorApprovalStatus === 'pending' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> در انتظار ناظر
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                        <span>اپراتور: <strong className="text-[var(--text-secondary)]">{run.operatorName}</strong> ({run.operatorRole || 'اپراتور'})</span>
                        <span>•</span>
                        <span>شروع: {formatDate(run.startedAt)}</span>
                        {run.completedAt && (
                          <>
                            <span>•</span>
                            <span>پایان: {formatDate(run.completedAt)}</span>
                          </>
                        )}
                        {run.totalDurationSeconds !== null && run.totalDurationSeconds !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500" dir="ltr">
                              {formatSeconds(run.totalDurationSeconds)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle (Progress Bar) */}
                  <div className="lg:w-48 shrink-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>پیشرفت: {run.completedStepsCount} از {run.totalStepsCount} گام</span>
                      <span className="font-mono font-bold" dir="ltr">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Right (Actions) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAuditRun(run)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>لاگ و ممیزی ISO</span>
                    </button>

                    {run.status === 'in_progress' && onActivateRun && (
                      <button
                        type="button"
                        onClick={() => onActivateRun(run)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isThisRunActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isThisRunActive ? 'در حال اجرا...' : 'ادامه در رانر'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteRun(run)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="حذف لاگ اجرا"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Official Run Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div 
            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 glass-panel-strong space-y-5"
            style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">
                    آغاز اجرای رسمی فرایند
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ثبت لاگ ممیزی و استاندارد انطباق
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartRun} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  عنوان دوره اجرا:
                </label>
                <input
                  type="text"
                  required
                  value={newRunTitle}
                  onChange={(e) => setNewRunTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 block mb-0.5">اپراتور مجری:</span>
                  <span className="font-bold text-[var(--text-primary)]">{currentUser.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 block mb-0.5">سمت سازمانی:</span>
                  <span className="font-bold text-[var(--text-primary)]">{currentUser.roleName || 'کاربر'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  هدف یا یادداشت اولیه اجرا (اختیاری):
                </label>
                <textarea
                  value={newRunNotes}
                  onChange={(e) => setNewRunNotes(e.target.value)}
                  placeholder="مثال: اجرای تست دوره‌ای پایان فصل مالی..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isStartingRun}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isStartingRun ? 'در حال آغاز...' : 'شروع اجرا و اتصال به رانر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISO 9001 Audit Modal */}
      {selectedAuditRun && (
        <ProcessRunAuditModal
          run={selectedAuditRun}
          processTitle={processTitle}
          processSlug={processSlug}
          isOpen={Boolean(selectedAuditRun)}
          onClose={() => setSelectedAuditRun(null)}
          onRunUpdated={(updatedRun) => {
            setSelectedAuditRun(updatedRun);
            setRuns((prev) => prev.map((r) => (r.id === updatedRun.id ? updatedRun : r)));
          }}
        />
      )}
    </div>
  );
}
