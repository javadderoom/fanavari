'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ProcessScopeEntity, 
  ProcessCategoryEntity 
} from '@/types/process';
import { useUserSession } from './user-session-provider';
import { Permissions } from '@/lib/permissions';
import { notify } from '@/lib/notify';
import { 
  FolderTree, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Layers, 
  Globe, 
  Laptop, 
  Building2, 
  Loader2, 
  X, 
  Save, 
  Sparkles, 
  FolderPlus,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { formatToSlug } from '@/lib/slug-utils';

export function ScopesCategoriesManagement() {
  const { currentUser, can, isSuperAdmin } = useUserSession();
  const canManage = can(Permissions.MANAGE_CATEGORIES) || can(Permissions.CREATE_PROCESSES) || isSuperAdmin;

  const [scopes, setScopes] = useState<ProcessScopeEntity[]>([]);
  const [categories, setCategories] = useState<ProcessCategoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Scope Modal State
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [scopeToEdit, setScopeToEdit] = useState<ProcessScopeEntity | null>(null);
  const [scopeName, setScopeName] = useState('');
  const [scopeKey, setScopeKey] = useState('');
  const [scopeDesc, setScopeDesc] = useState('');
  const [isSavingScope, setIsSavingScope] = useState(false);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<ProcessCategoryEntity | null>(null);
  const [catName, setCatName] = useState('');
  const [catKey, setCatKey] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catScopeId, setCatScopeId] = useState<string>('all'); // 'all' = null (Global)
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Fetch all scopes and categories from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scopesRes, catsRes] = await Promise.all([
        fetch('/api/scopes').then((r) => r.json()),
        fetch('/api/categories?counts=true').then((r) => r.json()),
      ]);

      if (Array.isArray(scopesRes)) setScopes(scopesRes);
      if (Array.isArray(catsRes)) setCategories(catsRes);
    } catch (err: any) {
      console.error('Error fetching scopes & categories:', err);
      notify.error('خطا در دریافت اطلاعات حوزه‌ها و دسته‌بندی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered scopes & categories
  const filteredScopes = useMemo(() => {
    if (!searchQuery.trim()) return scopes;
    const q = searchQuery.toLowerCase().trim();
    return scopes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
    );
  }, [scopes, searchQuery]);

  const globalCategories = useMemo(() => {
    const globals = categories.filter((c) => c.isGlobal || !c.scopeId);
    if (!searchQuery.trim()) return globals;
    const q = searchQuery.toLowerCase().trim();
    return globals.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // Scope Handlers
  const handleOpenCreateScope = () => {
    setScopeToEdit(null);
    setScopeName('');
    setScopeKey('');
    setScopeDesc('');
    setIsScopeModalOpen(true);
  };

  const handleOpenEditScope = (s: ProcessScopeEntity) => {
    setScopeToEdit(s);
    setScopeName(s.name);
    setScopeKey(s.key);
    setScopeDesc(s.description || '');
    setIsScopeModalOpen(true);
  };

  const handleSaveScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeName.trim()) {
      notify.error('نام حوزه الزامی است.');
      return;
    }

    setIsSavingScope(true);
    try {
      const url = '/api/scopes';
      const method = scopeToEdit ? 'PUT' : 'POST';
      const body = {
        id: scopeToEdit?.id,
        name: scopeName.trim(),
        key: scopeKey.trim() || undefined,
        description: scopeDesc.trim() || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت حوزه');

      notify.success(
        scopeToEdit ? `حوزه «${data.name}» با موفقیت ویرایش شد.` : `حوزه «${data.name}» با موفقیت ایجاد شد.`
      );
      setIsScopeModalOpen(false);
      fetchData();
    } catch (err: any) {
      notify.error(err.message || 'خطا در ذخیره‌سازی حوزه');
    } finally {
      setIsSavingScope(false);
    }
  };

  const handleDeleteScope = async (s: ProcessScopeEntity) => {
    const confirmed = await notify.confirm({
      title: 'حذف حوزه و ماهیت فرایند',
      message: `آیا از حذف حوزه «${s.name}» اطمینان دارید؟ تمامی دسته‌بندی‌های اختصاصی این حوزه نیز حذف خواهند شد. فرایندهای مرتبط با این حوزه دسته‌بندی خود را حفظ می‌کنند.`,
      confirmText: 'بله، حذف شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/scopes?id=${s.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در حذف حوزه');

      notify.success(data.message || 'حوزه با موفقیت حذف شد.');
      fetchData();
    } catch (err: any) {
      notify.error(err.message || 'خطا در حذف حوزه');
    }
  };

  // Category Handlers
  const handleOpenCreateCategory = (preselectedScopeId?: string) => {
    setCatToEdit(null);
    setCatName('');
    setCatKey('');
    setCatDesc('');
    setCatScopeId(preselectedScopeId || 'all');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (c: ProcessCategoryEntity) => {
    setCatToEdit(c);
    setCatName(c.name);
    setCatKey(c.key);
    setCatDesc(c.description || '');
    setCatScopeId(c.scopeId || 'all');
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      notify.error('نام دسته‌بندی الزامی است.');
      return;
    }

    setIsSavingCat(true);
    try {
      const url = '/api/categories';
      const method = catToEdit ? 'PUT' : 'POST';
      const body = {
        id: catToEdit?.id,
        name: catName.trim(),
        key: catKey.trim() || undefined,
        description: catDesc.trim() || undefined,
        scopeId: catScopeId === 'all' ? null : catScopeId,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت دسته‌بندی');

      notify.success(
        catToEdit
          ? `دسته‌بندی «${data.name}» با موفقیت ویرایش شد.`
          : `دسته‌بندی «${data.name}» با موفقیت ایجاد شد.`
      );
      setIsCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      notify.error(err.message || 'خطا در ذخیره‌سازی دسته‌بندی');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async (c: ProcessCategoryEntity) => {
    const confirmed = await notify.confirm({
      title: 'حذف دسته‌بندی موضوعی',
      message: `آیا از حذف دسته‌بندی «${c.name}» اطمینان دارید؟`,
      confirmText: 'بله، حذف شود',
      cancelText: 'انصراف',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories?id=${c.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-permissions': String(currentUser.permissions),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در حذف دسته‌بندی');

      notify.success(data.message || 'دسته‌بندی با موفقیت حذف شد.');
      fetchData();
    } catch (err: any) {
      notify.error(err.message || 'خطا در حذف دسته‌بندی');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
            مدیریت حوزه‌ها و دسته‌بندی‌های موضوعی فرایندها
          </h2>
          <p className="text-xs text-slate-500">
            تعریف و طبقه‌بندی ساختاری ماهیت فرایندها، دسته‌بندی‌های موضوعی زیرمجموعه و دسته‌بندی‌های عمومی (مشترک در همه حوزه‌ها)
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCreateCategory('all')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>دسته‌بندی جدید</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateScope}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs transition-all hover:scale-105"
            >
              <FolderPlus className="w-4 h-4" />
              <span>ایجاد حوزه جدید</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در عنوان یا شناسه حوزه و دسته‌بندی..."
          className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Global / Public Categories Card (Applies to ALL Scopes) */}
      <div 
        className="rounded-3xl p-5 border glass-panel space-y-4"
        style={{
          borderColor: 'rgba(99, 102, 241, 0.3)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                  دسته‌بندی‌های عمومی (مشترک در همه حوزه‌ها)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  قابل انتخاب در تمامی حوزه‌های فرایند
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                این دسته‌بندی‌ها به حوزه خاصی محدود نیستند و در فرم تعریف تمام فرایندها نمایش داده می‌شوند.
              </p>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => handleOpenCreateCategory('all')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن دسته‌بندی عمومی</span>
            </button>
          )}
        </div>

        {/* Global Categories Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {globalCategories.length === 0 ? (
            <span className="text-xs text-slate-400 py-2">هیچ دسته‌بندی عمومی تعریف نشده است.</span>
          ) : (
            globalCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-slate-900/70 border-indigo-200/60 dark:border-indigo-900/60 shadow-xs group transition-all"
              >
                <Tag className="w-3 h-3 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  {cat.key}
                </span>
                {cat.processCount !== undefined && cat.processCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <span dir="ltr">{cat.processCount}</span>
                  </span>
                )}
                {canManage && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="ویرایش"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scopes and their Specific Categories */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">در حال بارگذاری حوزه‌ها و دسته‌بندی‌ها...</span>
        </div>
      ) : filteredScopes.length === 0 ? (
        <div className="rounded-3xl p-12 text-center border glass-panel text-slate-500">
          حوزه‌ای با این مشخصات یافت نشد.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScopes.map((scope) => {
            const scopeCats = categories.filter((c) => c.scopeId === scope.id);

            return (
              <div
                key={scope.id}
                className="rounded-3xl p-5 border glass-panel space-y-4 transition-all hover:shadow-sm"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-glass-card)',
                }}
              >
                {/* Scope Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                          {scope.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {scope.key}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          ({scope.processCount || 0} فرایند متصل)
                        </span>
                      </div>
                      {scope.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{scope.description}</p>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateCategory(scope.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن دسته‌بندی موضوعی</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditScope(scope)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="ویرایش حوزه"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteScope(scope)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="حذف حوزه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Specific Categories for this Scope */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>دسته‌بندی‌های موضوعی اختصاصی این حوزه:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {scopeCats.length === 0 ? (
                      <span className="text-xs text-slate-400 py-1">
                        هنوز دسته‌بندی اختصاصی برای این حوزه تعریف نشده است.
                      </span>
                    ) : (
                      scopeCats.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-xs transition-all hover:border-blue-400"
                        >
                          <Tag className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            {cat.key}
                          </span>
                          {cat.processCount !== undefined && cat.processCount > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                              <span dir="ltr">{cat.processCount}</span>
                            </span>
                          )}
                          {canManage && (
                            <div className="flex items-center gap-1 mr-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="ویرایش"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scope Editor Modal */}
      {isScopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border glass-panel-strong shadow-2xl space-y-4"
            style={{ background: 'var(--bg-glass-strong)', borderColor: 'var(--border-glass)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  {scopeToEdit ? 'ویرایش حوزه و ماهیت فرایند' : 'تعریف حوزه و ماهیت جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScopeModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScope} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  عنوان حوزه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={scopeName}
                  onChange={(e) => {
                    setScopeName(e.target.value);
                    if (!scopeToEdit && !scopeKey) {
                      setScopeKey(formatToSlug(e.target.value));
                    }
                  }}
                  placeholder="مثال: سازمانی و مراجع دولتی"
                  className="w-full p-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  شناسه لاتین / Key
                </label>
                <input
                  type="text"
                  value={scopeKey}
                  onChange={(e) => setScopeKey(formatToSlug(e.target.value))}
                  placeholder="مثال: organization"
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  شرح و توضیحات حوزه
                </label>
                <textarea
                  rows={3}
                  value={scopeDesc}
                  onChange={(e) => setScopeDesc(e.target.value)}
                  placeholder="توضیحات کوتاه درباره فرایندهایی که در این حوزه قرار می‌گیرند..."
                  className="w-full p-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScopeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingScope || !scopeName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingScope ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>ذخیره حوزه</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Editor Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-3xl p-6 border glass-panel-strong shadow-2xl space-y-4"
            style={{ background: 'var(--bg-glass-strong)', borderColor: 'var(--border-glass)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  {catToEdit ? 'ویرایش دسته‌بندی موضوعی' : 'تعریف دسته‌بندی موضوعی جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  عنوان دسته‌بندی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!catToEdit && !catKey) {
                      setCatKey(formatToSlug(e.target.value));
                    }
                  }}
                  placeholder="مثال: منابع انسانی و کارگزینی"
                  className="w-full p-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  شناسه لاتین / Key
                </label>
                <input
                  type="text"
                  value={catKey}
                  onChange={(e) => setCatKey(formatToSlug(e.target.value))}
                  placeholder="مثال: hr"
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border text-xs font-mono outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  حوزه تعلق دسته‌بندی
                </label>
                <select
                  value={catScopeId}
                  onChange={(e) => setCatScopeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <option value="all">
                    🌐 عمومی و مشترک در همه حوزه‌ها (همه حوزه‌ها دسترسی دارند)
                  </option>
                  {scopes.map((s) => (
                    <option key={s.id} value={s.id}>
                      اختصاصی برای حوزه: {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  اگر روی «عمومی و مشترک» تنظیم شود، در فرم فرایند تمامی حوزه‌ها قابل انتخاب خواهد بود.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  شرح و یادداشت دسته‌بندی
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="توضیح کوتاه..."
                  className="w-full p-2.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingCat || !catName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingCat ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>ذخیره دسته‌بندی</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
