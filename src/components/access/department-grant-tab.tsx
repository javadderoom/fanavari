'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { ProcessAccessGrant } from '@/types/process';
import { DeptItem } from './types';
import { notify } from '@/lib/notify';

interface DepartmentGrantTabProps {
  departments: DeptItem[];
  grants: ProcessAccessGrant[];
  isLoading: boolean;
  isLoadingDepts: boolean;
  onAddDeptGrant: (deptId: string) => Promise<void>;
}

export function DepartmentGrantTab({
  departments,
  grants,
  isLoading,
  isLoadingDepts,
  onAddDeptGrant,
}: DepartmentGrantTabProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  useEffect(() => {
    if (departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0].id);
    }
  }, [departments, selectedDeptId]);

  const handleAdd = async () => {
    if (!selectedDeptId) {
      notify.error('لطفاً یک واحد سازمانی انتخاب کنید.');
      return;
    }
    await onAddDeptGrant(selectedDeptId);
  };

  return (
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
          onClick={handleAdd}
          className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
          <span>اعطای دسترسی به کل واحد</span>
        </button>
      </div>
    </div>
  );
}
