'use client';

import React, { useState } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { ProcessAccessGrant } from '@/types/process';
import { PRESET_ROLES } from './types';
import { notify } from '@/lib/notify';

interface RoleGrantTabProps {
  grants: ProcessAccessGrant[];
  isLoading: boolean;
  selectedPermission: 'view' | 'edit';
  onAddRoleGrant: (roleName: string) => Promise<void>;
}

export function RoleGrantTab({
  grants,
  isLoading,
  selectedPermission,
  onAddRoleGrant,
}: RoleGrantTabProps) {
  const [selectedPresetRole, setSelectedPresetRole] = useState<string>('مدیر مدرسه');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');

  const handleAdd = async () => {
    const roleToAdd = customRoleInput.trim() || selectedPresetRole;
    if (!roleToAdd) {
      notify.error('لطفاً عنوان سمت سازمانی را مشخص فرمایید.');
      return;
    }
    await onAddRoleGrant(roleToAdd);
    setCustomRoleInput('');
  };

  return (
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
          onClick={handleAdd}
          className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
          <span>افزودن سمت</span>
        </button>
      </div>
    </div>
  );
}
