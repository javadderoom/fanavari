import React from 'react';
import { notFound } from 'next/navigation';
import { getDbProcesses, getDbProcessBySlug } from '@/lib/db-service';
import { ProcessPrintView } from '@/components/process-print-view';
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
  if (!process) return { title: 'فرایند یافت نشد | نسخه چاپی' };

  return {
    title: `نسخه چاپی و راهنمای رسمی: ${process.title} | سامانه فناوری`,
    description: `راهنمای گام‌به‌گام و رسمی جهت چاپ فرایند ${process.title} شامل تمامی مراحل و مسیرهای دسترسی`,
  };
}

export default async function ProcessPrintPage({ params }: Props) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const process = await getDbProcessBySlug(decodedSlug);

  if (!process) {
    notFound();
  }

  return <ProcessPrintView process={process} />;
}
