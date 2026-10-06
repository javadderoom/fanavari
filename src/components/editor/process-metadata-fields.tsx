'use client';

import React, { useState } from 'react';
import { Laptop, Building2, FolderTree, Tag } from 'lucide-react';
import { ProcessScopeEntity, ProcessCategoryEntity } from '@/types/process';
import { notify } from '@/lib/notify';
import { AppUser } from '@/components/user-session-provider';

interface ProcessMetadataFieldsProps {
  currentUser: AppUser;
  targetSystem: string;
  setTargetSystem: (val: string) => void;
  targetUrl: string;
  setTargetUrl: (val: string) => void;
  systemsList: { name: string; slug: string; category?: string; websiteUrl?: string }[];
  setSystemsList: React.Dispatch<React.SetStateAction<{ name: string; slug: string; category?: string; websiteUrl?: string }[]>>;
  departmentName: string;
  setDepartmentName: (val: string) => void;
  departmentsList: { id: string; name: string; slug: string }[];
  setDepartmentsList: React.Dispatch<React.SetStateAction<{ id: string; name: string; slug: string }[]>>;
  scope: string;
  setScope: (val: string) => void;
  scopesList: ProcessScopeEntity[];
  setScopesList: React.Dispatch<React.SetStateAction<ProcessScopeEntity[]>>;
  category: string;
  setCategory: (val: string) => void;
  categoriesList: ProcessCategoryEntity[];
  setCategoriesList: React.Dispatch<React.SetStateAction<ProcessCategoryEntity[]>>;
}

