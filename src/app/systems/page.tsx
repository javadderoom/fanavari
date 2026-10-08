import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbSystemTools, getDbProcesses } from '@/lib/db-service';
import { 
  Laptop, 
  Layers, 
  ArrowLeft, 
  GitBranch, 
  Table, 
  Calculator, 
  Users, 
  Landmark, 
  Shield, 
  Key, 
  Container,
  Home,
  GraduationCap
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'بانک نرم‌افزارها و سامانه‌ها | سامانه فناوری',
  description: 'دایرکتوری کامل نرم‌افزارهای کاربردی، ابزارهای مهندسی و پرتال‌های دولتی به همراه دستورالعمل‌های گام‌به‌گام',
};

export default async function SystemsPage() {
  const tools = await getDbSystemTools();
  const processes = await getDbProcesses({ redactGrants: true });

  const getToolIcon = (icon: string) => {
    switch (icon) {
      case 'Figma': return <Layers className="w-6 h-6 text-purple-500" />;
      case 'GitBranch': return <GitBranch className="w-6 h-6 text-orange-500" />;
      case 'Table': return <Table className="w-6 h-6 text-emerald-500" />;
      case 'Calculator': return <Calculator className="w-6 h-6 text-blue-500" />;
      case 'Users': return <Users className="w-6 h-6 text-indigo-500" />;
      case 'Landmark': return <Landmark className="w-6 h-6 text-amber-500" />;
      case 'Shield': return <Shield className="w-6 h-6 text-sky-500" />;
      case 'Key': return <Key className="w-6 h-6 text-rose-500" />;
      case 'Container': return <Container className="w-6 h-6 text-cyan-500" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-emerald-600" />;
      default: return <Laptop className="w-6 h-6 text-blue-500" />;
    }
  };

  const softwareTools = tools.filter(t => t.category === 'software' || t.category === 'devtools');
  const portalTools = tools.filter(t => t.category === 'portal' || t.category === 'erp');

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600">نرم‌افزارها و سامانه‌ها</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>دایرکتوری جامع ابزارها و درگاه‌ها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            دستورالعمل‌های کار با نرم‌افزارها و سامانه‌های سازمانی
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            دایرکتوری سامانه‌ها و درگاه‌های سازمانی و دولتی همراه با دستورالعمل‌های رسمی و گام‌به‌گام ثبت‌شده.
          </p>
        </div>

        {/* Empty state if no tools at all */}
        {tools.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl">
            <Laptop className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold">هیچ سامانه‌ای در پایگاه داده ثبت نشده است</h3>
            <p className="text-sm text-gray-500 mt-1">سامانه‌ها مستقیماً از دیتابیس دریافت می‌شوند.</p>
          </div>
        )}

        {/* Section 1: Software & Engineering Tools */}
        {softwareTools.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                  ابزارهای دسکتاپ و ابری
                </span>
                <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  نرم‌افزارهای تخصصی و کاربردی
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-500/10 text-purple-600">
                {softwareTools.length} نرم‌افزار
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {softwareTools.map((tool) => {
                const count = processes.filter(p => p.targetSystemSlug === tool.slug).length;
                return (
                  <Link
                    key={tool.slug}
                    href={`/system/${tool.slug}`}
                    className="glass-card rounded-3xl p-6 flex flex-col justify-between group transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                        >
                          {getToolIcon(tool.icon)}
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
                        >
                          {count} فرایند تدوین‌شده
                        </span>
                      </div>

                      <h3 className="text-lg font-black mb-2 group-hover:text-blue-600 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {tool.name}
                      </h3>

                      <p className="text-xs sm:text-sm font-medium leading-relaxed mb-4"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t text-xs font-bold text-blue-600"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                        <span>مشاهده دستورالعمل‌های این نرم‌افزار</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Portals & Government Systems */}
        {portalTools.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  درگاه‌های ملی و سیستم‌های اداری
                </span>
                <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  سامانه‌ها و پرتال‌های سازمانی و دولتی
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600">
                {portalTools.length} پرتال و سامانه
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portalTools.map((tool) => {
                const count = processes.filter(p => p.targetSystemSlug === tool.slug).length;
                return (
                  <Link
                    key={tool.slug}
                    href={`/system/${tool.slug}`}
                    className="glass-card rounded-3xl p-6 flex flex-col justify-between group transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                        >
                          {getToolIcon(tool.icon)}
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)' }}
                        >
                          {count} فرایند تدوین‌شده
                        </span>
                      </div>

                      <h3 className="text-lg font-black mb-2 group-hover:text-blue-600 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {tool.name}
                      </h3>

                      <p className="text-xs sm:text-sm font-medium leading-relaxed mb-4"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t text-xs font-bold text-blue-600"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                        <span>مشاهده فرایندهای سامانه</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
