'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Sparkles, 
  SlidersHorizontal, 
  RefreshCw, 
  Layers, 
  Table2, 
  Binary, 
  Building2, 
  Tag, 
  KeyRound, 
  X,
  Check
} from 'lucide-react';
import { 
  SimulatedPersona, 
  SIMULATION_PERSONAS, 
  SimulatorTab 
} from './types';
import { DeptItem } from '@/components/access/types';
import { Permissions, ROLE_PRESETS } from '@/lib/permissions';

interface PermissionsSimulatorHeaderProps {
  activeTab: SimulatorTab;
  onTabChange: (tab: SimulatorTab) => void;
  selectedPersona: SimulatedPersona;
  onSelectPersona: (persona: SimulatedPersona) => void;
  departments: DeptItem[];
  stats: {
    totalProcesses: number;
    totalPosts: number;
    accessibleProcesses: number;
    accessiblePosts: number;
  };
}

export function PermissionsSimulatorHeader({
  activeTab,
  onTabChange,
  selectedPersona,
  onSelectPersona,
  departments,
  stats,
}: PermissionsSimulatorHeaderProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customRole, setCustomRole] = useState(selectedPersona.roleName);
  const [customDeptId, setCustomDeptId] = useState(selectedPersona.departmentId || '');
  const [customToken, setCustomToken] = useState(selectedPersona.claimToken || '');
  const [customName, setCustomName] = useState(selectedPersona.name);

  const isSuperAdmin = (selectedPersona.permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR;

  const totalItems = stats.totalProcesses + stats.totalPosts;
  const accessibleItems = stats.accessibleProcesses + stats.accessiblePosts;
  const accessPercentage = totalItems > 0 ? Math.round((accessibleItems / totalItems) * 100) : 0;

  const handleApplyCustomPersona = () => {
    const matchedDept = departments.find((d) => d.id === customDeptId);
    const newPersona: SimulatedPersona = {
      id: `usr-custom-${Date.now()}`,
      name: customName.trim() || 'پرسونای سفارشی آزمایشی',
      roleName: customRole.trim() || 'کاربر عمومی',
      departmentId: customDeptId || null,
      departmentName: matchedDept ? matchedDept.name : 'سفارشی',
      email: 'custom.tester@school.local',
      permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
      claimToken: customToken.trim() || undefined,
      isCustom: true,
    };
    onSelectPersona(newPersona);
    setIsCustomModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Title & Tab Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                شبیه‌ساز و ماتریس دسترسی‌های سازمانی
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                تست بلادرنگ سیاست Zero-Leak، شبیه‌سازی هویت پرسنل و بازرسی جامع ماتریس مجوزها
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 rounded-2xl border bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => onTabChange('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>شبیه‌ساز زنده هویت</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>ماتریس چندبُعدی مجوزها</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('bitfield')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bitfield'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>بازرس پرچم‌های بیتی</span>
          </button>
        </div>
      </div>

      {/* Active Persona Banner & Quick Selector */}
      <div 
        className="glass-panel-strong rounded-3xl p-5 border shadow-sm relative overflow-hidden"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Persona Info */}
          <div className="flex items-center gap-3.5">
            <div 
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md relative"
              style={{
                background: isSuperAdmin
                  ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                  : selectedPersona.isCustom
                  ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              }}
            >
              {isSuperAdmin ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <User className="w-7 h-7" />
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">
                  هویت شبیه‌سازی‌شده فعال:
                </span>
                <span className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                  {selectedPersona.name}
                </span>
                <span 
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: isSuperAdmin ? 'var(--badge-rose-bg)' : 'var(--accent-soft)',
                    color: isSuperAdmin ? 'var(--badge-rose-text)' : 'var(--accent-primary)',
                  }}
                >
                  {selectedPersona.roleName}
                </span>
                {selectedPersona.departmentName && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    🏢 {selectedPersona.departmentName}
                  </span>
                )}
                {selectedPersona.claimToken && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-bold" dir="ltr">
                    🔑 Token: {selectedPersona.claimToken}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="font-mono" dir="ltr">{selectedPersona.email}</span>
                <span>•</span>
                <span>شناسه کاربری: <span className="font-mono" dir="ltr">{selectedPersona.id}</span></span>
                <span>•</span>
                <span className="font-mono text-slate-600 dark:text-slate-300" dir="ltr">
                  Mask: 0x{selectedPersona.permissions.toString(16).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge for this Persona */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 px-4 rounded-2xl border bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold">پوشش کل کاتالوگ</div>
                <div className="font-black text-sm text-emerald-600 dark:text-emerald-400" dir="ltr">
                  {accessibleItems} / {totalItems} ({accessPercentage}%)
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                ✓
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCustomRole(selectedPersona.roleName);
                setCustomDeptId(selectedPersona.departmentId || '');
                setCustomToken(selectedPersona.claimToken || '');
                setCustomName(selectedPersona.name);
                setIsCustomModalOpen(true);
              }}
              className="p-2.5 px-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>تنظیم هویت دلخواه</span>
            </button>
          </div>
        </div>

        {/* Preset Persona Quick Buttons */}
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs text-slate-400 font-bold ml-1">انتخاب سریع پرسونای سازمانی:</span>
          {SIMULATION_PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id && !selectedPersona.isCustom;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => onSelectPersona(persona)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{persona.roleName}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Persona Tuning Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative bg-[var(--bg-card)]"
            style={{ borderColor: 'var(--border-glass)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                    شخصی‌سازی پرسونای تست دسترسی
                  </h3>
                  <p className="text-xs text-slate-400">
                    تنظیم ترکیبی سمت، دپارتمان و توکن برای بررسی رفتارهای خاص ACL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  نام فرضی کاربر آزمایشی:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثلاً: محمد کریمی (پرسنل آزمایشی)"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  سمت یا نقش سازمانی:
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="مثلاً: مدیر مدرسه، حسابدار، کارشناس حراست، پشتیبان"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  دپارتمان یا سازمان متبوع:
                </label>
                <select
                  value={customDeptId}
                  onChange={(e) => setCustomDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- بدون دپارتمان / کاربر عمومی یا مستقل --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  توکن لینک اشتراک‌گذاری هوشمند (اختیاری جهت تست Claim Token):
                </label>
                <input
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="مثلاً: clm-8f92-xxxx"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  اگر سندی با این توکن اختصاص یافته باشد، سیستم بلافاصله دسترسی را تایید می‌کند.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleApplyCustomPersona}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>اعمال و شبیه‌سازی هویت</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
