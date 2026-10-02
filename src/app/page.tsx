'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { OmniSearch } from '@/components/omni-search';
import { ProcessCard } from '@/components/process-card';
import { ProcessDetailModal } from '@/components/process-detail-modal';
import { InteractiveFlowSimulator } from '@/components/interactive-flow-simulator';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { MOCK_PROCESSES, CATEGORIES } from '@/data/mock-processes';
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
  Palette
} from 'lucide-react';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectProcess = (process: Process, initialStepIndex?: number) => {
    setSelectedProcess(process);
    setSelectedStepIndex(initialStepIndex || 0);
  };

  const filteredProcesses = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_PROCESSES;
    if (selectedCategory === 'software') return MOCK_PROCESSES.filter(p => p.scope === 'software');
    return MOCK_PROCESSES.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

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
      <Navbar onSearchClick={handleFocusSearch} />

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
                <span>سامانه راهنمای تعاملی و بصری فرایندهای سازمانی</span>
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
                processes={MOCK_PROCESSES} 
                onSelectProcess={handleSelectProcess} 
                inputRef={searchInputRef}
              />
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 block mb-0.5">
                  ۸
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  فرایند استاندارد تدوین‌شده
                </span>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 block mb-0.5">
                  ۲۶
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  گام عملیاتی با مسیر منوها
                </span>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 block mb-0.5">
                  ۱۳
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
                  بصری، تعاملی و قابل جستجو
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
                کاتالوگ فرایندهای سازمانی
              </h2>
            </div>

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
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Process Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcesses.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                onSelect={(p) => handleSelectProcess(p)}
              />
            ))}
          </div>
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
