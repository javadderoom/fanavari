import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbInformationPosts, getDbDepartments, getDbSystemTools } from '@/lib/db-service';
import { InformationClientView } from '@/components/information-client-view';
import { Megaphone, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'پایگاه اطلاعات، بخشنامه‌ها و راهنماها | سامانه فناوری',
  description: 'اطلاعیه‌های رسمی، بخشنامه‌های سازمانی، معرفی و آموزش سامانه‌ها، و مقالات پایگاه دانش فناوری',
};

export default async function InformationPage() {
  const [posts, departments, systems] = await Promise.all([
    getDbInformationPosts({ redactGrants: true }),
    getDbDepartments(),
    getDbSystemTools(),
  ]);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
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
          <span className="text-indigo-600">پایگاه اطلاعات و بخشنامه‌ها</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>مرکز جامع اطلاعیه‌ها و راهنماها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            پایگاه اطلاعات، بخشنامه‌ها و مستندات سامانه‌ها
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            دسترسی متمرکز به تازه‌ترین بخشنامه‌ها، اطلاعیه‌های اداری، معرفی و آموزش ورود به سامانه‌ها و پایگاه دانش حل مسئله.
          </p>
        </div>

        {/* Client Interactive Filter & Posts View */}
        <InformationClientView
          initialPosts={posts}
          departments={departments}
          systems={systems}
        />
      </main>

      <Footer />
    </div>
  );
}
