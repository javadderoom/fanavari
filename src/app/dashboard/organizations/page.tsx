'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { DepartmentEditorModal } from '@/components/department-editor-modal';
import { OrganizationEntity } from '@/types/process';
import { notify } from '@/lib/notify';
import { 
  Building2, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  Workflow
} from 'lucide-react';

export default function DashboardOrganizationsPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();

  const [departments, setDepartments] = useState<OrganizationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<OrganizationEntity | null>(null);

  const canManage = can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      notify.error('خطا در بارگذاری لیست سازمان‌ها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  const handleOpenCreate = () => {
    setDeptToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: OrganizationEntity) => {
    setDeptToEdit(dept);
    setIsModalOpen(true);
  };

  const handleDelete = async (dept: OrganizationEntity) => {
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
    } catch (err: any) {
      console.error('Error deleting department:', err);
      notify.error(err.message || 'خطا در حذف سازمان.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت سازمان‌ها، وزارتخانه‌ها و ادارات متولی
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دپارتمان‌ها و نهادهای صاحب فرایند، ساختار سازمانی و مشخصات تماس
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سازمان جدید</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div 
        className="p-4 rounded-2xl border flex items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام سازمان یا شناسه..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            style={{
              background: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
          تعداد کل: {departments.length} سازمان
        </span>
      </div>

      {/* Main Table Card */}
      <div 
        className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              لیست نهادها و سازمان‌های ثبت‌شده ({filteredDepartments.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-3" />
            <p className="text-xs text-slate-500">در حال دریافت سازمان‌ها از پایگاه داده...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <h4 className="text-sm font-bold">سازمانی یافت نشد</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchQuery ? 'با این عبارت جستجو موردی یافت نشد.' : 'می‌توانید اولین نهاد یا سازمان را در دیتابیس ثبت کنید.'}
            </p>
            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
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
                <tr 
                  className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold"
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
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
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
                      {canManage ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(dept)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                            title="ویرایش سازمان"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(dept)}
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

      {/* Department Editor Modal */}
      <DepartmentEditorModal
        isOpen={isModalOpen}
        departmentToEdit={deptToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setDeptToEdit(null);
        }}
        onSuccess={() => {
          fetchDepartments();
          notify.success('سازمان با موفقیت ذخیره شد.');
        }}
      />
    </div>
  );
}
