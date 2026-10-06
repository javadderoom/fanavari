'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Globe, 
  UserPlus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Search, 
  Loader2, 
  AlertCircle,
  Eye,
  Edit3,
  Building2,
  Tag,
  Link2,
  User,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Process, ProcessAccessGrant, ProcessVisibility } from '@/types/process';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';

interface ProcessAccessModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedProcess: Process) => void;
}

interface LookupUser {
  id: string;
  name: string;
  roleName: string;
  avatarUrl?: string;
  maskedEmail: string;
}

interface DeptItem {
  id: string;
  name: string;
  slug: string;
}

type AudienceTab = 'role' | 'department' | 'claim' | 'user';
type GrantsFilter = 'all' | 'role' | 'department' | 'user' | 'claim';

const PRESET_ROLES = [
  { name: 'مدیر مدرسه', label: 'مدیران مدارس', icon: '🏫', desc: 'کلیه مدیران مدارس دولتی و غیردولتی' },
  { name: 'معاون اجرایی', label: 'معاونین اجرایی', icon: '📋', desc: 'مسئولین ثبت‌نام، سنجش و امور اجرایی مدارس' },
  { name: 'پشتیبان فناوری', label: 'پشتیبان‌های فناوری', icon: '💻', desc: 'کارشناسان شبکه، رایانه و زیرساخت سامانه‌ها' },
  { name: 'معاون آموزشی', label: 'معاونین آموزشی', icon: '🎓', desc: 'مسئولین برنامه‌ریزی درسی و آموزشی' },
  { name: 'آموزگار', label: 'آموزگاران و دبیران', icon: '📚', desc: 'کلیه کادر تدریس و آموزش' },
];

