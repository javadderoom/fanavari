'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { ProcessEditorModal } from '@/components/process-editor-modal';
import { DepartmentEditorModal } from '@/components/department-editor-modal';
import { SystemEditorModal } from '@/components/system-editor-modal';
import { InformationEditorModal } from '@/components/information-editor-modal';
import { Process, OrganizationEntity, SystemTool, InformationPost } from '@/types/process';
import { notify } from '@/lib/notify';
import { 
  Workflow, 
  Building2, 
  Laptop, 
  Megaphone, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Edit3, 
  ArrowLeft,
  Loader2,
  FolderTree,
  ShieldCheck,
  Activity,
  Layers,
  FileText
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [departments, setDepartments] = useState<OrganizationEntity[]>([]);
  const [systems, setSystems] = useState<SystemTool[]>([]);
  const [informationPosts, setInformationPosts] = useState<InformationPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Process | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const canCreateProcess = can(Permissions.CREATE_PROCESSES) || isSuperAdmin;
  const canCreateDept = can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;
  const canManageSystems = can(Permissions.MANAGE_SYSTEMS) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;
  const canManageInformation = can(Permissions.MANAGE_INFORMATION) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [procRes, deptRes, sysRes, infoRes] = await Promise.all([
        fetch('/api/processes', {
          headers: {
            'x-user-id': currentUser.id,
            'x-user-role': encodeURIComponent(currentUser.roleName || ''),
            'x-user-dept': currentUser.departmentId || '',
            'x-user-permissions': String(currentUser.permissions),
          },
        }).then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
        fetch('/api/systems').then((r) => r.json()),
        fetch('/api/information').then((r) => r.json()),
      ]);

      if (Array.isArray(procRes)) setProcesses(procRes);
      if (Array.isArray(deptRes)) setDepartments(deptRes);
      if (Array.isArray(sysRes)) setSystems(sysRes);
      if (Array.isArray(infoRes)) setInformationPosts(infoRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser.id, currentUser.roleName, currentUser.departmentId, currentUser.permissions]);

  const totalSteps = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.steps?.length || p.totalSteps || 0), 0);
  }, [processes]);

  const totalErrors = useMemo(() => {
    return processes.reduce(
      (acc, p) => acc + (p.steps?.reduce((sAcc, s) => sAcc + (s.errorGuides?.length || 0), 0) || 0),
      0
    );
  }, [processes]);

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

      notify.success('فرایند با موفقیت در دیتابیس ثبت شد.');
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error saving process:', err);
      notify.error(`خطا در ثبت فرایند: ${err.message || 'خطای سرور'}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div 
        className="p-6 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04), var(--bg-surface))',
          borderColor: 'var(--border-glass)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              سیستم آنلاین • متصل به PostgreSQL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            خوش آمدید، {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            به مرکز کنترل و مدیریت یکپارچه فرایندها، سازمان‌ها، نرم‌افزارها و اطلاعیه‌های سازمانی خوش آمدید.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canCreateProcess && (
            <button
              type="button"
              onClick={() => {
                setProcessToEdit(null);
                setIsProcessModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>فرایند جدید</span>
            </button>
          )}

          {canManageInformation && (
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>اطلاعیه جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Column Executive Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Processes */}
        <Link 
          href="/dashboard/processes" 
          className="glass-card rounded-2xl p-5 border shadow-xs transition-all hover:scale-105 group cursor-pointer"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>فرایندهای فعال</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
              <Workflow className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">{processes.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-slate-400" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>مدیریت و ویرایش</span>
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 2: Organizations */}
        <Link 
          href="/dashboard/organizations" 
          className="glass-card rounded-2xl p-5 border shadow-xs transition-all hover:scale-105 group cursor-pointer"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>سازمان‌ها و مراجع</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{departments.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-slate-400" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>مدیریت نهادها</span>
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 3: Systems */}
        <Link 
          href="/dashboard/systems" 
          className="glass-card rounded-2xl p-5 border shadow-xs transition-all hover:scale-105 group cursor-pointer"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>نرم‌افزارها و سامانه‌ها</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">{systems.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-slate-400" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>پرتال‌ها و ابزارها</span>
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 4: Information */}
        <Link 
          href="/dashboard/information" 
          className="glass-card rounded-2xl p-5 border shadow-xs transition-all hover:scale-105 group cursor-pointer"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>اطلاعیه‌ها و مقالات</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-600 group-hover:scale-110 transition-transform">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-600">{informationPosts.length}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-slate-400" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>بخشنامه‌ها و راهنما</span>
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 5: Steps & Errors */}
        <div 
          className="glass-card rounded-2xl p-5 border shadow-xs col-span-2 md:col-span-1"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>گام‌ها / رفع خطاها</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600">{totalSteps}</div>
          <div className="mt-2 pt-2 border-t text-[11px] text-slate-400 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>{totalErrors} راهنمای خطا</span>
            <span className="text-emerald-500 font-bold">۱۰۰٪ فعال</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Processes & Recent Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Processes Panel */}
        <div 
          className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden flex flex-col"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                آخرین فرایندهای ثبت شده
              </h3>
            </div>
            <Link 
              href="/dashboard/processes"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه ({processes.length})</span>
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600 mb-2" />
                <span className="text-xs text-slate-400">در حال بارگذاری...</span>
              </div>
            ) : processes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">فرایندی ثبت نشده است.</div>
            ) : (
              processes.slice(0, 5).map((proc) => (
                <div key={proc.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-500/5 transition-colors">
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm block truncate" style={{ color: 'var(--text-primary)' }}>
                      {proc.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold truncate">{proc.targetSystem}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">{proc.departmentName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {proc.steps?.length || proc.totalSteps} گام
                    </span>
                    <Link
                      href={`/process/${proc.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                      style={{ borderColor: 'var(--border-subtle)' }}
                      title="مشاهده"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Information Panel */}
        <div 
          className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden flex flex-col"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                آخرین اطلاعیه‌ها و بخشنامه‌ها
              </h3>
            </div>
            <Link 
              href="/dashboard/information"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه ({informationPosts.length})</span>
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-indigo-600 mb-2" />
                <span className="text-xs text-slate-400">در حال بارگذاری...</span>
              </div>
            ) : informationPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">اطلاعیه‌ای ثبت نشده است.</div>
            ) : (
              informationPosts.slice(0, 5).map((post) => (
                <div key={post.id || post.slug} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-500/5 transition-colors">
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm block truncate" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono" dir="ltr">
                        {post.publishedAt ? '\u200E' + new Date(post.publishedAt).toLocaleDateString('fa-IR') : 'پیش‌نویس'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{post.departmentName || 'عمومی'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {post.isPublished === false ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                        پیش‌نویس
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        منتشر شده
                      </span>
                    )}
                    <Link
                      href={`/information/${post.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                      style={{ borderColor: 'var(--border-subtle)' }}
                      title="مشاهده"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/scopes-categories"
          className="p-4 rounded-2xl border transition-all hover:scale-102 flex items-center gap-3"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm block" style={{ color: 'var(--text-primary)' }}>
              حوزه‌ها و دسته‌بندی‌ها
            </span>
            <span className="text-[11px] text-slate-400">
              مدیریت سطوح دسته‌بندی موضوعی
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/permissions"
          className="p-4 rounded-2xl border transition-all hover:scale-102 flex items-center gap-3"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm block" style={{ color: 'var(--text-primary)' }}>
              نقش‌ها و دسترسی‌ها
            </span>
            <span className="text-[11px] text-slate-400">
              ماتریس بیتی مجوزهای کاربری
            </span>
          </div>
        </Link>
      </div>

      {/* Modals */}
      <ProcessEditorModal
        isOpen={isProcessModalOpen}
        processToEdit={processToEdit}
        onClose={() => setIsProcessModalOpen(false)}
        onSave={handleSaveProcess}
      />

      <DepartmentEditorModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />

      <SystemEditorModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />

      <InformationEditorModal
        isOpen={isInfoModalOpen}
        departments={departments}
        systems={systems}
        onClose={() => setIsInfoModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
