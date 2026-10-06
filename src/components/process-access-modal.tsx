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
  Edit3
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

  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LookupUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LookupUser | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit'>('view');

  // Loading and action states
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Sync state when process changes
  useEffect(() => {
    if (isOpen) {
      setVisibility(process.visibility || 'public');
      fetchCurrentGrants();
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
          // Filter out users who already have grants or current user
          const existingIds = new Set(grants.map((g) => g.userId));
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
          : 'فرایند در حالت محدود قرار گرفت (فقط افراد منتخب و مدیران).'
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

  const handleAddGrant = async () => {
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

  const handleRevokeGrant = async (targetUserId: string, userName?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/processes/${process.id}/access?userId=${targetUserId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      if (!res.ok) throw new Error('خطا در لغو دسترسی');

      const updated = grants.filter((g) => g.userId !== targetUserId);
      setGrants(updated);
      notify.info(`دسترسی «${userName || 'کاربر'}» لغو شد.`);

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

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/process/${process.slug}` : '';
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    notify.success('لینک مستقیم فرایند در کلیپ‌بورد کپی شد.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden transition-all"
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
            <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
              visibility === 'public'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400'
            }`}>
              {visibility === 'public' ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                اشتراک‌گذاری و مدیریت دسترسی‌ها
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  visibility === 'public'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {visibility === 'public' ? 'عمومی' : 'محدود و محرمانه'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                {process.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visibility Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-3">
              سطح دسترسی و قابلیت مشاهده (Visibility Scope)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Public */}
              <button
                type="button"
                disabled={isSavingVisibility}
                onClick={() => handleVisibilityChange('public')}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col gap-2 relative ${
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
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  قابل مشاهده و جستجو برای تمام پرسنل و کاربران سازمان.
                </p>
              </button>

              {/* Option 2: Restricted */}
              <button
                type="button"
                disabled={isSavingVisibility}
                onClick={() => handleVisibilityChange('restricted')}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col gap-2 relative ${
                  visibility === 'restricted'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] bg-[var(--bg-app)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>محدود و اختصاصی (Restricted)</span>
                  </div>
                  {visibility === 'restricted' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  محرمانه؛ تنها شما، مدیران و اشخاص مجاز تعیین‌شده دسترسی دارند.
                </p>
              </button>
            </div>
          </div>

          {/* Granular User Permissions (Shown when Restricted) */}
          {visibility === 'restricted' && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>اعطای دسترسی به اشخاص مشخص</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  جستجوی امن بدون افشای دایرکتوری
                </span>
              </div>

              {/* Secure Search Input */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="حداقل ۳ حرف از نام یا ایمیل همکار را بنویسید..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedUser(null);
                      }}
                      className="w-full pr-9 pl-3 py-2 text-xs rounded-lg border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    {isSearching && (
                      <Loader2 className="w-4 h-4 animate-spin absolute left-3 top-3 text-[var(--text-muted)]" />
                    )}
                  </div>

                  {/* Permission Dropdown */}
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value as 'view' | 'edit')}
                    className="px-3 py-2 text-xs rounded-lg border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="view">👁️ مشاهده</option>
                    <option value="edit">✏️ ویرایش</option>
                  </select>

                  <button
                    type="button"
                    disabled={!selectedUser || isLoading}
                    onClick={handleAddGrant}
                    className="px-3.5 py-2 text-xs rounded-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && !selectedUser && (
                  <div 
                    className="absolute z-20 top-full mt-1.5 w-full rounded-xl border shadow-xl bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden"
                  >
                    <div className="p-1.5 space-y-1 max-h-52 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchQuery(user.name);
                            setSearchResults([]);
                          }}
                          className="w-full p-2 rounded-lg text-right flex items-center justify-between hover:bg-[var(--bg-app)] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-[var(--bg-app)]" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                                {user.name.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-semibold group-hover:text-blue-500 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                                {user.maskedEmail}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            {user.roleName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected User Notice */}
              {selectedUser && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                  <span className="text-blue-600 dark:text-blue-400">
                    کاربر انتخاب‌شده: <strong>{selectedUser.name}</strong> ({selectedPermission === 'edit' ? 'ویرایشگر' : 'بیننده'})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-[var(--text-muted)] hover:text-red-500"
                  >
                    تغییر
                  </button>
                </div>
              )}

              {/* List of Current Grants */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-between">
                  <span>کاربران دارای دسترسی ({grants.length})</span>
                </div>

                {grants.length === 0 ? (
                  <div className="p-3 text-center rounded-lg border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                    هنوز دسترسی اختصاصی به فردی داده نشده است. فقط شما و مدیران ارشد مجازید.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {grants.map((grant) => (
                      <div
                        key={grant.id}
                        className="p-2.5 rounded-lg border bg-[var(--bg-surface)] border-[var(--border-subtle)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {grant.user?.avatarUrl ? (
                            <img src={grant.user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px]">
                              {(grant.user?.name || 'ک').slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">
                              {grant.user?.name || 'کاربر سازمانی'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] mr-2 font-mono">
                              {grant.user?.roleName || ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                            grant.permission === 'edit'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}>
                            {grant.permission === 'edit' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {grant.permission === 'edit' ? 'ویرایشگر' : 'مشاهده‌گر'}
                          </span>

                          <button
                            type="button"
                            title="لغو دسترسی"
                            onClick={() => handleRevokeGrant(grant.userId, grant.user?.name)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Copy Link */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
              لینک مستقیم فرایند
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={typeof window !== 'undefined' ? `${window.location.origin}/process/${process.slug}` : ''}
                className="flex-1 px-3 py-2 text-xs rounded-lg border bg-[var(--bg-app)] border-[var(--border-subtle)] font-mono text-[var(--text-muted)] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 text-xs rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                  isCopied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'کپی شد' : 'کپی لینک'}</span>
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
            className="px-4 py-2 text-xs rounded-xl font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
