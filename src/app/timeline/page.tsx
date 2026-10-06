import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbProcesses, getDbDepartments } from '@/lib/db-service';
import { AdministrativeTimelineView } from '@/components/administrative-timeline-view';
import { CalendarClock, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'گاه‌شمار اجرایی و تقویم سالانه فرایندها | سامانه فناوری',
  description: 'تقویم سالانه زمان‌بندی، مهلت‌های اداری و موعدهای مقرر اجرای فرایندها در سازمان‌ها و دستگاه‌های اجرایی',
};

export default async function TimelinePage() {
  const [processes, departments] = await Promise.all([
    getDbProcesses(),
    getDbDepartments(),
  ]);

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav 
          aria-label="مسیر راهنما"
          className="flex items-center gap-2 text-xs font-semibold mb-6" 
          style={{ color: 'var(--text-muted)' }}
        >
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">گاه‌شمار اجرایی فرایندها</span>
        </nav>

        {/* Interactive Administrative Operating Timeline */}
        <AdministrativeTimelineView 
          initialProcesses={processes}
          initialOrganizations={departments}
        />
      </main>

      <Footer />
    </div>
  );
}
