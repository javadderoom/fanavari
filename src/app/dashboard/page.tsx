'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';
import { ProcessEditorModal } from '@/components/process-editor-modal';
import { DepartmentEditorModal } from '@/components/department-editor-modal';
import { Process, OrganizationEntity } from '@/types/process';
import { 
  LayoutDashboard, 
  Workflow, 
  Building2, 
  Laptop, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Layers, 
  Clock, 
  Users, 
  ShieldAlert,
  Loader2,
  ChevronLeft,
  KeyRound
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, can, isSuperAdmin, switchUser } = useUserSession();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'processes' | 'organizations' | 'systems' | 'permissions'>('processes');

  // Live database data states
  const [processes, setProcesses] = useState<Process[]>([]);
  const [departments, setDepartments] = useState<OrganizationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search in dashboard tables
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Process | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Check permissions
  const canCreateProcess = can(Permissions.CREATE_PROCESSES) || isSuperAdmin;
  const canCreateDept = can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  // Load live data from database APIs
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [procRes, deptRes] = await Promise.all([
        fetch('/api/processes').then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
      ]);

      if (Array.isArray(procRes)) setProcesses(procRes);
      if (Array.isArray(deptRes)) setDepartments(deptRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers for process operations
  const handleOpenCreateProcess = () => {
    setProcessToEdit(null);
    setIsProcessModalOpen(true);
  };

  const handleEditProcess = (proc: Process) => {
    setProcessToEdit(proc);
    setIsProcessModalOpen(true);
  };

  const handleSaveProcess = async (savedProcess: Process) => {
    setProcesses((prev) => {
      const idx = prev.findIndex((p) => p.id === savedProcess.id || p.slug === savedProcess.slug);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedProcess;
        return next;
      }
      return [savedProcess, ...prev];
    });

    try {
      const res = await fetch('/api/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(savedProcess),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطای سرور (${res.status})`);
      }

      const confirmedProcess = await res.json();
      setProcesses((prev) =>
        prev.map((p) =>
          p.id === savedProcess.id || p.slug === savedProcess.slug ? confirmedProcess : p
        )
      );

      // Refresh to ensure relational bindings are updated
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error saving process:', err);
      await fetchDashboardData();
      alert(`خطا در ثبت فرایند: ${err.message || 'خطای سرور'}`);
    }
  };

  const handleDeptCreated = (newDept: OrganizationEntity) => {
    setDepartments((prev) => [newDept, ...prev.filter((d) => d.slug !== newDept.slug)]);
  };

  // Filtered lists
  const filteredProcesses = useMemo(() => {
    if (!searchQuery.trim()) return processes;
    const q = searchQuery.toLowerCase();
    return processes.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.targetSystem.toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [processes, searchQuery]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  const totalSteps = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.steps?.length || p.totalSteps || 0), 0);
  }, [processes]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600">داشبورد مدیریت و راهبری</span>
        </nav>

        {/* Dashboard Header Banner */}
        <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl mb-8 relative overflow-hidden"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>پنل راهبری متمرکز سیستم</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                داشبورد مدیریت فرایندها و ساختار سازمانی
              </h1>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                مدیریت کامل و افزودن فرایندها، ثبت سازمان‌ها و ارگان‌های متولی، بررسی دسترسی‌ها و اتصال به پایگاه داده سرور مرکزی.
              </p>
            </div>

            {/* User Session Status & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {canCreateProcess && (
                <button
                  type="button"
                  onClick={handleOpenCreateProcess}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت فرایند جدید</span>
                </button>
              )}

              {canCreateDept && (
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  style={{
                    borderColor: 'var(--accent-border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>ثبت سازمان جدید</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>فرایندهای فعال</span>
              <Workflow className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{processes.length}</div>
            <p className="text-[11px] mt-1 text-slate-500">ذخیره در دیتابیس PostgreSQL</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>سازمان‌ها و مراجع</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{departments.length}</div>
            <p className="text-[11px] mt-1 text-slate-500">نهادهای متصل به سیستم</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>سامانه‌ها و درگاه‌ها</span>
              <Laptop className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600">۱</div>
            <p className="text-[11px] mt-1 text-slate-500">پرتال‌های فعال (LTMS)</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>گام‌های اجرایی تدوین‌شده</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">{totalSteps}</div>
            <p className="text-[11px] mt-1 text-slate-500">همراه با مسیر منو و راهنما</p>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab('processes'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'processes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>فرایندها ({processes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('organizations'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'organizations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>سازمان‌ها ({departments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('permissions'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'permissions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نقش‌ها و دسترسی‌ها</span>
            </button>
          </div>

          {/* Search in active tab */}
          {activeTab !== 'permissions' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در رکوردها..."
                className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}
        </div>

        {/* Tab 1: Processes Management */}
        {activeTab === 'processes' && (
          <div className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  لیست فرایندهای ثبت‌شده در پایگاه داده
                </h3>
                <p className="text-xs text-slate-500">
                  فرایندهای عملیاتی همراه با مراحل، ارورها و فیلدهای کپی‌برداری
                </p>
              </div>

              {canCreateProcess && (
                <button
                  type="button"
                  onClick={handleOpenCreateProcess}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت فرایند</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
                <p className="text-xs text-slate-500">در حال دریافت فرایندها از دیتابیس...</p>
              </div>
            ) : filteredProcesses.length === 0 ? (
              <div className="p-16 text-center">
                <Workflow className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
                <h4 className="text-sm font-bold">فرایندی یافت نشد</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {searchQuery ? 'با این عبارت جستجو موردی یافت نشد.' : 'هنوز فرایندی ثبت نشده است.'}
                </p>
                {canCreateProcess && (
                  <button
                    type="button"
                    onClick={handleOpenCreateProcess}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت اولین فرایند</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                      <th className="p-4">عنوان فرایند</th>
                      <th className="p-4">سامانه هدف</th>
                      <th className="p-4">سازمان متولی</th>
                      <th className="p-4 text-center">گام‌ها</th>
                      <th className="p-4">شناسه لاتین (Slug)</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {filteredProcesses.map((proc) => (
                      <tr 
                        key={proc.id} 
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {proc.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-sm">
                            {proc.description}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-purple-600 dark:text-purple-400">
                          {proc.targetSystem}
                        </td>
                        <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {proc.departmentName}
                        </td>
                        <td className="p-4 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {proc.steps?.length || proc.totalSteps} گام
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500" dir="ltr">
                          {proc.slug}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/process/${proc.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="مشاهده در سایت"
                              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {can(Permissions.EDIT_PROCESSES) && (
                              <button
                                type="button"
                                onClick={() => handleEditProcess(proc)}
                                className="p-1.5 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-blue-600 cursor-pointer"
                                title="ویرایش فرایند"
                                style={{ borderColor: 'var(--border-subtle)' }}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Organizations Management */}
        {activeTab === 'organizations' && (
          <div className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  لیست سازمان‌ها و ادارات ثبت‌شده
                </h3>
                <p className="text-xs text-slate-500">
                  دپارتمان‌ها و وزارتخانه‌های متصل به موتور فرایندهای سازمانی
                </p>
              </div>

              {canCreateDept && (
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت سازمان</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-3" />
                <p className="text-xs text-slate-500">در حال دریافت سازمان‌ها از دیتابیس...</p>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="p-16 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
                <h4 className="text-sm font-bold">سازمانی یافت نشد</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  می‌توانید ارگان جدید را در دیتابیس ثبت کنید.
                </p>
                {canCreateDept && (
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت اولین سازمان</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                      <th className="p-4">نام سازمان / وزارتخانه</th>
                      <th className="p-4">شناسه یکتا (Slug)</th>
                      <th className="p-4 text-center">فرایندهای مرتبط</th>
                      <th className="p-4 text-center">مشاهده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {filteredDepartments.map((dept) => (
                      <tr 
                        key={dept.slug}
                        className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                            >
                              <Building2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {dept.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500" dir="ltr">
                          {dept.slug}
                        </td>
                        <td className="p-4 text-center font-bold">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {dept.processCount} فرایند
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/?dept=${dept.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <span>مشاهده در کاتالوگ</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Permissions & Roles Breakdown */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-lg"
              style={{ borderColor: 'var(--border-glass)' }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                    style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}
                  >
                    <KeyRound className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                      سیستم بیت‌فیلد سطوح دسترسی (Discord Bitfield)
                    </h3>
                    <p className="text-xs text-slate-500">
                      کاربر جاری: <span className="font-bold text-blue-600">{currentUser.name}</span> | مقدار بیت‌فیلد: <span className="font-mono font-bold">{currentUser.permissions}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1.5 rounded-xl font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {currentUser.roleName}
                </span>
              </div>

              {/* Bitfield Permissions Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { bit: Permissions.VIEW_PROCESSES, label: 'مشاهده فرایندها (VIEW)', code: '1 << 0' },
                  { bit: Permissions.CREATE_PROCESSES, label: 'ثبت فرایند جدید (CREATE)', code: '1 << 1' },
                  { bit: Permissions.EDIT_PROCESSES, label: 'ویرایش فرایندها (EDIT)', code: '1 << 2' },
                  { bit: Permissions.DELETE_PROCESSES, label: 'حذف فرایندها (DELETE)', code: '1 << 3' },
                  { bit: Permissions.MANAGE_STEPS, label: 'مدیریت مراحل و گام‌ها (STEPS)', code: '1 << 4' },
                  { bit: Permissions.MANAGE_CATEGORIES, label: 'مدیریت سازمان‌ها (DEPARTMENTS)', code: '1 << 6' },
                  { bit: Permissions.MANAGE_SYSTEMS, label: 'مدیریت سامانه‌ها (SYSTEMS)', code: '1 << 7' },
                  { bit: Permissions.ADMINISTRATOR, label: 'دسترسی کامل مدیر ارشد (ADMIN)', code: '1 << 30' },
                ].map((item) => {
                  const hasPerm = hasPermission(currentUser.permissions, item.bit);
                  return (
                    <div 
                      key={item.bit}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        hasPerm 
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400' 
                          : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-slate-900/30'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="font-mono text-[10px] text-slate-400" dir="ltr">{item.code}</div>
                      </div>
                      {hasPerm ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Switch Active Role for Testing */}
              <div className="pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-bold block mb-3" style={{ color: 'var(--text-secondary)' }}>
                  تغییر سریع نقش جهت بررسی رفتار سامانه (User Switching):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => switchUser('usr-admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentUser.id === 'usr-admin'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    مدیر ارشد (Super Admin)
                  </button>

                  <button
                    type="button"
                    onClick={() => switchUser('usr-editor')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentUser.id === 'usr-editor'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    کارشناس تدوین (Editor)
                  </button>

                  <button
                    type="button"
                    onClick={() => switchUser('usr-viewer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentUser.id === 'usr-viewer'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    کاربر عادی (Viewer)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Process Creator / Editor Modal (Opened Only From Dashboard) */}
      <ProcessEditorModal
        isOpen={isProcessModalOpen}
        processToEdit={processToEdit}
        onClose={() => setIsProcessModalOpen(false)}
        onSave={handleSaveProcess}
      />

      {/* Organization Registration Modal (Opened Only From Dashboard) */}
      <DepartmentEditorModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSuccess={handleDeptCreated}
      />

      <Footer />
    </div>
  );
}
