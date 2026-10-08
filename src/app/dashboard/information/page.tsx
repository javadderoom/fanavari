'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { InformationEditorModal } from '@/components/information-editor-modal';
import { DeleteImpactDialog } from '@/components/delete-impact-dialog';
import { InformationPost, OrganizationEntity, SystemTool } from '@/types/process';
import { notify } from '@/lib/notify';
import { 
  Megaphone, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  FileEdit, 
  Pin, 
  Building2, 
  Laptop 
} from 'lucide-react';

export default function DashboardInformationPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();

  const [posts, setPosts] = useState<InformationPost[]>([]);
  const [departments, setDepartments] = useState<OrganizationEntity[]>([]);
  const [systems, setSystems] = useState<SystemTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<InformationPost | null>(null);

  // Delete-impact preview state
  const [impactPost, setImpactPost] = useState<InformationPost | null>(null);
  const [impactCounts, setImpactCounts] = useState<{
    accessGrants: number;
  } | null>(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = can(Permissions.MANAGE_INFORMATION) || can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [infoRes, deptRes, sysRes] = await Promise.all([
        // status=all: privileged callers (managers) also receive drafts for the tabs.
        fetch('/api/information?status=all').then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
        fetch('/api/systems').then((r) => r.json()),
      ]);

      if (Array.isArray(infoRes)) setPosts(infoRes);
      if (Array.isArray(deptRes)) setDepartments(deptRes);
      if (Array.isArray(sysRes)) setSystems(sysRes);
    } catch (err) {
      console.error('Failed to load information data:', err);
      notify.error('خطا در دریافت اطلاعات و بخشنامه‌ها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((item) => {
      if (statusFilter === 'published' && item.isPublished === false) {
        return false;
      }
      if (statusFilter === 'draft' && item.isPublished !== false) {
        return false;
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) {
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
  }, [posts, searchQuery, typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: InformationPost) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (post: InformationPost) => {
    // Step 1: open the impact preview and load live relation counts.
    setImpactPost(post);
    setImpactCounts(null);
    setIsImpactLoading(true);
    try {
      const res = await fetch(
        `/api/information/impact?id=${post.id || ''}&slug=${post.slug}`,
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
      notify.error(err.message || 'خطا در بررسی وابستگی‌های مطلب.');
      setImpactPost(null);
    } finally {
      setIsImpactLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!impactPost) return;
    const post = impactPost;
    setIsDeleting(true);
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

      setPosts((prev) => prev.filter((p) => p.slug !== post.slug && p.id !== post.id));
      setImpactPost(null);
      setImpactCounts(null);
      notify.success(`مطلب «${post.title}» با موفقیت حذف گردید.`);
    } catch (err: any) {
      console.error('Error deleting post:', err);
      notify.error(err.message || 'خطا در حذف مطلب.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInfoTypeBadge = (t?: string) => {
    switch (t) {
      case 'circular':
        return { label: 'بخشنامه و ابلاغیه', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: FileText };
      case 'guide':
        return { label: 'راهنمای سامانه', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', icon: BookOpen };
      case 'article':
        return { label: 'مقاله آموزشی', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', icon: FileText };
      default:
        return { label: 'اطلاعیه رسمی', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', icon: Megaphone };
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'urgent':
        return { label: 'فوری', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
      case 'high':
        return { label: 'مهم', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default:
        return { label: 'عادی', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مرکز اطلاع‌رسانی، بخشنامه‌ها و دستورالعمل‌ها
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            انتشار ابلاغیه‌های رسمی سازمان، راهنماهای کاربری، مقالات دانشی و اطلاعیه‌های تغییر سامانه
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت مطلب جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="p-4 rounded-2xl border space-y-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، متن، سازمان یا اسلاگ..."
              className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              همه ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>منتشر شده ({posts.filter((p) => p.isPublished !== false).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>پیش‌نویس‌ها ({posts.filter((p) => p.isPublished === false).length})</span>
            </button>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">موضوع:</span>
          {[
            { key: 'all', label: 'همه موضوعات' },
            { key: 'announcement', label: 'اطلاعیه‌ها' },
            { key: 'circular', label: 'بخشنامه‌ها' },
            { key: 'guide', label: 'راهنماها' },
            { key: 'article', label: 'پایگاه دانش' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setTypeFilter(pill.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                typeFilter === pill.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {pill.label}
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
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              لیست مطالب ({filteredPosts.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-600 mb-3" />
            <p className="text-xs text-slate-500">در حال دریافت مطالب اطلاعاتی از دیتابیس...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-500" />
            <h4 className="text-sm font-bold">مطلبی یافت نشد</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchQuery ? 'با این عبارت جستجو مطلبی پیدا نشد.' : 'می‌توانید اولین اطلاعیه یا بخشنامه را ثبت نمایید.'}
            </p>
            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت اولین مطلب</span>
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
                {filteredPosts.map((post) => {
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
                        {canManage ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(post)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                              title="ویرایش مطلب"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(post)}
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

      {/* Information Editor Modal */}
      <InformationEditorModal
        isOpen={isModalOpen}
        postToEdit={postToEdit}
        departments={departments}
        systems={systems}
        onClose={() => {
          setIsModalOpen(false);
          setPostToEdit(null);
        }}
        onSuccess={() => {
          fetchData();
          notify.success('مطلب با موفقیت ذخیره شد.');
        }}
      />

      {/* Delete impact preview: access grants are permanently destroyed */}
      {impactPost && (
        <DeleteImpactDialog
          isOpen={Boolean(impactPost)}
          entityKindLabel="مطلب"
          entityName={impactPost.title}
          survivors={[]}
          destroyed={[
            {
              label: 'مجوزهای دسترسی این مطلب',
              count: impactCounts?.accessGrants ?? 0,
              hint: 'سطح دسترسی کاربران به این مطلب از بین می‌رود',
            },
          ]}
          isLoading={isImpactLoading}
          isConfirming={isDeleting}
          onCancel={() => {
            if (isDeleting) return;
            setImpactPost(null);
            setImpactCounts(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
