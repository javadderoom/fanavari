'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { ProcessEditorModal } from '@/components/process-editor-modal';
import { ProcessAccessModal } from '@/components/process-access-modal';
import { DeleteImpactDialog } from '@/components/delete-impact-dialog';
import { Process } from '@/types/process';
import { notify } from '@/lib/notify';
import { 
  Workflow, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
  Loader2, 
  Filter,
  Layers,
  Building2,
  Laptop,
  ShieldCheck,
  Lock,
  Globe,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DashboardProcessesPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Process | null>(null);
  const [accessModalProcess, setAccessModalProcess] = useState<Process | null>(null);

  // Delete-impact preview state
  const [impactProc, setImpactProc] = useState<Process | null>(null);
  const [impactCounts, setImpactCounts] = useState<{
    steps: number;
    errorGuides: number;
    savedSessions: number;
    accessGrants: number;
    workflowRuns: number;
    parentSteps: number;
  } | null>(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = can(Permissions.CREATE_PROCESSES) || isSuperAdmin;
  const canEdit = can(Permissions.EDIT_PROCESSES) || isSuperAdmin;
  const canDelete = can(Permissions.DELETE_PROCESSES) || isSuperAdmin;

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/processes?status=all', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': encodeURIComponent(currentUser.roleName || ''),
          'x-user-dept': currentUser.departmentId || '',
          'x-user-permissions': String(currentUser.permissions),
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProcesses(data);
      }
    } catch (err) {
      console.error('Failed to load processes:', err);
      notify.error('خطا در بارگذاری لیست فرایندها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [currentUser.id, currentUser.roleName, currentUser.departmentId, currentUser.permissions]);

  const systemsList = useMemo(() => {
    const list = Array.from(new Set(processes.map((p) => p.targetSystem).filter(Boolean)));
    return list;
  }, [processes]);

  const departmentsList = useMemo(() => {
    const list = Array.from(new Set(processes.map((p) => p.departmentName).filter(Boolean)));
    return list;
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    return processes.filter((proc) => {
      const isArchived = proc.isPublished === false;
      if (statusFilter === 'published' && isArchived) {
        return false;
      }
      if (statusFilter === 'archived' && !isArchived) {
        return false;
      }
      if (selectedSystemFilter !== 'all' && proc.targetSystem !== selectedSystemFilter) {
        return false;
      }
      if (selectedDeptFilter !== 'all' && proc.departmentName !== selectedDeptFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        proc.title.toLowerCase().includes(q) ||
        proc.targetSystem.toLowerCase().includes(q) ||
        proc.departmentName.toLowerCase().includes(q) ||
        proc.slug.toLowerCase().includes(q) ||
        (proc.description && proc.description.toLowerCase().includes(q))
      );
    });
  }, [processes, searchQuery, selectedSystemFilter, selectedDeptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProcesses.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pagedProcesses = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProcesses.slice(start, start + pageSize);
  }, [filteredProcesses, safePage, pageSize]);

  const pageRangeStart = filteredProcesses.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageRangeEnd = Math.min(safePage * pageSize, filteredProcesses.length);

  // Compact page-number window (RTL-friendly, max 5 numbers)
  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  const handleOpenCreate = () => {
    setProcessToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proc: Process) => {
    setProcessToEdit(proc);
    setIsModalOpen(true);
  };

  const handleSaveProcess = async (savedProcess: Process) => {
    try {
      const res = await fetch('/api/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(savedProcess),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطای سرور (${res.status})`);
      }

      notify.success('فرایند با موفقیت ذخیره گردید.');
      await fetchProcesses();
    } catch (err: any) {
      console.error('Error saving process:', err);
      notify.error(`خطا در ثبت فرایند: ${err.message || 'خطای سرور'}`);
    }
  };

  const handleArchiveToggle = async (proc: Process, archive: boolean) => {
    const confirmed = await notify.confirm({
      title: archive ? 'بایگانی فرایند' : 'بازگردانی فرایند از بایگانی',
      message: archive
        ? `آیا «${proc.title}» از کاتالوگ عمومی پنهان و به بایگانی منتقل شود؟ فرایند حذف نمی‌شود و بعداً قابل بازگردانی است.`
        : `آیا «${proc.title}» دوباره در کاتالوگ عمومی منتشر شود؟`,
      confirmText: archive ? 'بله، بایگانی شود' : 'بله، بازگردانی شود',
      cancelText: 'انصراف',
      isDestructive: archive,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/processes/${proc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({ isPublished: !archive }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطای سرور (${res.status})`);
      }

      const updated: Process = await res.json();
      setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      notify.success(archive ? 'فرایند به بایگانی منتقل شد.' : 'فرایند بازگردانی و منتشر شد.');
    } catch (err: any) {
      console.error('Error toggling process archive:', err);
      notify.error(err.message || 'خطا در تغییر وضعیت بایگانی.');
    }
  };

  const handleDelete = async (proc: Process) => {
    // Step 1: open the impact preview and load live relation counts.
    setImpactProc(proc);
    setImpactCounts(null);
    setIsImpactLoading(true);
    try {
      const res = await fetch(
        `/api/processes/impact?id=${proc.id}&slug=${encodeURIComponent(proc.slug)}`,
        {
          headers: {
            'x-user-permissions': String(currentUser.permissions),
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در بررسی وابستگی‌ها');
      }
      const data = await res.json();
      setImpactCounts(data.impact || null);
    } catch (err: any) {
      console.error('Error loading delete impact:', err);
      notify.error(err.message || 'خطا در بررسی وابستگی‌های فرایند.');
      setImpactProc(null);
    } finally {
      setIsImpactLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!impactProc) return;
    const proc = impactProc;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/processes/${proc.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطای سرور (${res.status})`);
      }

      setProcesses((prev) => prev.filter((p) => p.id !== proc.id));
      setImpactProc(null);
      setImpactCounts(null);
      notify.success(`فرایند «${proc.title}» برای همیشه حذف شد.`);
    } catch (err: any) {
      console.error('Error deleting process:', err);
      notify.error(err.message || 'خطا در حذف فرایند.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveInsteadOfDelete = async () => {
    if (!impactProc) return;
    const proc = impactProc;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/processes/${proc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({ isPublished: false }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطای سرور (${res.status})`);
      }

      const updated: Process = await res.json();
      setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setImpactProc(null);
      setImpactCounts(null);
      notify.success('فرایند به‌جای حذف، به بایگانی منتقل شد.');
    } catch (err: any) {
      console.error('Error archiving process:', err);
      notify.error(err.message || 'خطا در بایگانی فرایند.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت فرایندهای سازمانی و نرم‌افزاری
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            کاتالوگ جامع دستورالعمل‌ها، نقشه‌های فلوچارت، مراحل اجرایی و کدهای خطا
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت فرایند جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="p-4 rounded-2xl border space-y-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="جستجو بر اساس عنوان، سامانه، سازمان یا اسلاگ..."
              className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Status Tabs: published / archived */}
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              همه ({processes.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('published'); setCurrentPage(1); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>منتشر شده ({processes.filter((p) => p.isPublished !== false).length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('archived'); setCurrentPage(1); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'archived'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>بایگانی ({processes.filter((p) => p.isPublished === false).length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* System Filter */}
          <select
            value={selectedSystemFilter}
            onChange={(e) => { setSelectedSystemFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">همه سامانه‌ها ({systemsList.length})</option>
            {systemsList.map((sys) => (
              <option key={sys} value={sys}>
                سامانه: {sys}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => { setSelectedDeptFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">همه سازمان‌ها ({departmentsList.length})</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                سازمان: {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div 
        className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              لیست فرایندها ({filteredProcesses.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
            <p className="text-xs text-slate-500">در حال دریافت فرایندها از پایگاه داده...</p>
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="p-16 text-center">
            <Workflow className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
            <h4 className="text-sm font-bold">فرایندی یافت نشد</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchQuery ? 'با این فیلترها و کلمات جستجو هیچ فرایندی پیدا نشد.' : 'هنوز هیچ فرایندی ثبت نشده است.'}
            </p>
            {canCreate && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت اولین فرایند</span>
              </button>
            )}
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr 
                  className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <th className="p-4">عنوان فرایند</th>
                  <th className="p-4">سامانه هدف</th>
                  <th className="p-4">سازمان متولی</th>
                  <th className="p-4 text-center">مراحل و گام‌ها</th>
                  <th className="p-4">شناسه لاتین (Slug)</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {pagedProcesses.map((proc) => (
                  <tr 
                    key={proc.id} 
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {proc.title}
                        </span>
                        {proc.isPublished === false && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Archive className="w-2.5 h-2.5" />
                            <span>بایگانی</span>
                          </span>
                        )}
                        {proc.visibility === 'restricted' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" />
                            <span>محدود</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Globe className="w-2.5 h-2.5" />
                            <span>عمومی</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                        {proc.description}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                        <Laptop className="w-3.5 h-3.5" />
                        <span>{proc.targetSystem}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{proc.departmentName}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {proc.steps?.length || proc.totalSteps} مرحله
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500" dir="ltr">
                      {proc.slug}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {proc.isPublished === false ? (
                          <span
                            className="p-1.5 rounded-lg border text-slate-300 dark:text-slate-600 cursor-not-allowed"
                            title="فرایند بایگانی شده — برای مشاهده زنده ابتدا بازگردانی کنید"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <Link
                            href={`/process/${proc.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            title="مشاهده زنده در سایت"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => setAccessModalProcess(proc)}
                          className="p-1.5 rounded-lg border hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors text-amber-600 cursor-pointer"
                          title="مدیریت دسترسی‌ها و محرمانگی"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(proc)}
                            className="p-1.5 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-blue-600 cursor-pointer"
                            title="ویرایش کامل فرایند"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canEdit && proc.isPublished !== false && (
                          <button
                            type="button"
                            onClick={() => handleArchiveToggle(proc, true)}
                            className="p-1.5 rounded-lg border hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors text-amber-600 cursor-pointer"
                            title="بایگانی فرایند (پنهان از کاتالوگ عمومی)"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canEdit && proc.isPublished === false && (
                          <button
                            type="button"
                            onClick={() => handleArchiveToggle(proc, false)}
                            className="p-1.5 rounded-lg border hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors text-emerald-600 cursor-pointer"
                            title="بازگردانی از بایگانی و انتشار مجدد"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(proc)}
                            className="p-1.5 rounded-lg border hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors text-rose-600 cursor-pointer"
                            title="حذف دائمی فرایند"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-[11px] font-semibold text-slate-500">
              نمایش {pageRangeStart} تا {pageRangeEnd} از {filteredProcesses.length} فرایند
            </span>

            <div className="flex items-center gap-1.5">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1.5 rounded-lg text-[11px] border outline-none cursor-pointer font-bold"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
                title="تعداد ردیف در هر صفحه"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} در صفحه
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                title="صفحه قبلی"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={`min-w-8 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    num === safePage
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  style={num === safePage ? undefined : { borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                title="صفحه بعدی"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Process Editor Modal */}
      <ProcessEditorModal
        isOpen={isModalOpen}
        processToEdit={processToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProcess}
      />

      {/* Process Granular Access & Sharing Modal */}
      {accessModalProcess && (
        <ProcessAccessModal
          process={accessModalProcess}
          isOpen={Boolean(accessModalProcess)}
          onClose={() => setAccessModalProcess(null)}
          onUpdate={(updated) => {
            setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setAccessModalProcess(updated);
          }}
        />
      )}

      {/* Delete impact preview: everything cascades — archive is the default */}
      {impactProc && (
        <DeleteImpactDialog
          isOpen={Boolean(impactProc)}
          entityKindLabel="فرایند"
          entityName={impactProc.title}
          notice="حذف دائمی، تمام مراحل، خطاها و سوابق اجرایی را پاک می‌کند. در بیشتر موارد بایگانی کافی است: فرایند از کاتالوگ عمومی پنهان می‌شود ولی قابل بازگردانی می‌ماند."
          secondaryAction={
            impactProc.isPublished === false
              ? undefined
              : { label: 'بایگانی به‌جای حذف', onClick: handleArchiveInsteadOfDelete }
          }
          survivors={[
            {
              label: 'گام‌های فرایندهای والد (ارجاع زیر-فرایند)',
              count: impactCounts?.parentSteps ?? 0,
              hint: 'حفظ می‌شوند ولی پیوند زیر-فرایندشان قطع می‌شود',
            },
          ]}
          destroyed={[
            { label: 'گام‌های اجرایی', count: impactCounts?.steps ?? 0 },
            {
              label: 'راهنماهای رفع خطا',
              count: impactCounts?.errorGuides ?? 0,
              hint: 'همراه با گام‌ها پاک می‌شوند',
            },
            {
              label: 'اجراهای ثبت‌شده (سوابق ممیزی)',
              count: impactCounts?.workflowRuns ?? 0,
              hint: 'به‌همراه لاگ گام‌ها پاک می‌شوند',
            },
            { label: 'نشست‌های ذخیره‌شده کاربران', count: impactCounts?.savedSessions ?? 0 },
            {
              label: 'مجوزهای دسترسی',
              count: impactCounts?.accessGrants ?? 0,
              hint: 'سطح دسترسی کاربران از بین می‌رود',
            },
          ]}
          isLoading={isImpactLoading}
          isConfirming={isDeleting}
          confirmText="بله، برای همیشه حذف شود"
          onCancel={() => {
            if (isDeleting) return;
            setImpactProc(null);
            setImpactCounts(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
