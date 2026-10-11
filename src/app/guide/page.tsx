import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GuideView } from '@/components/guide/guide-view';

export const metadata: Metadata = {
  title: 'مرکز آموزش و راهنمای کاربری | سامانه فرآیندنما',
  description: 'راهنمای گام‌به‌گام کار با سامانه فرآیندنما، موتور جستجوی هوشمند، مسیر منوها، ماتریس کدهای خطا و کار آفلاین با PWA',
  alternates: {
    canonical: '/guide',
  },
  openGraph: {
    title: 'مرکز آموزش و راهنمای کاربری | سامانه فرآیندنما',
    description: 'راهنمای گام‌به‌گام کار با سامانه فرآیندنما، موتور جستجوی هوشمند و ماتریس کدهای خطا',
    url: 'https://farayandnama.ir/guide',
    siteName: 'فرآیندنما',
    type: 'article',
  },
};

export default function GuidePage() {
  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 pb-24 lg:pb-12">
        <GuideView />
      </main>

      <Footer />
    </div>
  );
}
