'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { OmniSearch } from '@/components/omni-search';
import { ProcessCard } from '@/components/process-card';
import { ProcessDetailModal } from '@/components/process-detail-modal';
import { InteractiveFlowSimulator } from '@/components/interactive-flow-simulator';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { useUserSession } from '@/components/user-session-provider';
import { CATEGORIES } from '@/data/mock-processes';
import { Process, InformationPost } from '@/types/process';
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
  Loader2,
  Building2,
  X,
  Megaphone,
  ArrowLeft
} from 'lucide-react';

function HomePageContent() {
  const { currentUser } = useUserSession();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get('dept');

  const [processes, setProcesses] = useState<Process[]>([]);
  const [announcements, setAnnouncements] = useState<InformationPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load processes and announcements live from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/processes').then((res) => res.json()).catch(() => []),
      fetch('/api/information?limit=5').then((res) => res.json()).catch(() => []),
    ])
      .then(([procData, infoData]) => {
        if (!isMounted) return;
        if (Array.isArray(procData)) setProcesses(procData);
        if (Array.isArray(infoData)) setAnnouncements(infoData);
      })
      .catch((err) => {
        console.error('Failed to fetch data from database API:', err);
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

  const filteredProcesses = useMemo(() => {
    let list = processes;
    if (deptParam) {
      list = list.filter(
        (p) =>
          p.departmentSlug === deptParam ||
          p.tags?.includes(deptParam) ||
          p.departmentName?.toLowerCase().includes(deptParam.toLowerCase())
      );
    }
    if (selectedCategory === 'all') return list;
    if (selectedCategory === 'software') return list.filter((p) => p.scope === 'software');
    return list.filter((p) => p.category === selectedCategory);
  }, [processes, selectedCategory, deptParam]);

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
            <div className="mb-8">
              <OmniSearch 
                processes={processes} 
                onSelectProcess={handleSelectProcess} 
                inputRef={searchInputRef}
              />
            </div>

            {/* Latest Announcement Banner (if any) */}
            {announcements.length > 0 && (
              <div className="mb-10 max-w-4xl mx-auto">
                <div
                  className="glass-card rounded-2xl p-3.5 sm:p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all hover:border-indigo-500/40"
                  style={{
                    borderColor: announcements[0].priority === 'urgent' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.3)',
                    background: announcements[0].priority === 'urgent'
                      ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), var(--bg-surface))'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), var(--bg-surface))',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          {announcements[0].type === 'circular'
                            ? 'بخشنامه جدید'
                            : announcements[0].type === 'guide'
                            ? 'راهنمای سامانه'
                            : 'اطلاعیه رسمی'}
                        </span>
                        {announcements[0].priority === 'urgent' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                            فوری
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                          {'\u200E' + new Date(announcements[0].publishedAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <Link
                        href={`/information/${announcements[0].slug}`}
                        className="text-xs sm:text-sm font-bold truncate block hover:text-indigo-600 transition-colors mt-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {announcements[0].title}
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/information"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 self-end sm:self-center"
                  >
                    <span>مرکز اطلاعات ({announcements.length}+)</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

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
            </div>
          </div>

          {/* Department Filter Banner (if filtering by organization) */}
          {deptParam && (
            <div 
              className="flex items-center justify-between gap-3 mb-6 p-4 rounded-2xl border shadow-xs animate-in fade-in"
              style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  فیلتر فعال: نمایش فرایندهای متصل به شناسه سازمان <span className="text-blue-600 font-mono">"{deptParam}"</span>
                </span>
              </div>
              <Link
                href="/"
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>حذف فیلتر</span>
              </Link>
            </div>
          )}

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

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }} />}>
      <HomePageContent />
    </Suspense>
  );
}
