import React from 'react';
import { notFound } from 'next/navigation';
import { getDbProcesses, getDbProcessBySlug } from '@/lib/db-service';
import { SidecarPopoutView } from '@/components/process-detail/sidecar-popout-view';
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

  const process = await getDbProcessBySlug(decodedSlug, { redactGrants: true });
  if (!process || process.isPublished === false)
    return { title: 'فرایند یافت نشد | سایدکار همراه' };

  return {
    title: `سایدکار همراه: ${process.title} | سامانه فرآیندنما`,
    description: `پنجره همراه و اجرای همزمان فرایند ${process.title} کنار نرم‌افزارهای سازمانی`,
  };
}

export default async function ProcessSidecarPage({ params }: Props) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const process = await getDbProcessBySlug(decodedSlug, { redactGrants: true });

  if (!process || process.isPublished === false) {
    notFound();
  }

  return <SidecarPopoutView process={process} />;
}
