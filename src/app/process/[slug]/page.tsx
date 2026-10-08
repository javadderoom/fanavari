import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDbProcesses, getDbProcessBySlug } from '@/lib/db-service';
import { ProcessDetailView } from '@/components/process-detail-view';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowRight, Home, Layers, Laptop, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const processes = await getDbProcesses();
  return processes.map((proc) => ({
    slug: proc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const process = await getDbProcessBySlug(decodedSlug);
  if (!process) return { title: 'فرایند یافت نشد | سامانه فناوری' };
  // Archived processes are hidden from public routes (server components have
  // no access to the localStorage demo session, so gate unconditionally).
  if (process.isPublished === false) return { title: 'فرایند یافت نشد | سامانه فناوری' };

  return {
    title: `${process.title} | سامانه فناوری`,
    description: process.description,
  };
}

export default async function ProcessPage({ params }: Props) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const process = await getDbProcessBySlug(decodedSlug);

  if (!process || process.isPublished === false) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>

          {process.scope === 'software' ? (
            <Link href="/systems" className="hover:text-blue-600 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" />
              <span>نرم‌افزارها و ابزارها</span>
            </Link>
          ) : (
            <Link href="/organizations" className="hover:text-blue-600 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>سازمان‌ها و ادارات</span>
            </Link>
          )}

          <span>/</span>
          <Link href={`/system/${process.targetSystemSlug}`} className="hover:text-blue-600">
            <span>{process.targetSystem}</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600 truncate max-w-xs">{process.title}</span>
        </nav>

        {/* Dedicated Process Interactive View Component */}
        <ProcessDetailView process={process} />
      </main>

      <Footer />
    </div>
  );
}
