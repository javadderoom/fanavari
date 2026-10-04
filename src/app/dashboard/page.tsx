'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';
import { ProcessEditorModal } from '@/components/process-editor-modal';
import { DepartmentEditorModal } from '@/components/department-editor-modal';
import { SystemEditorModal } from '@/components/system-editor-modal';
import { InformationEditorModal } from '@/components/information-editor-modal';
import { ScopesCategoriesManagement } from '@/components/scopes-categories-management';
import { Process, OrganizationEntity, SystemTool, InformationPost } from '@/types/process';
import { notify } from '@/lib/notify';
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
  KeyRound,
  Trash2,
  Globe,
  Server,
  GitBranch,
  Table,
  Calculator,
  Shield,
  Key,
  Container,
  GraduationCap,
  Megaphone,
  FileText,
  BookOpen,
  Pin,
  HelpCircle,
  Calendar,
  FileEdit,
  FolderTree
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, can, isSuperAdmin, switchUser } = useUserSession();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'processes' | 'organizations' | 'systems' | 'information' | 'scopes_categories' | 'permissions'>('processes');

  // Live database data states
  const [processes, setProcesses] = useState<Process[]>([]);
  const [departments, setDepartments] = useState<OrganizationEntity[]>([]);
  const [systems, setSystems] = useState<SystemTool[]>([]);
  const [informationPosts, setInformationPosts] = useState<InformationPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search in dashboard tables
  const [searchQuery, setSearchQuery] = useState('');
  const [infoTypeFilter, setInfoTypeFilter] = useState<string>('all');
  const [infoStatusFilter, setInfoStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modals state
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Process | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<OrganizationEntity | null>(null);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemToEdit, setSystemToEdit] = useState<SystemTool | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<InformationPost | null>(null);

  // Check permissions
  const canCreateProcess = can(Permissions.CREATE_PROCESSES) || isSuperAdmin;
  const canCreateDept = can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;
  const canManageSystems = can(Permissions.MANAGE_SYSTEMS) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;
  const canManageInformation = can(Permissions.MANAGE_INFORMATION) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  // Load live data from database APIs
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [procRes, deptRes, sysRes, infoRes] = await Promise.all([
        fetch('/api/processes').then((r) => r.json()),
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

  // Handlers for department operations
  const handleOpenCreateDept = () => {
    setDeptToEdit(null);
    setIsDeptModalOpen(true);
  };

  const handleEditDept = (dept: OrganizationEntity) => {
    setDeptToEdit(dept);
    setIsDeptModalOpen(true);
  };

  const handleDeptSaved = (savedDept: OrganizationEntity) => {
    setDepartments((prev) => {
      const idx = prev.findIndex((d) => d.id === savedDept.id || d.slug === savedDept.slug);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedDept;
        return next;
      }
      return [savedDept, ...prev];
    });
    notify.success(`سازمان «${savedDept.name}» با موفقیت ذخیره گردید.`);
    fetchDashboardData();
  };

  const handleDeleteDept = async (dept: OrganizationEntity) => {
    const confirmed = await notify.confirm({
      title: 'حذف سازمان از پایگاه داده',
      message: `آیا از حذف سازمان «${dept.name}» اطمینان کامل دارید؟ ${
        dept.processCount > 0
          ? `این سازمان در حال حاضر به ${dept.processCount} فرایند متصل است. در صورت حذف، فرایندها بدون سازمان متولی باقی خواهند ماند.`
          : ''
      }`,
      confirmText: 'بله، حذف شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/departments?id=${dept.id || ''}&slug=${dept.slug}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در حذف سازمان');
      }

      setDepartments((prev) => prev.filter((d) => d.slug !== dept.slug && d.id !== dept.id));
      notify.success(`سازمان «${dept.name}» با موفقیت از پایگاه داده حذف گردید.`);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting department:', err);
      notify.error(err.message || 'خطا در حذف سازمان.');
    }
  };

  // Handlers for system / software operations
  const handleOpenCreateSystem = () => {
    setSystemToEdit(null);
    setIsSystemModalOpen(true);
  };

  const handleEditSystem = (tool: SystemTool) => {
    setSystemToEdit(tool);
    setIsSystemModalOpen(true);
  };

  const handleSystemSaved = (savedTool: SystemTool) => {
    setSystems((prev) => {
      const idx = prev.findIndex((s) => s.id === savedTool.id || s.slug === savedTool.slug);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedTool;
        return next;
      }
      return [savedTool, ...prev];
    });
    notify.success(`سامانه «${savedTool.name}» با موفقیت ذخیره گردید.`);
    fetchDashboardData();
  };

  const handleDeleteSystem = async (tool: SystemTool) => {
    const confirmed = await notify.confirm({
      title: 'حذف نرم‌افزار / سامانه از پایگاه داده',
      message: `آیا از حذف سامانه «${tool.name}» اطمینان کامل دارید؟ ${
        tool.processCount > 0
          ? `این سامانه در حال حاضر به ${tool.processCount} فرایند متصل است. در صورت حذف، فرایندها بدون اتصال سامانه باقی خواهند ماند.`
          : ''
      }`,
      confirmText: 'بله، حذف شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/systems?id=${tool.id || ''}&slug=${tool.slug}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در حذف سامانه');
      }

      setSystems((prev) => prev.filter((s) => s.slug !== tool.slug && s.id !== tool.id));
      notify.success(`سامانه «${tool.name}» با موفقیت از پایگاه داده حذف گردید.`);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting system:', err);
      notify.error(err.message || 'خطا در حذف سامانه.');
    }
  };

  // Handlers for information operations
  const handleOpenCreateInfo = () => {
    setPostToEdit(null);
    setIsInfoModalOpen(true);
  };

  const handleEditInfo = (post: InformationPost) => {
    setPostToEdit(post);
    setIsInfoModalOpen(true);
  };

  const handleInfoSaved = (savedPost: InformationPost, isAutoSave?: boolean) => {
    setInformationPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPost.id || p.slug === savedPost.slug);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedPost;
        return next;
      }
      return [savedPost, ...prev];
    });
    if (!isAutoSave) {
      notify.success(
        savedPost.isPublished === false
          ? `پیش‌نویس «${savedPost.title}» با موفقیت ذخیره گردید.`
          : `مطلب «${savedPost.title}» با موفقیت ذخیره و منتشر گردید.`
      );
      fetchDashboardData();
    }
  };

  const handleDeleteInfo = async (post: InformationPost) => {
    const confirmed = await notify.confirm({
      title: 'حذف مطلب / اطلاعیه از سامانه',
      message: `آیا از حذف «${post.title}» اطمینان کامل دارید؟ این عمل غیرقابل بازگشت است.`,
      confirmText: 'بله، حذف شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/information?id=${post.id || ''}&slug=${post.slug}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در حذف مطلب');
      }

      setInformationPosts((prev) => prev.filter((p) => p.slug !== post.slug && p.id !== post.id));
      notify.success(`مطلب «${post.title}» با موفقیت حذف گردید.`);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Error deleting information post:', err);
      notify.error(err.message || 'خطا در حذف مطلب.');
    }
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

  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return systems;
    const q = searchQuery.toLowerCase();
    return systems.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [systems, searchQuery]);

  const filteredInformation = useMemo(() => {
    return informationPosts.filter((item) => {
      if (infoStatusFilter === 'published' && item.isPublished === false) {
        return false;
      }
      if (infoStatusFilter === 'draft' && item.isPublished !== false) {
        return false;
      }
      if (infoTypeFilter !== 'all' && item.type !== infoTypeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(q)) ||
        (item.systemToolName && item.systemToolName.toLowerCase().includes(q)) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [informationPosts, searchQuery, infoTypeFilter, infoStatusFilter]);

  const totalSteps = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.steps?.length || p.totalSteps || 0), 0);
  }, [processes]);

  const renderSystemIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4 text-cyan-600" />;
      case 'Server': return <Server className="w-4 h-4 text-indigo-600" />;
      case 'Layers': return <Layers className="w-4 h-4 text-purple-600" />;
      case 'GitBranch': return <GitBranch className="w-4 h-4 text-orange-500" />;
      case 'Table': return <Table className="w-4 h-4 text-emerald-600" />;
      case 'Calculator': return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'Shield': return <Shield className="w-4 h-4 text-sky-600" />;
      case 'Key': return <Key className="w-4 h-4 text-rose-600" />;
      case 'Container': return <Container className="w-4 h-4 text-cyan-500" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-amber-600" />;
      default: return <Laptop className="w-4 h-4 text-purple-600" />;
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'software':
        return { label: 'نرم‌افزار کاربردی', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'devtools':
        return { label: 'ابزار مهندسی', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' };
      case 'erp':
        return { label: 'سازمانی / ERP', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default:
        return { label: 'سامانه و پرتال وب', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    }
  };

  const getInfoTypeBadge = (t?: string) => {
    switch (t) {
      case 'circular':
        return { label: 'بخشنامه و ابلاغیه', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: FileText };
      case 'guide':
        return { label: 'راهنما و معرفی', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', icon: BookOpen };
      case 'article':
        return { label: 'پایگاه دانش / مقاله', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: HelpCircle };
      default:
        return { label: 'اطلاعیه رسمی', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', icon: Megaphone };
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'urgent':
        return { label: 'فوری / قرمز', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800' };
      case 'high':
        return { label: 'مهم', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default:
        return { label: 'عادی', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

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

              {canManageSystems && (
                <button
                  type="button"
                  onClick={handleOpenCreateSystem}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  style={{
                    borderColor: 'rgba(168, 85, 247, 0.4)',
                    background: 'var(--bg-surface)',
                    color: 'rgb(168, 85, 247)',
                  }}
                >
                  <Laptop className="w-4 h-4 text-purple-600" />
                  <span>ثبت سامانه جدید</span>
                </button>
              )}

              {canManageInformation && (
                <button
                  type="button"
                  onClick={handleOpenCreateInfo}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  style={{
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    background: 'var(--bg-surface)',
                    color: 'rgb(99, 102, 241)',
                  }}
                >
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  <span>ثبت اطلاعیه جدید</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>نرم‌افزارها و سامانه‌ها</span>
              <Laptop className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600">{systems.length}</div>
            <p className="text-[11px] mt-1 text-slate-500">پرتال‌ها و ابزارهای فعال</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border shadow-xs" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>اطلاعات و اطلاعیه‌ها</span>
              <Megaphone className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">{informationPosts.length}</div>
            <p className="text-[11px] mt-1 text-slate-500">بخشنامه‌ها، راهنماها و مقالات</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border shadow-xs col-span-2 md:col-span-1" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>گام‌های اجرایی</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-600">{totalSteps}</div>
            <p className="text-[11px] mt-1 text-slate-500">همراه با مسیر منو و راهنما</p>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border"
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
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>سازمان‌ها ({departments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('systems'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'systems'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>نرم‌افزارها و ابزارها ({systems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('information'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'information'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>اطلاعات و اطلاعیه‌ها ({informationPosts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('scopes_categories'); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scopes_categories'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>حوزه‌ها و دسته‌بندی‌ها</span>
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
          {activeTab !== 'permissions' && activeTab !== 'scopes_categories' && (
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
                  onClick={handleOpenCreateDept}
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
                    onClick={handleOpenCreateDept}
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
                      <th className="p-4 text-center">عملیات</th>
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
                            <span>مشاهده</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="p-4 text-center">
                          {canCreateDept ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditDept(dept)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                title="ویرایش سازمان"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDept(dept)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="حذف سازمان"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 select-none">فقط خواندنی</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Systems & Tools Management */}
        {activeTab === 'systems' && (
          <div className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  بانک نرم‌افزارها، ابزارها و سامانه‌های سازمانی
                </h3>
                <p className="text-xs text-slate-500">
                  مدیریت نرم‌افزارهای کاربردی، پرتال‌های وب و ابزارهای مهندسی متصل به فرایندهای رسمی
                </p>
              </div>

              {canManageSystems && (
                <button
                  type="button"
                  onClick={handleOpenCreateSystem}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت سامانه / ابزار</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600 mb-3" />
                <p className="text-xs text-slate-500">در حال دریافت سامانه‌ها از دیتابیس...</p>
              </div>
            ) : filteredSystems.length === 0 ? (
              <div className="p-16 text-center">
                <Laptop className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-500" />
                <h4 className="text-sm font-bold">سامانه‌ای یافت نشد</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {searchQuery ? 'با این عبارت جستجو موردی یافت نشد.' : 'می‌توانید اولین نرم‌افزار یا پرتال را در پایگاه داده ثبت کنید.'}
                </p>
                {canManageSystems && (
                  <button
                    type="button"
                    onClick={handleOpenCreateSystem}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت اولین سامانه</span>
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
                      <th className="p-4">نام سامانه / نرم‌افزار</th>
                      <th className="p-4">نوع</th>
                      <th className="p-4">شناسه یکتا (Slug)</th>
                      <th className="p-4">پرتال رسمی</th>
                      <th className="p-4 text-center">فرایندهای مرتبط</th>
                      <th className="p-4 text-center">مشاهده</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {filteredSystems.map((sys) => {
                      const badge = getCategoryBadge(sys.category);
                      return (
                        <tr 
                          key={sys.slug}
                          className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                              >
                                {renderSystemIcon(sys.icon)}
                              </div>
                              <div>
                                <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                                  {sys.name}
                                </span>
                                {sys.description && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                    {sys.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-500" dir="ltr">
                            {sys.slug}
                          </td>
                          <td className="p-4">
                            {sys.websiteUrl ? (
                              <a
                                href={sys.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline"
                                dir="ltr"
                              >
                                <span className="truncate max-w-[160px]">{sys.websiteUrl.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              {sys.processCount} فرایند
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Link
                              href={`/system/${sys.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                            >
                              <span>مشاهده</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                          <td className="p-4 text-center">
                            {canManageSystems ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditSystem(sys)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                  title="ویرایش سامانه"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSystem(sys)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                  title="حذف سامانه"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 select-none">فقط خواندنی</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Information & Announcements Management */}
        {activeTab === 'information' && (
          <div className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h3 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                  <span>مرکز اطلاعات، اطلاعیه‌ها، بخشنامه‌ها و راهنماها</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  انتشار و ویرایش اطلاعیه‌های مهم، بخشنامه‌های سازمانی، معرفی سامانه‌ها و مقالات پایگاه دانش
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {canManageInformation && (
                  <button
                    type="button"
                    onClick={handleOpenCreateInfo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت اطلاعیه / بخشنامه جدید</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status & Sub-Type Filter Pills */}
            <div className="px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
            >
              {/* Status Filter: All / Published / Drafts */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInfoStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    infoStatusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  همه ({informationPosts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInfoStatusFilter('published')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    infoStatusFilter === 'published'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>منتشر شده ({informationPosts.filter((p) => p.isPublished !== false).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInfoStatusFilter('draft')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    infoStatusFilter === 'draft'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>پیش‌نویس‌ها ({informationPosts.filter((p) => p.isPublished === false).length})</span>
                </button>
              </div>

              {/* Topic Filters */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">موضوع:</span>
                {[
                  { key: 'all', label: 'همه' },
                  { key: 'announcement', label: 'اطلاعیه‌ها' },
                  { key: 'circular', label: 'بخشنامه‌ها' },
                  { key: 'guide', label: 'راهنماها' },
                  { key: 'article', label: 'پایگاه دانش' },
                ].map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setInfoTypeFilter(pill.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      infoTypeFilter === pill.key
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-600 mb-3" />
                <p className="text-xs text-slate-500">در حال دریافت مطالب اطلاعاتی از دیتابیس...</p>
              </div>
            ) : filteredInformation.length === 0 ? (
              <div className="p-16 text-center">
                <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-500" />
                <h4 className="text-sm font-bold">مطلبی در این دسته‌بندی یافت نشد</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {searchQuery ? 'با این عبارت جستجو هیچ اطلاعیه یا بخشنامه‌ای پیدا نشد.' : 'می‌توانید اولین اطلاعیه یا بخشنامه سازمانی را منتشر نمایید.'}
                </p>
                {canManageInformation && (
                  <button
                    type="button"
                    onClick={handleOpenCreateInfo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت اولین مطلب اطلاعاتی</span>
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
                      <th className="p-4">عنوان و خلاصه</th>
                      <th className="p-4 text-center">وضعیت</th>
                      <th className="p-4">نوع محتوا</th>
                      <th className="p-4">اولویت</th>
                      <th className="p-4">ارتباط سازمانی / سامانه</th>
                      <th className="p-4">تاریخ انتشار</th>
                      <th className="p-4 text-center">مشاهده</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {filteredInformation.map((post) => {
                      const typeBadge = getInfoTypeBadge(post.type);
                      const priorityBadge = getPriorityBadge(post.priority);
                      const IconComponent = typeBadge.icon;

                      return (
                        <tr 
                          key={post.id || post.slug}
                          className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors"
                        >
                          <td className="p-4 max-w-sm">
                            <div className="flex items-start gap-2.5">
                              {post.isPinned && (
                                <span title="مطلب سنجاق شده">
                                  <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                                </span>
                              )}
                              <div>
                                <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                                  {post.title}
                                </span>
                                {post.summary && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                    {post.summary}
                                  </span>
                                )}
                                <span className="font-mono text-[10px] text-slate-500 block mt-0.5" dir="ltr">
                                  {post.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            {post.isPublished === false ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <FileEdit className="w-3 h-3" />
                                <span>پیش‌نویس</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>منتشر شده</span>
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${typeBadge.bg}`}>
                              <IconComponent className="w-3 h-3" />
                              <span>{typeBadge.label}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityBadge.bg}`}>
                              {priorityBadge.label}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              {post.departmentName && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  <Building2 className="w-3 h-3 shrink-0" />
                                  <span>{post.departmentName}</span>
                                </span>
                              )}
                              {post.systemToolName && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                                  <Laptop className="w-3 h-3 shrink-0" />
                                  <span>{post.systemToolName}</span>
                                </span>
                              )}
                              {!post.departmentName && !post.systemToolName && (
                                <span className="text-slate-400 text-[11px]">عمومی / سازمانی</span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-slate-500 font-mono text-[11px]" dir="ltr">
                            {post.publishedAt
                              ? '\u200E' + new Date(post.publishedAt).toLocaleDateString('fa-IR')
                              : '-'}
                          </td>

                          <td className="p-4 text-center">
                            <Link
                              href={`/information/${post.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                            >
                              <span>مشاهده</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>

                          <td className="p-4 text-center">
                            {canManageInformation ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditInfo(post)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                  title="ویرایش مطلب"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInfo(post)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                  title="حذف مطلب"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 select-none">فقط خواندنی</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Permissions & Roles Breakdown */}
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
                  { bit: Permissions.MANAGE_INFORMATION, label: 'مدیریت اطلاعات و اطلاعیه‌ها (INFORMATION)', code: '1 << 10' },
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

        {/* Tab 6: Scopes & Categories Management */}
        {activeTab === 'scopes_categories' && (
          <ScopesCategoriesManagement />
        )}
      </main>

      {/* Process Creator / Editor Modal (Opened Only From Dashboard) */}
      <ProcessEditorModal
        isOpen={isProcessModalOpen}
        processToEdit={processToEdit}
        onClose={() => setIsProcessModalOpen(false)}
        onSave={handleSaveProcess}
      />

      {/* Organization Registration / Edit Modal */}
      <DepartmentEditorModal
        isOpen={isDeptModalOpen}
        departmentToEdit={deptToEdit}
        onClose={() => {
          setIsDeptModalOpen(false);
          setDeptToEdit(null);
        }}
        onSuccess={handleDeptSaved}
      />

      {/* System / Software Tool Registration / Edit Modal */}
      <SystemEditorModal
        isOpen={isSystemModalOpen}
        systemToEdit={systemToEdit}
        onClose={() => {
          setIsSystemModalOpen(false);
          setSystemToEdit(null);
        }}
        onSuccess={handleSystemSaved}
      />

      {/* Information / Announcement Registration / Edit Modal */}
      <InformationEditorModal
        isOpen={isInfoModalOpen}
        postToEdit={postToEdit}
        departments={departments}
        systems={systems}
        onClose={() => {
          setIsInfoModalOpen(false);
          setPostToEdit(null);
        }}
        onSuccess={handleInfoSaved}
      />

      <Footer />
    </div>
  );
}
