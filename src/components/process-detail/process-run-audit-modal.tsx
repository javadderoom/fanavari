'use client';

import React, { useState } from 'react';
import { WorkflowRun, WorkflowStepLog } from '@/types/process';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission } from '@/lib/permissions';
import { notify } from '@/lib/notify';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Printer, 
  Download, 
  AlertTriangle, 
  AlertCircle, 
  Award, 
  Check, 
  Ban, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';

interface ProcessRunAuditModalProps {
  run: WorkflowRun;
  processTitle: string;
  processSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onRunUpdated: (updatedRun: WorkflowRun) => void;
}

export function ProcessRunAuditModal({
  run,
  processTitle,
  processSlug,
  isOpen,
  onClose,
  onRunUpdated,
}: ProcessRunAuditModalProps) {
  const { currentUser } = useUserSession();
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [activeView, setActiveView] = useState<'timeline' | 'certificate'>('timeline');

  if (!isOpen) return null;

  const canSupervise = hasPermission(
    currentUser.permissions, 
    Permissions.ADMINISTRATOR | Permissions.VIEW_AUDIT_LOGS | Permissions.EDIT_PROCESSES
  );

  const formatSeconds = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  const handleSupervisorAction = async (action: 'approve' | 'reject') => {
    const actionLabel = action === 'approve' ? 'تایید انطباق' : 'رد انطباق';
    const confirmed = await notify.confirm({
      title: `${actionLabel} ممیزی فرایند`,
      message: action === 'approve' 
        ? 'آیا از ثبت امضای دیجیتال و تایید نهایی انطباق این اجرای فرایند اطمینان دارید؟'
        : 'آیا از ثبت عدم انطباق برای این اجرای فرایند اطمینان دارید؟',
      confirmText: actionLabel,
      cancelText: 'انصراف',
      isDestructive: action === 'reject',
    });

    if (!confirmed) return;

    setIsSubmittingApproval(true);
    try {
      const res = await fetch(`/api/processes/${processSlug}/runs/${run.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          supervisorAction: action,
          supervisorName: currentUser.name,
          supervisorNotes: supervisorNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify.success(action === 'approve' ? 'تایید انطباق با موفقیت ثبت گردید.' : 'عدم انطباق با موفقیت ثبت شد.');
        onRunUpdated(data.run);
      } else {
        notify.error(data.error || 'خطا در ثبت تاییدیه ناظر');
      }
    } catch (err: any) {
      console.error('Error recording supervisor approval:', err);
      notify.error('خطای شبکه در ثبت تاییدیه ناظر');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleExportJson = () => {
    try {
      const exportData = {
        complianceStandard: 'ISO 9001:2015 Quality Management - SOP Execution Audit',
        runId: run.id,
        runNumber: run.runNumber,
        title: run.title,
        processTitle,
        processSlug,
        operator: {
          name: run.operatorName,
          role: run.operatorRole,
        },
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        totalDurationSeconds: run.totalDurationSeconds,
        completedStepsCount: run.completedStepsCount,
        totalStepsCount: run.totalStepsCount,
        supervisor: {
          name: run.supervisorName,
          status: run.supervisorApprovalStatus,
          approvedAt: run.supervisorApprovedAt,
          notes: run.supervisorNotes,
        },
        stepLogs: run.stepLogs || [],
        exportedAt: new Date().toISOString(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `audit-run-${run.runNumber}-${processSlug}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify.success('فایل گزارش ممیزی با موفقیت دانلود شد.');
    } catch (e) {
      notify.error('خطا در صدور فایل ممیزی');
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden glass-panel-strong"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-card)' }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  ممیزی ایزو ۹۰۰۱
                </span>
                <span className="text-xs font-mono text-slate-400" dir="ltr">
                  #{run.runNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-[var(--text-primary)] mt-1">
                {run.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'timeline' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                لاگ زمانی گام‌ها
              </button>
              <button
                type="button"
                onClick={() => setActiveView('certificate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'certificate' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                شناسنامه و گواهی انطباق
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="دانلود فایل JSON ممیزی"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="چاپ شناسنامه"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>اپراتور مجری</span>
              </div>
              <div className="font-bold text-sm text-[var(--text-primary)]">
                {run.operatorName}
              </div>
              <div className="text-[11px] text-slate-400">
                {run.operatorRole || 'اپراتور سامانه'}
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>پیشرفت مراحل</span>
              </div>
              <div className="font-bold text-sm text-[var(--text-primary)]">
                {run.completedStepsCount} از {run.totalStepsCount} گام
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold" dir="ltr">
                {run.totalStepsCount > 0 ? Math.round((run.completedStepsCount / run.totalStepsCount) * 100) : 0}%
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>مدت زمان کل</span>
              </div>
              <div className="font-bold text-sm text-[var(--text-primary)] font-mono" dir="ltr">
                {formatSeconds(run.totalDurationSeconds)}
              </div>
              <div className="text-[11px] text-slate-400">
                {run.status === 'completed' ? 'خاتمه‌یافته' : 'در جریان'}
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>وضعیت تاییدیه ناظر</span>
              </div>
              <div className="font-bold text-xs mt-0.5">
                {run.supervisorApprovalStatus === 'approved' && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> تایید شده
                  </span>
                )}
                {run.supervisorApprovalStatus === 'rejected' && (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> رد انطباق
                  </span>
                )}
                {run.supervisorApprovalStatus === 'pending' && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> در انتظار بررسی
                  </span>
                )}
                {run.supervisorApprovalStatus === 'none' && (
                  <span className="text-slate-400">بدون نیاز به ناظر</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {run.supervisorName || '—'}
              </div>
            </div>
          </div>

          {/* View 1: Timeline of step logs */}
          {activeView === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>ثبت وقایع به تفکیک گام‌ها (Audit Trail):</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {(run.stepLogs || []).length} رکورد لاگ ثبت شده
                </span>
              </div>

              {(!run.stepLogs || run.stepLogs.length === 0) ? (
                <div className="p-8 rounded-2xl border text-center text-slate-400 bg-slate-50/30 dark:bg-slate-800/20"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">هیچ گامی هنوز به صورت ممیزی ثبت نگردیده است.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {run.stepLogs.map((log) => (
                    <div 
                      key={log.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        log.isCheckpoint 
                          ? 'border-amber-500/30 bg-amber-500/5' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            log.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500'
                          }`}>
                            {log.stepOrder}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[var(--text-primary)]">
                                {log.stepTitle}
                              </span>
                              {log.isCheckpoint && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  چک‌پوینت کنترل کیفیت
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>ثبت پایان: {formatDate(log.completedAt)}</span>
                              {log.durationSeconds !== null && log.durationSeconds !== undefined && (
                                <span className="font-mono text-slate-500" dir="ltr">
                                  (مدت: {formatSeconds(log.durationSeconds)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          {log.supervisorSignOff ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> امضای ناظر ثبت شد
                            </span>
                          ) : log.isCheckpoint ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              نیازمند امضای ناظر
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-slate-400 bg-slate-100 dark:bg-slate-800">
                              تکمیل عادی
                            </span>
                          )}
                        </div>
                      </div>

                      {log.operatorNotes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-400 ml-1">یادداشت اپراتور:</span>
                          {log.operatorNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View 2: Official Certificate View */}
          {activeView === 'certificate' && (
            <div className="p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-slate-500/5 to-emerald-500/5 space-y-6">
              <div className="border-b pb-4 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-blue-600 dark:text-blue-400">
                    شناسنامه رسمی انطباق فرایند سازمانی
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    بر اساس استانداردهای تضمین کیفیت ISO 9001:2015 و مدیریت عملیات
                  </p>
                </div>
                <div className="text-left text-xs text-slate-400 font-mono" dir="ltr">
                  UUID: {run.id.slice(0, 8)}...
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">عنوان فرایند:</span>
                  <span className="font-bold text-[var(--text-primary)]">{processTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">کد رهگیری اجرا:</span>
                  <span className="font-mono font-bold" dir="ltr">RUN-ISO-{run.runNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">زمان شروع اجرا:</span>
                  <span>{formatDate(run.startedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">زمان خاتمه:</span>
                  <span>{formatDate(run.completedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">مجری عملیات:</span>
                  <span className="font-bold">{run.operatorName} ({run.operatorRole || 'اپراتور'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">ناظر کنترل کیفیت:</span>
                  <span className="font-bold">{run.supervisorName || '—'}</span>
                </div>
              </div>

              {run.notes && (
                <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold block mb-1">توضیحات و اهداف اجرا:</span>
                  {run.notes}
                </div>
              )}

              {run.supervisorApprovalStatus === 'approved' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        مهر و امضای دیجیتال ناظر تایید شد
                      </div>
                      <div className="text-[11px] text-slate-400">
                        تایید شده توسط {run.supervisorName} در تاریخ {formatDate(run.supervisorApprovedAt)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Supervisor Approval Control Panel */}
          {canSupervise && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    پنل نظارت و امضای ممیزی (ویژه ناظران کیفی و مدیران)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  کاربر: {currentUser.name}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  یادداشت نظارتی / دستور اصلاحی:
                </label>
                <textarea
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="در صورت وجود ملاحظات کیفی یا مستندات، شرح آن را وارد فرمایید..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={() => handleSupervisorAction('reject')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>ثبت عدم انطباق (رد)</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={() => handleSupervisorAction('approve')}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{run.supervisorApprovalStatus === 'approved' ? 'به‌روزرسانی تاییدیه ناظر' : 'تایید انطباق و ثبت امضای دیجیتال'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[11px] text-slate-400">
            شناسه یکتای ممیزی: <span className="font-mono" dir="ltr">{run.id}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[var(--text-primary)] transition-all cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