export function ProcessAccessModal({
  process,
  isOpen,
  onClose,
  onUpdate,
}: ProcessAccessModalProps) {
  const { currentUser } = useUserSession();

  const [visibility, setVisibility] = useState<ProcessVisibility>(
    process.visibility || 'public'
  );
  const [grants, setGrants] = useState<ProcessAccessGrant[]>(
    process.accessGrants || []
  );

  // Active Audience Tab
  const [activeAudienceTab, setActiveAudienceTab] = useState<AudienceTab>('role');
  const [grantsFilter, setGrantsFilter] = useState<GrantsFilter>('all');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit'>('view');

  // Role Targeting State
  const [selectedPresetRole, setSelectedPresetRole] = useState<string>('مدیر مدرسه');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');

  // Department Targeting State
  const [departments, setDepartments] = useState<DeptItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  // Claim Link Generator State
  const [claimExpiresInDays, setClaimExpiresInDays] = useState<number>(7);
  const [copiedClaimId, setCopiedClaimId] = useState<string | null>(null);

  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LookupUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LookupUser | null>(null);

  // Action states
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [isCopiedMainLink, setIsCopiedMainLink] = useState(false);

  // Sync state when process changes
  useEffect(() => {
    if (isOpen) {
      setVisibility(process.visibility || 'public');
      fetchCurrentGrants();
      fetchDepartmentsList();
    }
  }, [isOpen, process.id]);

  const fetchCurrentGrants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
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
      console.error('Failed to fetch access grants:', e);
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
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0 && !selectedDeptId) {
            setSelectedDeptId(data[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch departments:', e);
    } finally {
      setIsLoadingDepts(false);
    }
  };

  // Debounced secure search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/users/lookup?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out users who already have individual grants
          const existingIds = new Set(grants.filter(g => g.userId).map((g) => g.userId));
          setSearchResults(data.filter((u: LookupUser) => !existingIds.has(u.id)));
        }
      } catch (err) {
        console.error('User lookup error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, grants]);

  const handleVisibilityChange = async (newVisibility: ProcessVisibility) => {
    try {
      setIsSavingVisibility(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
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
          ? 'فرایند در حالت عمومی قرار گرفت و برای کلیه پرسنل قابل مشاهده است.'
          : 'فرایند در حالت محدود قرار گرفت (فقط مخاطبان مشخص‌شده و مدیران).'
      );

      if (onUpdate) {
        onUpdate({
          ...process,
          visibility: newVisibility,
          accessGrants: grants,
        });
      }
    } catch (err) {
      notify.error('خطا در به‌روزرسانی دسترسی فرایند');
    } finally {
      setIsSavingVisibility(false);
    }
  };

  // 1. Add Role-Based Grant
  const handleAddRoleGrant = async () => {
    const roleToAdd = customRoleInput.trim() || selectedPresetRole;
    if (!roleToAdd) {
      notify.error('لطفاً عنوان سمت سازمانی را مشخص فرمایید.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          targetRoleName: roleToAdd,
          permission: selectedPermission,
        }),
      });

      if (!res.ok) throw new Error('خطا در اعطای دسترسی به نقش');

      const data = await res.json();
      setGrants(data.accessGrants || []);
      setCustomRoleInput('');
      notify.success(`دسترسی برای تمام همکاران با سمت «${roleToAdd}» با موفقیت فعال شد.`);

      if (onUpdate) {
        onUpdate({
          ...process,
          visibility,
          accessGrants: data.accessGrants || [],
        });
      }
    } catch (err) {
      notify.error('خطا در ثبت دسترسی نقش');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Add Department Grant
  const handleAddDeptGrant = async () => {
    if (!selectedDeptId) {
      notify.error('لطفاً یک واحد سازمانی انتخاب کنید.');
      return;
    }

    const dept = departments.find((d) => d.id === selectedDeptId);

    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          targetDepartmentId: selectedDeptId,
          permission: selectedPermission,
        }),
      });

      if (!res.ok) throw new Error('خطا در اعطای دسترسی به واحد سازمانی');

      const data = await res.json();
      setGrants(data.accessGrants || []);
      notify.success(`دسترسی برای اعضای واحد «${dept?.name || 'سازمانی'}» فعال شد.`);

      if (onUpdate) {
        onUpdate({
          ...process,
          visibility,
          accessGrants: data.accessGrants || [],
        });
      }
    } catch (err) {
      notify.error('خطا در ثبت دسترسی واحد سازمانی');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Generate Claim Link Token
  const handleGenerateClaimLink = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          generateClaim: true,
          expiresInDays: claimExpiresInDays,
          permission: selectedPermission,
        }),
      });

      if (!res.ok) throw new Error('خطا در ساخت لینک دعوت');

      const data = await res.json();
      setGrants(data.accessGrants || []);
      notify.success('لینک دعوت هوشمند با موفقیت ایجاد گردید.');

      if (onUpdate) {
        onUpdate({
          ...process,
          visibility,
          accessGrants: data.accessGrants || [],
        });
      }
    } catch (err) {
      notify.error('خطا در تولید توکن دعوت');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Add Individual User Grant
  const handleAddUserGrant = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          permission: selectedPermission,
        }),
      });

      if (!res.ok) throw new Error('خطا در اعطای دسترسی');

      const data = await res.json();
      setGrants(data.accessGrants || []);
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      notify.success(`دسترسی برای «${selectedUser.name}» با موفقیت افزوده شد.`);

      if (onUpdate) {
        onUpdate({
          ...process,
          visibility,
          accessGrants: data.accessGrants || [],
        });
      }
    } catch (err) {
      notify.error('خطا در ثبت دسترسی کاربر');
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke Any Grant
  const handleRevokeGrant = async (grantId: string, label: string) => {
    const ok = await notify.confirm({
      title: 'لغو دسترسی سازمانی',
      message: `آیا از لغو دسترسی «${label}» برای این فرایند اطمینان دارید؟`,
      confirmText: 'بله، لغو شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!ok) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access?grantId=${grantId}`, {
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
          ...process,
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

  const handleCopyClaimUrl = (token: string, grantId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/process/${process.slug}?claim=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedClaimId(grantId);
    notify.success('لینک دعوت در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedClaimId(null), 2500);
  };

  const handleCopyMainLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/process/${process.slug}` : '';
    navigator.clipboard.writeText(url);
    setIsCopiedMainLink(true);
    notify.success('لینک مستقیم فرایند در کلیپ‌بورد کپی شد.');
    setTimeout(() => setIsCopiedMainLink(false), 2500);
  };

  if (!isOpen) return null;

  // Filtered grants
  const roleGrants = grants.filter((g) => Boolean(g.roleName));
  const deptGrants = grants.filter((g) => Boolean(g.departmentId));
  const userGrants = grants.filter((g) => Boolean(g.userId));
  const claimGrants = grants.filter((g) => Boolean(g.claimToken));

  const filteredGrants = grants.filter((g) => {
    if (grantsFilter === 'role') return Boolean(g.roleName);
    if (grantsFilter === 'department') return Boolean(g.departmentId);
    if (grantsFilter === 'user') return Boolean(g.userId);
    if (grantsFilter === 'claim') return Boolean(g.claimToken);
    return true;
  });

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
                توزیع چندمخاطبه و مدیریت دسترسی‌ها
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  visibility === 'public'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {visibility === 'public' ? 'عمومی' : 'محدود سازمانی'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                {process.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Visibility Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
              دامنه و سطح دسترسی فرایند (Process Visibility)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Public */}
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
                  {visibility === 'public' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  قابل مشاهده و جستجو برای تمام پرسنل سازمان در صفحه اصلی و سامانه.
                </p>
              </button>

              {/* Option 2: Restricted */}
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
                  {visibility === 'restricted' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  فقط سمت‌های شغلی هدف، واحدهای معین، یا افراد دارای لینک/دسترسی.
                </p>
              </button>
            </div>
          </div>

          {/* Multi-Audience Configuration Panel (Visible when restricted) */}
          {visibility === 'restricted' && (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>توزیع همزمان بدون اسپم (Zero Cognitive Noise)</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  اشتراک بر اساس نقش، واحد سازمانی، یا لینک دعوت
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

              {/* Tab 1: Role-Based RBAC */}
              {activeAudienceTab === 'role' && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    با انتخاب سمت، کلیه پرسنل دارای این عنوان در تمام مدارس و ارگان‌ها بدون نیاز به انتخاب انفرادی دسترسی پیدا می‌کنند:
                  </div>

                  {/* Preset Role Quick Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_ROLES.map((role) => {
                      const isSelected = selectedPresetRole === role.name && !customRoleInput.trim();
                      const alreadyGranted = grants.some((g) => g.roleName === role.name);
                      return (
                        <button
                          key={role.name}
                          type="button"
                          onClick={() => {
                            setSelectedPresetRole(role.name);
                            setCustomRoleInput('');
                          }}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 font-bold'
                              : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] bg-[var(--bg-app)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{role.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-[var(--text-primary)]">
                                {role.label}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                                {role.desc}
                              </div>
                            </div>
                          </div>
                          {alreadyGranted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                              فعال است
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Role Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="یا نام سمت سازمانی دلخواه دیگر را تایپ کنید (مثلاً: کارشناس مسئول سنجش)..."
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleAddRoleGrant}
                      className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                      <span>افزودن سمت</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Department-Level Grant */}
              {activeAudienceTab === 'department' && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    با یک کلیک، کلیه اعضا و پرسنل متعلق به واحد سازمانی انتخاب‌شده به این فرایند دسترسی خواهند داشت:
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      disabled={isLoadingDepts}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {departments.map((dept) => {
                        const isAlreadyGranted = grants.some((g) => g.departmentId === dept.id);
                        return (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} {isAlreadyGranted ? '(دسترسی قبلاً اعطا شده)' : ''}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      disabled={isLoading || !selectedDeptId}
                      onClick={handleAddDeptGrant}
                      className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span>اعطای دسترسی به کل واحد</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Claim Link Generator */}
              {activeAudienceTab === 'claim' && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    ایجاد پیوند هوشمند زمان‌دار. هر همکاری با باز کردن این لینک، در صورت ورود به سامانه، دسترسی‌اش به صورت خودکار فعال می‌شود:
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">مدت اعتبار:</span>
                      <select
                        value={claimExpiresInDays}
                        onChange={(e) => setClaimExpiresInDays(Number(e.target.value))}
                        className="px-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value={3}>۳ روز</option>
                        <option value={7}>۷ روز (استاندارد)</option>
                        <option value={14}>۱۴ روز (دو هفته)</option>
                        <option value={30}>۳۰ روز (یک ماه)</option>
                        <option value={365}>دائم / ۱ سال</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleGenerateClaimLink}
                      className="w-full sm:w-auto px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                      <span>تولید لینک دعوت جدید</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Individual User Lookup */}
              {activeAudienceTab === 'user' && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    جستجوی اختصاصی و مستقیم همکاران بدون نمایش عمومی دایرکتوری:
                  </div>

                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          placeholder="حداقل ۳ حرف از نام یا ایمیل همکار را وارد فرمایید..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedUser(null);
                          }}
                          className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        {isSearching && (
                          <Loader2 className="w-4 h-4 animate-spin absolute left-3 top-3 text-[var(--text-muted)]" />
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!selectedUser || isLoading}
                        onClick={handleAddUserGrant}
                        className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>افزودن</span>
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {searchResults.length > 0 && !selectedUser && (
                      <div className="absolute z-20 top-full mt-1.5 w-full rounded-2xl border shadow-xl bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden">
                        <div className="p-1.5 space-y-1 max-h-52 overflow-y-auto">
                          {searchResults.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSearchQuery(u.name);
                                setSearchResults([]);
                              }}
                              className="w-full p-2.5 rounded-xl text-right flex items-center justify-between hover:bg-[var(--bg-app)] transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-[var(--bg-app)]" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                                    {u.name.slice(0, 1)}
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs font-semibold group-hover:text-blue-500 transition-colors">
                                    {u.name}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)] font-mono">
                                    {u.maskedEmail}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                {u.roleName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400">
                        کاربر انتخاب‌شده: <strong>{selectedUser.name}</strong> ({selectedUser.roleName})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setSearchQuery('');
                        }}
                        className="text-[11px] text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                      >
                        تغییر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Grants Section */}
              <div className="space-y-3 pt-3 border-t border-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    دسترسی‌های فعال این فرایند ({grants.length})
                  </span>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGrantsFilter('all')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        grantsFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      همه ({grants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantsFilter('role')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        grantsFilter === 'role'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      سمت‌ها ({roleGrants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantsFilter('department')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        grantsFilter === 'department'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      واحدها ({deptGrants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantsFilter('claim')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        grantsFilter === 'claim'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      لینک‌ها ({claimGrants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantsFilter('user')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        grantsFilter === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      اشخاص ({userGrants.length})
                    </button>
                  </div>
                </div>

                {filteredGrants.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                    دسترسی ثبت‌شده‌ای در این بخش وجود ندارد.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                    {filteredGrants.map((grant) => {
                      const isRole = Boolean(grant.roleName);
                      const isDept = Boolean(grant.departmentId);
                      const isClaim = Boolean(grant.claimToken);
                      const isUser = Boolean(grant.userId);

                      let label = 'دسترسی سازمانی';
                      let subLabel = '';
                      let icon = <Users className="w-4 h-4 text-blue-500" />;

                      if (isRole) {
                        label = `سمت: ${grant.roleName}`;
                        subLabel = 'شامل تمام همکاران دارای این سمت در کلیه مدارس/واحدهای تابعه';
                        icon = <Tag className="w-4 h-4 text-purple-500" />;
                      } else if (isDept) {
                        label = `واحد سازمانی: ${grant.department?.name || 'واحد تابعه'}`;
                        subLabel = 'شامل کلیه پرسنل ثبت‌شده در این واحد';
                        icon = <Building2 className="w-4 h-4 text-emerald-500" />;
                      } else if (isClaim) {
                        label = 'لینک دعوت هوشمند';
                        const expiresDate = grant.claimExpiresAt ? new Date(grant.claimExpiresAt) : null;
                        const isExpired = expiresDate ? expiresDate < new Date() : false;
                        subLabel = isExpired
                          ? 'منقضی شده'
                          : expiresDate
                          ? `معتبر تا ${expiresDate.toLocaleDateString('fa-IR')}`
                          : 'بدون انقضا';
                        icon = <Link2 className="w-4 h-4 text-amber-500" />;
                      } else if (isUser) {
                        label = grant.user?.name || 'کاربر سازمانی';
                        subLabel = `${grant.user?.roleName || 'پرسنل'} • ${grant.user?.email || ''}`;
                        icon = <User className="w-4 h-4 text-blue-500" />;
                      }

                      return (
                        <div
                          key={grant.id}
                          className="p-3 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] flex items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[var(--text-primary)] truncate">
                                {label}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] truncate">
                                {subLabel}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Permission Badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                              grant.permission === 'edit'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}>
                              {grant.permission === 'edit' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{grant.permission === 'edit' ? 'ویرایشگر' : 'مشاهده‌گر'}</span>
                            </span>

                            {/* Copy button for Claim Links */}
                            {grant.claimToken && (
                              <button
                                type="button"
                                title="کپی پیوند دعوت"
                                onClick={() => handleCopyClaimUrl(grant.claimToken!, grant.id)}
                                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                                  copiedClaimId === grant.id
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                    : 'bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                                }`}
                              >
                                {copiedClaimId === grant.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline text-[10px]">کپی لینک</span>
                              </button>
                            )}

                            {/* Revoke button */}
                            <button
                              type="button"
                              title="لغو این دسترسی"
                              onClick={() => handleRevokeGrant(grant.id, label)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Copy Main URL */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
              لینک مستقیم فرایند
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={typeof window !== 'undefined' ? `${window.location.origin}/process/${process.slug}` : ''}
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
