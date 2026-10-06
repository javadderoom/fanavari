'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Globe, 
  ShieldCheck, 
  Tag, 
  Building2, 
  Link2, 
  User, 
  Copy, 
  Check 
} from 'lucide-react';
import { InformationPost, InformationAccessGrant, ProcessVisibility } from '@/types/process';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';
import { AudienceTab, DeptItem } from './access/types';
import { RoleGrantTab } from './access/role-grant-tab';
import { DepartmentGrantTab } from './access/department-grant-tab';
import { ClaimGrantTab } from './access/claim-grant-tab';
import { UserGrantTab } from './access/user-grant-tab';
import { ActiveGrantsList } from './access/active-grants-list';

interface InformationAccessModalProps {
  post: InformationPost;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedPost: InformationPost) => void;
}

export function InformationAccessModal({
  post,
  isOpen,
  onClose,
  onUpdate,
}: InformationAccessModalProps) {
  const { currentUser } = useUserSession();

  const [visibility, setVisibility] = useState<ProcessVisibility>(
    post.visibility || 'public'
  );
  const [grants, setGrants] = useState<InformationAccessGrant[]>(
    post.accessGrants || []
  );

  const [activeAudienceTab, setActiveAudienceTab] = useState<AudienceTab>('role');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit'>('view');

  const [departments, setDepartments] = useState<DeptItem[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [isCopiedMainLink, setIsCopiedMainLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisibility(post.visibility || 'public');
      fetchCurrentGrants();
      fetchDepartmentsList();
    }
  }, [isOpen, post.id]);

  const fetchCurrentGrants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/information/${post.id}/access`, {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVisibility(data.visibility || 'public');
        setGrants(data.accessGrants || []);
      }
    } catch (e) {
      console.error('Failed to fetch information access grants:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentsList = async () => {
    try {
      setIsLoadingDepts(true);
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDepartments(data);
      }
    } catch (e) {
      console.error('Failed to fetch departments:', e);
    } finally {
      setIsLoadingDepts(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: ProcessVisibility) => {
    try {
      setIsSavingVisibility(true);
      const res = await fetch(`/api/information/${post.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (!res.ok) throw new Error('خطا در ذخیره وضعیت دسترسی');

      setVisibility(newVisibility);
      notify.success(
        newVisibility === 'public'
          ? 'مطلب در حالت عمومی قرار گرفت و برای کلیه پرسنل قابل مشاهده است.'
          : 'مطلب در حالت محدود قرار گرفت (فقط مخاطبان مشخص‌شده و مدیران).'
      );

      if (onUpdate) {
        onUpdate({
          ...post,
          visibility: newVisibility,
          accessGrants: grants,
        });
      }
    } catch (err) {
      notify.error('خطا در به‌روزرسانی دسترسی مطلب');
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const postGrant = async (payload: any, successMessage: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/information/${post.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          ...payload,
          permission: selectedPermission,
        }),
      });

      if (!res.ok) throw new Error('خطا در ثبت دسترسی');

      const data = await res.json();
      setGrants(data.accessGrants || []);
      notify.success(successMessage);

      if (onUpdate) {
        onUpdate({
          ...post,
          visibility,
          accessGrants: data.accessGrants || [],
        });
      }
    } catch (err) {
      notify.error('خطا در ثبت تغییرات دسترسی');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoleGrant = async (roleName: string) => {
    await postGrant(
      { targetRoleName: roleName },
      `دسترسی برای همکاران با سمت «${roleName}» با موفقیت فعال شد.`
    );
  };

  const handleAddDeptGrant = async (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    await postGrant(
      { targetDepartmentId: deptId },
      `دسترسی برای اعضای واحد «${dept?.name || 'سازمانی'}» فعال شد.`
    );
  };

  const handleGenerateClaimLink = async (expiresInDays: number) => {
    await postGrant(
      { generateClaim: true, expiresInDays },
      'لینک دعوت هوشمند با موفقیت ایجاد گردید.'
    );
  };

  const handleAddUserGrant = async (userId: string, userName: string) => {
    await postGrant(
      { targetUserId: userId },
      `دسترسی برای «${userName}» با موفقیت افزوده شد.`
    );
  };

  const handleRevokeGrant = async (grantId: string, label: string) => {
    const ok = await notify.confirm({
      title: 'لغو دسترسی سازمانی',
      message: `آیا از لغو دسترسی «${label}» برای این بخشنامه / مطلب اطمینان دارید؟`,
      confirmText: 'بله، لغو شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!ok) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/information/${post.id}/access?grantId=${grantId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) throw new Error('خطا در لغو دسترسی');

      const updated = grants.filter((g) => g.id !== grantId);
      setGrants(updated);
      notify.info(`دسترسی «${label}» با موفقیت لغو شد.`);

      if (onUpdate) {
        onUpdate({
          ...post,
          visibility,
          accessGrants: updated,
        });
      }
    } catch (err) {
      notify.error('خطا در حذف دسترسی');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMainLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/information/${post.slug}` : '';
    navigator.clipboard.writeText(url);
    setIsCopiedMainLink(true);
    notify.success('لینک مستقیم مطلب در کلیپ‌بورد کپی شد.');
    setTimeout(() => setIsCopiedMainLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div 
        className="w-full max-w-3xl rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div 
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
              visibility === 'public'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400'
            }`}>
              {visibility === 'public' ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                توزیع چندمخاطبه و دسترسی بخشنامه
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  visibility === 'public'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {visibility === 'public' ? 'عمومی' : 'محدود سازمانی'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                {post.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Visibility Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
              دامنه و سطح دسترسی بخشنامه (Notice Visibility)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSavingVisibility}
                onClick={() => handleVisibilityChange('public')}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-2 relative cursor-pointer ${
                  visibility === 'public'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] bg-[var(--bg-app)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>عمومی (Public)</span>
                  </div>
                  {visibility === 'public' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  قابل مشاهده و جستجو برای تمام فرهنگیان و پرسنل در صفحه اخبار و بخشنامه‌ها.
                </p>
              </button>

              <button
                type="button"
                disabled={isSavingVisibility}
                onClick={() => handleVisibilityChange('restricted')}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-2 relative cursor-pointer ${
                  visibility === 'restricted'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] bg-[var(--bg-app)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>محدود سازمانی (Restricted & RBAC)</span>
                  </div>
                  {visibility === 'restricted' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  فقط سمت‌های هدف (مثلاً مدیران، معاونین یا آموزگاران) و واحدهای تعیین‌شده.
                </p>
              </button>
            </div>
          </div>

          {/* Multi-Audience Configuration Panel */}
          {visibility === 'restricted' && (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>توزیع دقیق بدون ازدحام اطلاعاتی (Zero Cognitive Noise)</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  اشتراک بر اساس سمت سازمانی، واحد، یا لینک دعوت
                </span>
              </div>

              {/* Audience Modality Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setActiveAudienceTab('role')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudienceTab === 'role'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>نقش / سمت (RBAC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAudienceTab('department')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudienceTab === 'department'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>واحد سازمانی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAudienceTab('claim')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudienceTab === 'claim'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>لینک دعوت موقت</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAudienceTab('user')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudienceTab === 'user'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>شخص خاص</span>
                </button>
              </div>

              {/* Permission Selector Bar */}
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] font-medium">سطح مجوز اعطایی:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="permission"
                      value="view"
                      checked={selectedPermission === 'view'}
                      onChange={() => setSelectedPermission('view')}
                      className="accent-blue-600"
                    />
                    <span>👁️ فقط مشاهده</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="permission"
                      value="edit"
                      checked={selectedPermission === 'edit'}
                      onChange={() => setSelectedPermission('edit')}
                      className="accent-blue-600"
                    />
                    <span>✏️ امکان ویرایش</span>
                  </label>
                </div>
              </div>

              {/* Tab Contents */}
              {activeAudienceTab === 'role' && (
                <RoleGrantTab
                  grants={grants}
                  isLoading={isLoading}
                  selectedPermission={selectedPermission}
                  onAddRoleGrant={handleAddRoleGrant}
                />
              )}

              {activeAudienceTab === 'department' && (
                <DepartmentGrantTab
                  departments={departments}
                  grants={grants}
                  isLoading={isLoading}
                  isLoadingDepts={isLoadingDepts}
                  onAddDeptGrant={handleAddDeptGrant}
                />
              )}

              {activeAudienceTab === 'claim' && (
                <ClaimGrantTab
                  isLoading={isLoading}
                  onGenerateClaimLink={handleGenerateClaimLink}
                />
              )}

              {activeAudienceTab === 'user' && (
                <UserGrantTab
                  grants={grants}
                  isLoading={isLoading}
                  onAddUserGrant={handleAddUserGrant}
                />
              )}

              {/* Active Grants List */}
              <ActiveGrantsList
                grants={grants}
                targetSlug={post.slug}
                targetType="information"
                entityLabel="بخشنامه / مطلب"
                onRevokeGrant={handleRevokeGrant}
              />
            </div>
          )}

          {/* Quick Copy Main URL */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
              لینک مستقیم بخشنامه
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={typeof window !== 'undefined' ? `${window.location.origin}/information/${post.slug}` : ''}
                className="flex-1 px-3 py-2 text-xs rounded-xl border bg-[var(--bg-app)] border-[var(--border-subtle)] font-mono text-[var(--text-muted)] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyMainLink}
                className={`px-3.5 py-2 text-xs rounded-xl font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isCopiedMainLink
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                }`}
              >
                {isCopiedMainLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedMainLink ? 'کپی شد' : 'کپی لینک'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex items-center justify-end"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs rounded-xl font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-sm"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
