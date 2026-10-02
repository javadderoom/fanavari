'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { OmniSearch } from '@/components/omni-search';
import { ProcessCard } from '@/components/process-card';
import { ProcessDetailModal } from '@/components/process-detail-modal';
import { ProcessEditorModal } from '@/components/process-editor-modal';
import { InteractiveFlowSimulator } from '@/components/interactive-flow-simulator';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { CATEGORIES } from '@/data/mock-processes';
import { Process } from '@/types/process';
import { 
  Sparkles, 
  Workflow, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Users, 
  Coins, 
  Server, 
  Headphones, 
  FileText,
  Laptop,
  Palette,
  Plus,
  Loader2
} from 'lucide-react';

export default function HomePage() {
  const { can, isSuperAdmin, currentUser } = useUserSession();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  
  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Process | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load processes live from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/processes')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setProcesses(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch processes from database API:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProcess = (process: Process, initialStepIndex?: number) => {
    setSelectedProcess(process);
    setSelectedStepIndex(initialStepIndex || 0);
  };

  const handleOpenCreateModal = () => {
    setProcessToEdit(null);
    setIsEditorOpen(true);
  };

  const handleSaveProcess = async (savedProcess: Process) => {
    setProcesses((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === savedProcess.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = savedProcess;
        return next;
      }
      return [savedProcess, ...prev];
    });

    // Also persist to PostgreSQL via API
    try {
      await fetch('/api/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-permissions': String(currentUser.permissions),
        },
        body: JSON.stringify(savedProcess),
      });
    } catch (e) {
      console.warn('Database sync notification:', e);
    }
  };

  const filteredProcesses = useMemo(() => {
    if (selectedCategory === 'all') return processes;
    if (selectedCategory === 'software') return processes.filter(p => p.scope === 'software');
    return processes.filter(p => p.category === selectedCategory);
  }, [processes, selectedCategory]);

  const totalSteps = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.steps?.length || p.totalSteps || 0), 0);
  }, [processes]);

  const totalErrors = useMemo(() => {
    return processes.reduce(
      (acc, p) => acc + (p.steps?.reduce((sAcc, s) => sAcc + (s.errorGuides?.length || 0), 0) || 0),
      0
    );
  }, [processes]);

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'Palette': return <Palette className="w-4 h-4 text-rose-500" />;
      case 'Users': return <Users className="w-4 h-4 text-blue-500" />;
      case 'Coins': return <Coins className="w-4 h-4 text-amber-500" />;
      case 'Server': return <Server className="w-4 h-4 text-indigo-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'Headphones': return <Headphones className="w-4 h-4 text-cyan-500" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      {/* Top Glassmorphic Navigation Bar */}
      <Navbar 
        onSearchClick={handleFocusSearch} 
        onCreateProcessClick={handleOpenCreateModal}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Hero Top Pill */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-transform hover:scale-105"
                style={{
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Workflow className="w-3.5 h-3.5 text-blue-600" />
                <span>سامانه راهنمای تعاملی و بصری فرایندهای سازمانی و نرم‌افزاری</span>
              </div>
            </div>

            {/* Hero Title */}
            <div className="text-center max-w-4xl mx-auto mb-8">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.25] mb-5"
                style={{ color: 'var(--text-primary)' }}
              >
                هر فرایند، یک{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  نقشه راه شفاف
                </span>
                {' '}و بدون سردرگمی
              </h1>
              <p className="text-base sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
                style={{ color: 'var(--text-secondary)' }}
              >
                دیگر نیازی به خواندن دستورالعمل‌های طولانی و پیچیده نیست. تمام مراحل، مسیر منوها، کدهای خطا و ابزارهای موردنیاز را با یک جستجوی هوشمند در دسترس داشته باشید.
              </p>
            </div>

            {/* Omni-Search Box (Google-style, prominent) */}
            <div className="mb-14">
              <OmniSearch 
                processes={processes} 
                onSelectProcess={handleSelectProcess} 
                inputRef={searchInputRef}
              />
            </div>

            {/* Quick Metrics Banner (Calculated Live from Database) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 block mb-0.5">
                  {processes.length}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  فرایند استاندارد در پایگاه داده
                </span>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 block mb-0.5">
                  {totalSteps}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  گام عملیاتی با مسیر منوها
                </span>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 block mb-0.5">
                  {totalErrors}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  راهنمای تخصصی رفع خطا
                </span>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block mb-0.5">
                  ۱۰۰٪
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  داده زنده از سرور مرکزی
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Process Catalog Showcase Section */}
        <section id="processes-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section Header & Category Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                دایرکتوری دستورالعمل‌ها
              </span>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                کاتالوگ فرایندهای سازمانی و سامانه‌ها
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected ? 'shadow-sm scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)'
                      }}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button: Create New Process */}
              {can(Permissions.CREATE_PROCESSES) && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت فرایند جدید</span>
                </button>
              )}
            </div>
          </div>

          {/* Process Cards Grid / Loading / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-3xl p-6 h-64 animate-pulse flex flex-col justify-between"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  <div className="space-y-3">
                    <div className="w-24 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="w-3/4 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="w-full h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="w-1/2 h-4 rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
              <h3 className="text-lg font-bold">هیچ فرایندی در این دسته‌بندی یافت نشد</h3>
              <p className="text-sm text-gray-500 mt-1">فرایندها مستقیماً از پایگاه داده بازیابی می‌شوند.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProcesses.map((process) => (
                <ProcessCard
                  key={process.id}
                  process={process}
                  onSelect={(p) => handleSelectProcess(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Live Interactive Flow Simulator */}
        <InteractiveFlowSimulator />

        {/* Features / Benefits Section */}
        <FeaturesSection />
      </main>

      {/* Process Detail & Flow Navigator Modal */}
      <ProcessDetailModal
        process={selectedProcess}
        initialStepIndex={selectedStepIndex}
        onClose={() => setSelectedProcess(null)}
      />

      {/* Process Creator / Editor Modal */}
      <ProcessEditorModal
        isOpen={isEditorOpen}
        processToEdit={processToEdit}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProcess}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
