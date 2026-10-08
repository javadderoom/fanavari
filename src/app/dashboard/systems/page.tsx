'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { SystemEditorModal } from '@/components/system-editor-modal';
import { DeleteImpactDialog } from '@/components/delete-impact-dialog';
import { SystemTool } from '@/types/process';
import { notify } from '@/lib/notify';
import { 
  Laptop, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  Globe, 
  Server, 
  Layers, 
  GitBranch, 
  Table, 
  Calculator, 
  Shield, 
  Key, 
  Container, 
  GraduationCap, 
  Building2 
} from 'lucide-react';

export default function DashboardSystemsPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();

  const [systems, setSystems] = useState<SystemTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemToEdit, setSystemToEdit] = useState<SystemTool | null>(null);

  // Delete-impact preview state
  const [impactTool, setImpactTool] = useState<SystemTool | null>(null);
  const [impactCounts, setImpactCounts] = useState<{
    processes: number;
    informationPosts: number;
  } | null>(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = can(Permissions.MANAGE_SYSTEMS) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  const fetchSystems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/systems');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSystems(data);
      }
    } catch (err) {
      console.error('Failed to load systems:', err);
      notify.error('خطا در دریافت لیست سامانه‌ها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [systems, searchQuery, categoryFilter]);

  const handleOpenCreate = () => {
    setSystemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sys: SystemTool) => {
    setSystemToEdit(sys);
    setIsModalOpen(true);
  };

  const handleDelete = async (tool: SystemTool) => {
    // Step 1: open the impact preview and load live relation counts.
    setImpactTool(tool);
    setImpactCounts(null);
    setIsImpactLoading(true);
    try {
      const res = await fetch(
        `/api/systems/impact?id=${tool.id || ''}&slug=${tool.slug}`,
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
      notify.error(err.message || 'خطا در بررسی وابستگی‌های سامانه.');
      setImpactTool(null);
    } finally {
      setIsImpactLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!impactTool) return;
    const tool = impactTool;
    setIsDeleting(true);
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
      setImpactTool(null);
      setImpactCounts(null);
      notify.success(`سامانه «${tool.name}» با موفقیت از پایگاه داده حذف گردید.`);
    } catch (err: any) {
      console.error('Error deleting system:', err);
      notify.error(err.message || 'خطا در حذف سامانه.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت سامانه‌ها، نرم‌افزارها و ابزارها
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            بانک جامع پرتال‌های وب، نرم‌افزارهای دسکتاپ و ابزارهای متصل به فرایندهای رسمی
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer hover:scale-105 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سامانه جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام سامانه، توضیحات یا اسلاگ..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'همه دسته‌ها' },
            { key: 'portal', label: 'پرتال و وب' },
            { key: 'software', label: 'نرم‌افزار' },
            { key: 'erp', label: 'سازمانی / ERP' },
            { key: 'devtools', label: 'ابزار مهندسی' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.key
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div 
        className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              لیست نرم‌افزارها و سامانه‌ها ({filteredSystems.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600 mb-3" />
            <p className="text-xs text-slate-500">در حال بارگذاری سامانه‌ها از دیتابیس...</p>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="p-16 text-center">
            <Laptop className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-500" />
            <h4 className="text-sm font-bold">سامانه‌ای یافت نشد</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchQuery ? 'با این عبارت جستجو موردی یافت نشد.' : 'می‌توانید اولین نرم‌افزار یا پرتال را در پایگاه داده ثبت کنید.'}
            </p>
            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
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
                <tr 
                  className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <th className="p-4">نام سامانه / نرم‌افزار</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">شناسه یکتا (Slug)</th>
                  <th className="p-4">آدرس پرتال رسمی</th>
                  <th className="p-4 text-center">فرایندهای متصل</th>
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
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                          >
                            {renderSystemIcon(sys.icon)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                              {sys.name}
                            </span>
                            {sys.description && (
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
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
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
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
                        {canManage ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(sys)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                              title="ویرایش سامانه"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sys)}
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

      {/* System Editor Modal */}
      <SystemEditorModal
        isOpen={isModalOpen}
        systemToEdit={systemToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setSystemToEdit(null);
        }}
        onSuccess={() => {
          fetchSystems();
          notify.success('سامانه با موفقیت ذخیره شد.');
        }}
      />

      {/* Delete impact preview: nothing is destroyed, links are unlinked */}
      {impactTool && (
        <DeleteImpactDialog
          isOpen={Boolean(impactTool)}
          entityKindLabel="سامانه"
          entityName={impactTool.name}
          survivors={[
            {
              label: 'فرایندهای متصل',
              count: impactCounts?.processes ?? 0,
              hint: 'حفظ می‌شوند ولی اتصال سامانه‌شان قطع می‌شود',
            },
            {
              label: 'اطلاعیه‌ها و بخشنامه‌های متصل',
              count: impactCounts?.informationPosts ?? 0,
              hint: 'حفظ می‌شوند ولی ارتباط سامانه‌ای‌شان قطع می‌شود',
            },
          ]}
          destroyed={[]}
          isLoading={isImpactLoading}
          isConfirming={isDeleting}
          onCancel={() => {
            if (isDeleting) return;
            setImpactTool(null);
            setImpactCounts(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
