import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getDbInformationPostBySlug, getDbInformationPosts } from '@/lib/db-service';
import { InformationDetailView } from '@/components/information-detail-view';
import { Home } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getDbInformationPosts({ limit: 50 });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const post = await getDbInformationPostBySlug(decodedSlug);
  if (!post) {
    return { title: 'مطلب اطلاعاتی یافت نشد | سامانه فناوری' };
  }

  return {
    title: `${post.title} | سامانه فناوری`,
    description: post.summary || post.content.slice(0, 150),
  };
}

export default async function InformationDetailPage({ params }: Props) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const post = await getDbInformationPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>خانه</span>
          </Link>
          <span>/</span>
          <Link href="/information" className="hover:text-indigo-600">
            پایگاه اطلاعات و بخشنامه‌ها
          </Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Dedicated Information Detail View Component with Access Gating */}
        <InformationDetailView post={post} />
      </main>

      <Footer />
    </div>
  );
}
