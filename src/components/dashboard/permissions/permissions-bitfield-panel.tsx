'use client';

import React, { useState } from 'react';
import { 
  Binary, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { 
  Permissions, 
  hasPermission, 
  addPermission, 
  removePermission, 
  ROLE_PRESETS,
  PERMISSION_LABELS,
  PermissionKey
} from '@/lib/permissions';
import { SimulatedPersona } from './types';
import { notify } from '@/lib/notify';

interface PermissionsBitfieldPanelProps {
  selectedPersona: SimulatedPersona;
  onUpdatePersonaPermissions?: (newPermissions: number) => void;
}

export function PermissionsBitfieldPanel({
  selectedPersona,
  onUpdatePersonaPermissions,
}: PermissionsBitfieldPanelProps) {
  // Sandbox bitfield state initialized from persona
  const [sandboxBits, setSandboxBits] = useState<number>(selectedPersona.permissions);
  const [isCopiedHex, setIsCopiedHex] = useState(false);

  const permissionItems = [
    { key: 'VIEW_PROCESSES', bit: Permissions.VIEW_PROCESSES, label: 'مشاهده فرایندها (VIEW)', code: '1 << 0' },
    { key: 'CREATE_PROCESSES', bit: Permissions.CREATE_PROCESSES, label: 'ثبت فرایند جدید (CREATE)', code: '1 << 1' },
    { key: 'EDIT_PROCESSES', bit: Permissions.EDIT_PROCESSES, label: 'ویرایش فرایندها (EDIT)', code: '1 << 2' },
    { key: 'DELETE_PROCESSES', bit: Permissions.DELETE_PROCESSES, label: 'حذف فرایندها (DELETE)', code: '1 << 3' },
    { key: 'MANAGE_STEPS', bit: Permissions.MANAGE_STEPS, label: 'مدیریت مراحل و گام‌ها (STEPS)', code: '1 << 4' },
    { key: 'MANAGE_ERRORS', bit: Permissions.MANAGE_ERRORS, label: 'مدیریت کدهای خطا (ERRORS)', code: '1 << 5' },
    { key: 'MANAGE_CATEGORIES', bit: Permissions.MANAGE_CATEGORIES, label: 'مدیریت سازمان‌ها (DEPARTMENTS)', code: '1 << 6' },
    { key: 'MANAGE_SYSTEMS', bit: Permissions.MANAGE_SYSTEMS, label: 'مدیریت سامانه‌ها (SYSTEMS)', code: '1 << 7' },
    { key: 'MANAGE_USERS', bit: Permissions.MANAGE_USERS, label: 'مدیریت کاربران (USERS)', code: '1 << 8' },
    { key: 'VIEW_AUDIT_LOGS', bit: Permissions.VIEW_AUDIT_LOGS, label: 'مشاهده لاگ‌های امنیتی (AUDIT)', code: '1 << 9' },
    { key: 'MANAGE_INFORMATION', bit: Permissions.MANAGE_INFORMATION, label: 'مدیریت اطلاع‌رسانی (INFORMATION)', code: '1 << 10' },
    { key: 'ADMINISTRATOR', bit: Permissions.ADMINISTRATOR, label: 'دسترسی ریشه مدیر ارشد (ADMIN)', code: '1 << 30' },
  ];

  const toggleBit = (bit: number) => {
    let next: number;
    if ((sandboxBits & bit) === bit) {
      next = removePermission(sandboxBits, bit);
    } else {
      next = addPermission(sandboxBits, bit);
    }
    setSandboxBits(next);
    if (onUpdatePersonaPermissions) {
      onUpdatePersonaPermissions(next);
    }
  };

  const applyPreset = (presetBitfield: number) => {
    setSandboxBits(presetBitfield);
    if (onUpdatePersonaPermissions) {
      onUpdatePersonaPermissions(presetBitfield);
    }
    notify.success('پیکربندی نقش با موفقیت اعمال گردید.');
  };

  const hexString = `0x${sandboxBits.toString(16).toUpperCase().padStart(8, '0')}`;
  const binaryString = (sandboxBits >>> 0).toString(2).padStart(32, '0');

  const copyHex = () => {
    navigator.clipboard.writeText(hexString);
    setIsCopiedHex(true);
    setTimeout(() => setIsCopiedHex(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Bitfield Sandbox Header Card */}
      <div 
        className="glass-panel-strong rounded-3xl p-6 border shadow-sm space-y-5"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                جعبه شنی محاسبه‌گر پرچم‌های بیتی (Bitfield Sandbox)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              معماری فوق سریع اعتبارسنجی باینری، مطابق استاندارد دیسکورد و سیستم‌های سطح سیستم‌عامل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyHex}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              dir="ltr"
            >
              {isCopiedHex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hexString}</span>
            </button>
          </div>
        </div>

        {/* Live Bit Representation */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>نمایش باینری 32 بیتی (32-bit Vector):</span>
            <span dir="ltr" className="font-mono text-emerald-400 font-bold">
              Decimal: {sandboxBits}
            </span>
          </div>
          <div className="font-mono text-xs tracking-widest break-all text-blue-400 font-bold bg-slate-950 p-3 rounded-xl border border-slate-800/80" dir="ltr">
            {binaryString.match(/.{1,4}/g)?.join(' ')}
          </div>
        </div>

        {/* Quick Role Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 block">
            بارگذاری سریع الگوهای استاندارد نقش‌ها:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => applyPreset(ROLE_PRESETS.SUPER_ADMIN.bitfield)}
              className="p-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-700 dark:text-rose-400 text-right font-bold text-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>مدیر ارشد سامانه</span>
                <span className="text-[10px] font-mono" dir="ltr">ADMIN</span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">تمام دسترسی‌ها بدون محدودیت</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset(ROLE_PRESETS.PROCESS_MANAGER.bitfield)}
              className="p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-right font-bold text-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>مدیر فرایندها</span>
                <span className="text-[10px] font-mono" dir="ltr">MANAGER</span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">مدیریت SOPها و کاتالوگ</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset(ROLE_PRESETS.PROCESS_EDITOR.bitfield)}
              className="p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-right font-bold text-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>تدوین‌گر محتوا</span>
                <span className="text-[10px] font-mono" dir="ltr">EDITOR</span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">افزودن و ویرایش مراحل</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset(ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield)}
              className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-right font-bold text-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span>کاربر مشاهده‌کننده</span>
                <span className="text-[10px] font-mono" dir="ltr">VIEWER</span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">مشاهده فرایندهای مجاز</div>
            </button>
          </div>
        </div>

        {/* Individual Bit Flags Grid */}
        <div className="pt-3">
          <span className="text-xs font-bold text-slate-400 block mb-3">
            تغییر دستی پرچم‌های دسترسی (روی هر مورد برای فعال/غیرفعال‌سازی کلیک کنید):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissionItems.map((item) => {
              const isEnabled = hasPermission(sandboxBits, item.bit);
              const labelInfo = PERMISSION_LABELS[item.key as PermissionKey];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleBit(item.bit)}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isEnabled
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs" style={{ color: isEnabled ? 'inherit' : 'var(--text-primary)' }}>
                      {item.label}
                    </div>
                    {labelInfo && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {labelInfo.description}
                      </div>
                    )}
                    <div className="font-mono text-[10px] text-slate-400 mt-1" dir="ltr">
                      {item.code}
                    </div>
                  </div>

                  <div className="mt-0.5 shrink-0">
                    {isEnabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
