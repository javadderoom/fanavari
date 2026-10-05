'use client';

import React from 'react';
import { ScopesCategoriesManagement } from '@/components/scopes-categories-management';

export default function DashboardScopesCategoriesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت حوزه‌ها و دسته‌بندی‌های موضوعی
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تعریف حوزه‌های کلان فرایندی، طبقه‌بندی سلسله‌مراتبی موضوعی و دسته‌بندی‌های عمومی مشترک
          </p>
        </div>
      </div>

      <ScopesCategoriesManagement />
    </div>
  );
}
