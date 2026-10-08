'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions, ROLE_PRESETS } from '@/lib/permissions';
import { DeleteImpactDialog } from '@/components/delete-impact-dialog';
import { notify } from '@/lib/notify';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  ShieldCheck,
  Ban,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  Save,
  Phone,
  Mail,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  roleName: string;
  permissions: number;
  departmentId: string | null;
  departmentName: string | null;
  personnelCode: string | null;
  avatarUrl: string | null;
  otpEnabled: boolean;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Dept {
  id: string;
  name: string;
  slug: string;
}

const ROLE_OPTIONS = [
  { key: 'SUPER_ADMIN', label: 'مدیر ارشد سامانه', roleName: 'Super Admin', bitfield: ROLE_PRESETS.SUPER_ADMIN.bitfield },
  { key: 'PROCESS_MANAGER', label: 'مدیر فرایندها', roleName: 'Process Manager', bitfield: ROLE_PRESETS.PROCESS_MANAGER.bitfield },
  { key: 'PROCESS_EDITOR', label: 'تدوین‌گر فرایند', roleName: 'Editor', bitfield: ROLE_PRESETS.PROCESS_EDITOR.bitfield },
  { key: 'EMPLOYEE_VIEWER', label: 'کاربر عادی / مشاهده‌کننده', roleName: 'Viewer', bitfield: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield },
];

