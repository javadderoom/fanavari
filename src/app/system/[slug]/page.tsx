import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProcessCard } from '@/components/process-card';
import { getDbSystemTools, getDbSystemToolBySlug } from '@/lib/db-service';
import { Home, Laptop, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tools = await getDbSystemTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tool } = await getDbSystemToolBySlug(slug);
  if (!tool) return { title: 'نرم‌افزار یا سامانه یافت نشد | سامانه فناوری' };

  return {
    title: `فرایندهای ${tool.name} | سامانه فناوری`,
    description: tool.description,
  };
}

export default async function SingleSystemPage({ params }: Props) {
  const { slug } = await params;
  const { tool, processes: relatedProcesses } = await getDbSystemToolBySlug(slug);

  if (!tool) {
    notFound();
  }

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
          <Link href="/systems" className="hover:text-blue-600 flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5" />
            <span>نرم‌افزارها و سامانه‌ها</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600">{tool.name}</span>
        </nav>

        {/* System Header Card */}
        <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border shadow-xl mb-10"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 mb-2 inline-block">
                دسته‌بندی: {tool.category === 'software' ? 'نرم‌افزار کاربردی' : tool.category === 'devtools' ? 'ابزار برنامه‌نویسی' : 'سامانه سازمانی'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                {tool.name}
              </h1>
              <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl mt-2" style={{ color: 'var(--text-secondary)' }}>
                {tool.description}
              </p>
            </div>

            {tool.websiteUrl && (
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-center"
                style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
              >
                <span>ورود به سایت رسمی</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Processes List for this System */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              فرایندها و راهنماهای گام‌به‌گام {tool.name}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {relatedProcesses.length} فرایند
            </span>
          </div>

          {relatedProcesses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
            >
              <p className="text-sm text-slate-500">
                در حال حاضر فرایندی برای این ابزار ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProcesses.map((proc) => (
                <ProcessCard
                  key={proc.id}
                  process={proc}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
