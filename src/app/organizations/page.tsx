import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbDepartments } from '@/lib/db-service';
import { Building2, Home, ArrowLeft, Shield, Users, Landmark, Server, Coins } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'دایرکتوری سازمان‌ها و ادارات | سامانه فناوری',
  description: 'فهرست سازمان‌ها، وزارتخانه‌ها و دپارتمان‌های سازمانی به تفکیک فرایندهای اجرایی و اداری',
};

export default async function OrganizationsPage() {
  const departments = await getDbDepartments();

  const getOrgIcon = (slug: string) => {
    switch (slug) {
      case 'org-tax': return <Landmark className="w-6 h-6 text-amber-500" />;
      case 'org-tamin': return <Shield className="w-6 h-6 text-sky-500" />;
      case 'org-fanavari-hr': return <Users className="w-6 h-6 text-blue-500" />;
      case 'org-fanavari-it': return <Server className="w-6 h-6 text-purple-500" />;
      case 'org-fanavari-finance': return <Coins className="w-6 h-6 text-emerald-500" />;
      default: return <Building2 className="w-6 h-6 text-indigo-500" />;
    }
  };

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
            دسته‌بندی فرایندها بر اساس دستگاه‌های دولتی، سازمان‌های متبوع و دپارتمان‌های عملیاتی.
          </p>
        </div>

        {/* Empty State */}
        {departments.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold">هیچ سازمانی در دیتابیس ثبت نشده است</h3>
            <p className="text-sm text-gray-500 mt-1">اطلاعات سازمان‌ها مستقیماً از پایگاه داده خوانده می‌شوند.</p>
          </div>
        )}

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((org) => {
            return (
              <div
                key={org.slug}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                    >
                      {getOrgIcon(org.slug)}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
                    >
                      {org.category === 'gov' ? 'نهاد دولتی / وزارتخانه' : 'دپارتمان سازمانی'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black mb-2 group-hover:text-blue-600 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {org.name}
                  </h3>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {org.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs font-bold text-blue-600"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-xs text-slate-500 font-normal">
                    {org.processCount} فرایند فعال
                  </span>
                  <Link href={`/?category=all`} className="group-hover:translate-x-[-4px] transition-transform flex items-center gap-1 font-bold">
                    <span>مشاهده فرایندها</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