export function ProcessMetadataFields({
  currentUser,
  targetSystem,
  setTargetSystem,
  targetUrl,
  setTargetUrl,
  systemsList,
  setSystemsList,
  departmentName,
  setDepartmentName,
  departmentsList,
  setDepartmentsList,
  scope,
  setScope,
  scopesList,
  setScopesList,
  category,
  setCategory,
  categoriesList,
  setCategoriesList,
}: ProcessMetadataFieldsProps) {
  // Quick creation states for system
  const [isQuickSystemOpen, setIsQuickSystemOpen] = useState(false);
  const [quickSystemName, setQuickSystemName] = useState('');
  const [quickSystemCategory] = useState<'web' | 'software' | 'portal' | 'erp' | 'devtools'>('portal');
  const [quickSystemUrl, setQuickSystemUrl] = useState('');
  const [isSavingQuickSystem, setIsSavingQuickSystem] = useState(false);

  // Quick creation states for department
  const [isQuickDeptOpen, setIsQuickDeptOpen] = useState(false);
  const [quickDeptName, setQuickDeptName] = useState('');
  const [isSavingQuickDept, setIsSavingQuickDept] = useState(false);

  // Quick creation states for scope
  const [isQuickScopeOpen, setIsQuickScopeOpen] = useState(false);
  const [quickScopeName, setQuickScopeName] = useState('');
  const [quickScopeKey, setQuickScopeKey] = useState('');
  const [quickScopeDesc, setQuickScopeDesc] = useState('');
  const [isSavingQuickScope, setIsSavingQuickScope] = useState(false);

  // Quick creation states for category
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatKey, setQuickCatKey] = useState('');
  const [quickCatScopeId] = useState<string>('current');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);

  // Quick Save Handlers
  const handleQuickSaveSystem = async () => {
    if (!quickSystemName.trim()) {
      notify.error('نام نرم‌افزار یا سامانه الزامی است.');
      return;
    }

    setIsSavingQuickSystem(true);
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickSystemName.trim(),
          category: quickSystemCategory,
          websiteUrl: quickSystemUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت سامانه');

      setSystemsList((prev) => [data, ...prev]);
      setTargetSystem(data.name);
      if (data.websiteUrl) setTargetUrl(data.websiteUrl);
      setIsQuickSystemOpen(false);
      setQuickSystemName('');
      setQuickSystemUrl('');
      notify.success(`سامانه «${data.name}» با موفقیت ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت سامانه');
    } finally {
      setIsSavingQuickSystem(false);
    }
  };

  const handleQuickSaveDept = async () => {
    if (!quickDeptName.trim()) {
      notify.error('نام سازمان الزامی است.');
      return;
    }

    setIsSavingQuickDept(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({ name: quickDeptName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت سازمان');

      setDepartmentsList((prev) => [data, ...prev]);
      setDepartmentName(data.name);
      setIsQuickDeptOpen(false);
      setQuickDeptName('');
      notify.success(`سازمان «${data.name}» با موفقیت ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت سازمان');
    } finally {
      setIsSavingQuickDept(false);
    }
  };

  const handleQuickSaveScope = async () => {
    if (!quickScopeName.trim()) {
      notify.error('نام حوزه الزامی است.');
      return;
    }
    setIsSavingQuickScope(true);
    try {
      const res = await fetch('/api/scopes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickScopeName.trim(),
          key: quickScopeKey.trim() || undefined,
          description: quickScopeDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت حوزه');
      setScopesList((prev) => [...prev, data]);
      setScope(data.key);
      setIsQuickScopeOpen(false);
      setQuickScopeName('');
      setQuickScopeKey('');
      setQuickScopeDesc('');
      notify.success(`حوزه «${data.name}» ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت حوزه');
    } finally {
      setIsSavingQuickScope(false);
    }
  };

  const handleQuickSaveCategory = async () => {
    if (!quickCatName.trim()) {
      notify.error('نام دسته‌بندی موضوعی الزامی است.');
      return;
    }
    setIsSavingQuickCat(true);
    try {
      let targetScopeId: string | null = null;
      if (quickCatScopeId === 'current') {
        const found = scopesList.find((s) => s.key === scope);
        targetScopeId = found?.id || null;
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify({
          name: quickCatName.trim(),
          key: quickCatKey.trim() || undefined,
          scopeId: targetScopeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت دسته‌بندی');
      setCategoriesList((prev) => [...prev, data]);
      setCategory(data.key);
      setIsQuickCatOpen(false);
      setQuickCatName('');
      setQuickCatKey('');
      notify.success(`دسته‌بندی موضوعی «${data.name}» ثبت و انتخاب شد.`);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ثبت دسته‌بندی');
    } finally {
      setIsSavingQuickCat(false);
    }
  };

  return (
    <>
      {/* Target System & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Target System */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <Laptop className="w-3.5 h-3.5 text-purple-600" />
              <span>سامانه یا نرم‌افزار هدف</span>
            </label>
            <button
              type="button"
              onClick={() => setIsQuickSystemOpen((prev) => !prev)}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              {isQuickSystemOpen ? 'بستن' : '+ سامانه جدید'}
            </button>
          </div>

          {isQuickSystemOpen && (
            <div className="mb-2 p-3 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-2 animate-in fade-in">
              <input
                type="text"
                value={quickSystemName}
                onChange={(e) => setQuickSystemName(e.target.value)}
                placeholder="نام سامانه (مثلاً: سیدا)..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQuickSystemOpen(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isSavingQuickSystem || !quickSystemName.trim()}
                  onClick={handleQuickSaveSystem}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-purple-600 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuickSystem ? 'ذخیره...' : 'ثبت فوری'}
                </button>
              </div>
            </div>
          )}

          <select
            value={systemsList.some((s) => s.name === targetSystem) ? targetSystem : (targetSystem ? 'custom' : '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__NEW__') {
                setIsQuickSystemOpen(true);
              } else if (val === 'custom') {
                setTargetSystem('');
              } else {
                setTargetSystem(val);
                const found = systemsList.find((s) => s.name === val);
                if (found?.websiteUrl) setTargetUrl(found.websiteUrl);
              }
            }}
            className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="">-- انتخاب نرم‌افزار یا سامانه --</option>
            {systemsList.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name} ({s.category === 'software' ? 'نرم‌افزار' : s.category === 'devtools' ? 'ابزار' : s.category === 'erp' ? 'ERP سازمانی' : 'سامانه وب'})
              </option>
            ))}
            <option value="__NEW__">+ تعریف سامانه جدید در دیتابیس...</option>
            <option value="custom">سایر / ورود دستی...</option>
          </select>

          {(!systemsList.some((s) => s.name === targetSystem) || targetSystem === '') && (
            <input
              type="text"
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
              placeholder="نام سامانه را بنویسید..."
              className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          )}
        </div>

        {/* Department */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>سازمان یا دپارتمان متولی</span>
            </label>
            <button
              type="button"
              onClick={() => setIsQuickDeptOpen((prev) => !prev)}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              {isQuickDeptOpen ? 'بستن' : '+ سازمان جدید'}
            </button>
          </div>

          {isQuickDeptOpen && (
            <div className="mb-2 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
              <input
                type="text"
                value={quickDeptName}
                onChange={(e) => setQuickDeptName(e.target.value)}
                placeholder="نام سازمان (مثلاً: وزارت جهاد کشاورزی)..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQuickDeptOpen(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isSavingQuickDept || !quickDeptName.trim()}
                  onClick={handleQuickSaveDept}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuickDept ? 'ذخیره...' : 'ثبت فوری'}
                </button>
              </div>
            </div>
          )}

          <select
            value={departmentsList.some((d) => d.name === departmentName) ? departmentName : (departmentName ? 'custom' : '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__NEW__') {
                setIsQuickDeptOpen(true);
              } else if (val === 'custom') {
                setDepartmentName('');
              } else {
                setDepartmentName(val);
              }
            }}
            className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="">-- انتخاب سازمان متولی --</option>
            {departmentsList.map((d) => (
              <option key={d.slug} value={d.name}>
                {d.name}
              </option>
            ))}
            <option value="__NEW__">+ تعریف سازمان جدید در دیتابیس...</option>
            <option value="custom">سایر / ورود دستی...</option>
          </select>

          {(!departmentsList.some((d) => d.name === departmentName) || departmentName === '') && (
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="نام دقیق سازمان را بنویسید..."
              className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          )}
        </div>
      </div>

      {/* Scope & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scope */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <FolderTree className="w-3.5 h-3.5 text-blue-600" />
              <span>حوزه فرایند</span>
            </label>
            <button
              type="button"
              onClick={() => setIsQuickScopeOpen((prev) => !prev)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {isQuickScopeOpen ? 'بستن' : '+ حوزه جدید'}
            </button>
          </div>

          {isQuickScopeOpen && (
            <div className="mb-2 p-3 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 space-y-2 animate-in fade-in">
              <input
                type="text"
                value={quickScopeName}
                onChange={(e) => setQuickScopeName(e.target.value)}
                placeholder="عنوان حوزه (مثلاً: اداری و مالی)..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQuickScopeOpen(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isSavingQuickScope || !quickScopeName.trim()}
                  onClick={handleQuickSaveScope}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-blue-600 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuickScope ? 'ذخیره...' : 'ثبت فوری'}
                </button>
              </div>
            </div>
          )}

          <select
            value={scopesList.some((s) => s.key === scope) ? scope : (scope ? 'custom' : '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__NEW__') {
                setIsQuickScopeOpen(true);
              } else if (val === 'custom') {
                setScope('');
              } else {
                setScope(val);
              }
            }}
            className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="">-- انتخاب حوزه --</option>
            {scopesList.map((s) => (
              <option key={s.id} value={s.key}>
                {s.name}
              </option>
            ))}
            <option value="__NEW__">+ تعریف حوزه جدید در دیتابیس...</option>
            <option value="custom">سایر / ورود دستی...</option>
          </select>

          {(!scopesList.some((s) => s.key === scope) || scope === '') && (
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="شناسه حوزه را بنویسید..."
              className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          )}
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>دسته‌بندی موضوعی</span>
            </label>
            <button
              type="button"
              onClick={() => setIsQuickCatOpen((prev) => !prev)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              {isQuickCatOpen ? 'بستن' : '+ دسته‌بندی جدید'}
            </button>
          </div>

          {isQuickCatOpen && (
            <div className="mb-2 p-3 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2 animate-in fade-in">
              <input
                type="text"
                value={quickCatName}
                onChange={(e) => setQuickCatName(e.target.value)}
                placeholder="عنوان دسته‌بندی (مثلاً: بازنشستگی)..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQuickCatOpen(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-500 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isSavingQuickCat || !quickCatName.trim()}
                  onClick={handleQuickSaveCategory}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuickCat ? 'ذخیره...' : 'ثبت فوری'}
                </button>
              </div>
            </div>
          )}

          <select
            value={categoriesList.some((c) => c.key === category) ? category : (category ? 'custom' : '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__NEW__') {
                setIsQuickCatOpen(true);
              } else if (val === 'custom') {
                setCategory('');
              } else {
                setCategory(val);
              }
            }}
            className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none cursor-pointer"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="">-- انتخاب دسته‌بندی موضوعی --</option>
            {categoriesList.filter((c) => !c.isGlobal).length > 0 && (
              <optgroup label="دسته‌بندی‌های اختصاصی این حوزه">
                {categoriesList.filter((c) => !c.isGlobal).map((c) => (
                  <option key={c.id} value={c.key}>{c.name}</option>
                ))}
              </optgroup>
            )}
            {categoriesList.filter((c) => c.isGlobal).length > 0 && (
              <optgroup label="دسته‌بندی‌های عمومی و مشترک">
                {categoriesList.filter((c) => c.isGlobal).map((c) => (
                  <option key={c.id} value={c.key}>{c.name} (عمومی)</option>
                ))}
              </optgroup>
            )}
            <option value="__NEW__">+ تعریف دسته‌بندی جدید در دیتابیس...</option>
            <option value="custom">سایر / ورود دستی...</option>
          </select>

          {(!categoriesList.some((c) => c.key === category) || category === '') && (
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="شناسه یا عنوان دسته‌بندی را بنویسید..."
              className="w-full mt-1.5 p-2 rounded-xl border text-xs font-medium outline-none"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          )}
        </div>
      </div>
    </>
  );
}