export default function DashboardUsersPage() {
  const { currentUser, can, isSuperAdmin } = useUserSession();
  const canManage = can(Permissions.MANAGE_USERS) || isSuperAdmin;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [fName, setFName] = useState('');
  const [fContactType, setFContactType] = useState<'phone' | 'email'>('phone');
  const [fContact, setFContact] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fRoleKey, setFRoleKey] = useState('EMPLOYEE_VIEWER');
  const [fDeptId, setFDeptId] = useState('');
  const [fStatus, setFStatus] = useState('active');
  const [fPersonnelCode, setFPersonnelCode] = useState('');

  // Delete impact state
  const [impactUser, setImpactUser] = useState<AdminUser | null>(null);
  const [impactCounts, setImpactCounts] = useState<{
    processGrants: number;
    infoGrants: number;
    sessions: number;
    authoredProcesses: number;
    authoredPosts: number;
    operatedRuns: number;
  } | null>(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetch('/api/users', { headers: { 'x-user-permissions': String(currentUser.permissions) } }),
        fetch('/api/departments').then((r) => r.json()).catch(() => []),
      ]);
      if (!usersRes.ok) {
        const err = await usersRes.json().catch(() => ({}));
        throw new Error(err.error || 'خطا در دریافت کاربران');
      }
      const data = await usersRes.json();
      if (Array.isArray(data)) setUsers(data);
      if (Array.isArray(deptsRes)) setDepartments(deptsRes);
    } catch (err: any) {
      notify.error(err.message || 'خطا در دریافت کاربران.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.permissions]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(searchQuery.trim())) ||
        (u.departmentName && u.departmentName.includes(searchQuery.trim())) ||
        u.roleName.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, statusFilter]);

  const openCreate = () => {
    setUserToEdit(null);
    setFName('');
    setFContactType('phone');
    setFContact('');
    setFPassword('');
    setFRoleKey('EMPLOYEE_VIEWER');
    setFDeptId('');
    setFStatus('active');
    setFPersonnelCode('');
    setIsModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setUserToEdit(u);
    setFName(u.name);
    setFPassword('');
    const preset = ROLE_OPTIONS.find((r) => r.bitfield === u.permissions);
    setFRoleKey(preset ? preset.key : 'EMPLOYEE_VIEWER');
    setFDeptId(u.departmentId || '');
    setFStatus(u.status);
    setFPersonnelCode(u.personnelCode || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const preset = ROLE_OPTIONS.find((r) => r.key === fRoleKey)!;
      let res: Response;
      if (userToEdit) {
        const body: any = {
          name: fName.trim(),
          roleName: preset.roleName,
          permissions: preset.bitfield,
          departmentId: fDeptId || null,
          status: fStatus,
          personnelCode: fPersonnelCode.trim() || null,
        };
        if (fPassword) body.password = fPassword;
        res = await fetch(`/api/users/${userToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-permissions': String(currentUser.permissions),
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-permissions': String(currentUser.permissions),
          },
          body: JSON.stringify({
            name: fName.trim(),
            contactType: fContactType,
            contact: fContact.trim(),
            password: fPassword,
            roleName: preset.roleName,
            permissions: preset.bitfield,
            departmentId: fDeptId || null,
          }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در ذخیره‌سازی');
      notify.success(userToEdit ? 'کاربر با موفقیت ویرایش شد.' : 'کاربر با موفقیت ایجاد شد.');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      notify.error(err.message || 'خطا در ذخیره‌سازی');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSuspend = async (u: AdminUser) => {
    const suspend = u.status !== 'suspended';
    const confirmed = await notify.confirm({
      title: suspend ? 'تعلیق حساب کاربری' : 'رفع تعلیق حساب',
      message: suspend
        ? `حساب «${u.name}» تعلیق شود؟ نشست‌های فعال بی‌اعتبار نمی‌شوند ولی ورود و دسترسی قطع می‌گردد.`
        : `تعلیق حساب «${u.name}» لغو شود؟`,
      confirmText: suspend ? 'بله، تعلیق شود' : 'بله، فعال شود',
      cancelText: 'انصراف',
      isDestructive: suspend,
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({ status: suspend ? 'suspended' : 'active' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در تغییر وضعیت');
      setUsers((prev) => prev.map((x) => (x.id === u.id ? data : x)));
      notify.success(suspend ? 'حساب تعلیق شد.' : 'حساب فعال شد.');
    } catch (err: any) {
      notify.error(err.message || 'خطا در تغییر وضعیت');
    }
  };

  const handleDelete = async (u: AdminUser) => {
    setImpactUser(u);
    setImpactCounts(null);
    setIsImpactLoading(true);
    try {
      const res = await fetch(`/api/users/impact?id=${u.id}`, {
        headers: { 'x-user-permissions': String(currentUser.permissions) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در بررسی وابستگی‌ها');
      setImpactCounts(data.impact || null);
    } catch (err: any) {
      notify.error(err.message || 'خطا در بررسی وابستگی‌ها.');
      setImpactUser(null);
    } finally {
      setIsImpactLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!impactUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${impactUser.id}`, {
        method: 'DELETE',
        headers: { 'x-user-permissions': String(currentUser.permissions) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'خطا در حذف کاربر');
      setUsers((prev) => prev.filter((x) => x.id !== impactUser.id));
      setImpactUser(null);
      setImpactCounts(null);
      notify.success('کاربر با موفقیت حذف شد.');
    } catch (err: any) {
      notify.error(err.message || 'خطا در حذف کاربر.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'suspended')
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20"><Ban className="w-3 h-3" /><span>تعلیق‌شده</span></span>;
    if (status === 'pending')
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"><Clock className="w-3 h-3" /><span>در انتظار تأیید</span></span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /><span>فعال</span></span>;
  };

  const inputClass = 'w-full p-2.5 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500';
  const inputStyle = { background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' } as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت کاربران سامانه
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            حساب‌ها، نقش‌ها، عضویت سازمانی و وضعیت فعالیت کاربران
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all cursor-pointer hover:scale-105 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت کاربر جدید</span>
          </button>
        )}
      </div>

      <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام، تماس، سازمان یا نقش..."
              className="w-full pr-10 pl-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-sky-500"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(
              [
                { key: 'all', label: `همه (${users.length})` },
                { key: 'active', label: `فعال (${users.filter((u) => u.status === 'active').length})` },
                { key: 'pending', label: `در انتظار (${users.filter((u) => u.status === 'pending').length})` },
                { key: 'suspended', label: `تعلیق‌شده (${users.filter((u) => u.status === 'suspended').length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === t.key ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel-strong rounded-3xl border shadow-lg overflow-hidden" style={{ borderColor: 'var(--border-glass)' }}>
        <div className="p-4 sm:p-5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <Users className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
            لیست کاربران ({filteredUsers.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-sky-600 mb-3" />
            <p className="text-xs text-slate-500">در حال دریافت کاربران...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-sky-500" />
            <h4 className="text-sm font-bold">کاربری یافت نشد</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 font-bold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th className="p-4">کاربر</th>
                  <th className="p-4">تماس</th>
                  <th className="p-4">نقش و سازمان</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-950/20 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {u.otpEnabled && <span title="ورود دومرحله‌ای فعال"><ShieldCheck className="w-3 h-3 text-emerald-500" /></span>}
                        {u.personnelCode ? `کد پرسنلی: ${u.personnelCode}` : 'بدون کد پرسنلی'}
                        {u.id === currentUser.id && <span className="text-sky-600 font-bold">• شما</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {u.phone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono" dir="ltr">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                            {u.phoneVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : null}
                          </span>
                        )}
                        {u.email && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono" dir="ltr">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                            {u.emailVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : null}
                          </span>
                        )}
                        {!u.phone && !u.email && <span className="text-slate-400 text-[11px]">—</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>{u.roleName}</span>
                      <span className="text-[11px] text-slate-500">{u.departmentName || 'بدون سازمان'}</span>
                    </td>
                    <td className="p-4 text-center">{statusBadge(u.status)}</td>
                    <td className="p-4 text-center">
                      {canManage ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer" title="ویرایش">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleToggleSuspend(u)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer" title={u.status === 'suspended' ? 'رفع تعلیق' : 'تعلیق'}>
                            {u.status === 'suspended' ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button type="button" onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">فقط خواندنی</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => !isSaving && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl glass-panel-strong z-10 shadow-2xl animate-in zoom-in-95" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {userToEdit ? 'ویرایش کاربر' : 'ثبت کاربر جدید'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>نام و نام خانوادگی *</label>
                <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} className={inputClass} style={inputStyle} />
              </div>

              {!userToEdit && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>نوع تماس *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['phone', 'email'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setFContactType(t)}
                          className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${fContactType === t ? 'bg-sky-600 text-white border-sky-600' : ''}`}
                          style={fContactType === t ? undefined : { borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          {t === 'phone' ? 'شماره موبایل' : 'ایمیل'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{fContactType === 'phone' ? 'شماره موبایل *' : 'ایمیل *'}</label>
                    <input type="text" dir="auto" value={fContact} onChange={(e) => setFContact(e.target.value)} className={inputClass} style={inputStyle} />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {userToEdit ? 'گذرواژه جدید (خالی = بدون تغییر، کاربر از همه نشست‌ها خارج می‌شود)' : 'گذرواژه *'}
                </label>
                <input dir="ltr" type="password" value={fPassword} onChange={(e) => setFPassword(e.target.value)} placeholder="حداقل ۸ کاراکتر" className={inputClass} style={inputStyle} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>نقش و دسترسی</label>
                  <select value={fRoleKey} onChange={(e) => setFRoleKey(e.target.value)} className={`${inputClass} cursor-pointer`} style={inputStyle}>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>سازمان</label>
                  <select value={fDeptId} onChange={(e) => setFDeptId(e.target.value)} className={`${inputClass} cursor-pointer`} style={inputStyle}>
                    <option value="">بدون سازمان</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>وضعیت</label>
                  <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={`${inputClass} cursor-pointer`} style={inputStyle}>
                    <option value="active">فعال</option>
                    <option value="pending">در انتظار تأیید</option>
                    <option value="suspended">تعلیق‌شده</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>کد پرسنلی</label>
                  <input type="text" value={fPersonnelCode} onChange={(e) => setFPersonnelCode(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" style={{ color: 'var(--text-secondary)' }}>
                  انصراف
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 cursor-pointer disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{userToEdit ? 'ذخیره تغییرات' : 'ایجاد کاربر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete impact preview */}
      {impactUser && (
        <DeleteImpactDialog
          isOpen={Boolean(impactUser)}
          entityKindLabel="کاربر"
          entityName={impactUser.name}
          survivors={[
            { label: 'فرایندهای نگارش‌شده', count: impactCounts?.authoredProcesses ?? 0, hint: 'حفظ می‌شوند ولی بدون نگارنده می‌مانند' },
            { label: 'مطالب نگارش‌شده', count: impactCounts?.authoredPosts ?? 0, hint: 'حفظ می‌شوند ولی بدون نگارنده می‌مانند' },
            { label: 'اجراهای اپراتوری', count: impactCounts?.operatedRuns ?? 0, hint: 'سوابق ممیزی حفظ ولی بدون اپراتور می‌مانند' },
          ]}
          destroyed={[
            { label: 'مجوزهای دسترسی فرایندها', count: impactCounts?.processGrants ?? 0 },
            { label: 'مجوزهای دسترسی اطلاعیه‌ها', count: impactCounts?.infoGrants ?? 0 },
            { label: 'نشست‌های ورود', count: impactCounts?.sessions ?? 0, hint: 'کاربر از همه دستگاه‌ها خارج می‌شود' },
          ]}
          isLoading={isImpactLoading}
          isConfirming={isDeleting}
          onCancel={() => {
            if (isDeleting) return;
            setImpactUser(null);
            setImpactCounts(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
