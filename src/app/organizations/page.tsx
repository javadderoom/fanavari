import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbDepartments } from '@/lib/db-service';
import { OrganizationsView } from '@/components/organizations-view';
import { Building2, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'دایرکتوری سازمان‌ها و ادارات | سامانه فناوری',
  description: 'فهرست سازمان‌ها، وزارتخانه‌ها و دپارتمان‌های سازمانی به تفکیک فرایندهای اجرایی و اداری',
};

export default async function OrganizationsPage() {
  const departments = await getDbDepartments();

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
          <span className="text-blue-600">سازمان‌ها و ادارات</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>دسته‌بندی ساختار سازمانی و مراجع</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            دایرکتوری سازمان‌ها و مراجع ذی‌ربط
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            دسته‌بندی فرایندها بر اساس دستگاه‌های دولتی، سازمان‌های متبوع و دپارتمان‌های عملیاتی متصل به پایگاه داده.
          </p>
        </div>

        {/* Interactive Organizations View with Registration Modal */}
        <OrganizationsView initialDepartments={departments} />
      </main>

      <Footer />
    </div>
  );
}
