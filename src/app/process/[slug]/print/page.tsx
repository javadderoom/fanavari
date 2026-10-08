import React from 'react';
import { notFound } from 'next/navigation';
import { getDbProcesses, getDbProcessBySlug } from '@/lib/db-service';
import { prisma } from '@/lib/prisma';
import { ProcessPrintView } from '@/components/process-print-view';
import { WorkflowRun } from '@/types/process';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ runId?: string }>;
}

export async function generateStaticParams() {
  const processes = await getDbProcesses();
  return processes.map((proc) => ({
    slug: proc.slug,
  }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { runId } = (await searchParams) || {};
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    // fallback
  }

  const process = await getDbProcessBySlug(decodedSlug, { redactGrants: true });
  if (!process || process.isPublished === false)
    return { title: 'فرایند یافت نشد | نسخه چاپی' };

  if (runId) {
    return {
      title: `گواهینامه رسمی و کارنامه ممیزی ISO: ${process.title} | سامانه فرآیندنما`,
      description: `سند رسمی ممیزی، تاییدات اپراتور و ایست‌های بازرسی فرایند ${process.title}`,
    };
  }

  return {
    title: `نسخه چاپی و راهنمای رسمی: ${process.title} | سامانه فرآیندنما`,
    description: `راهنمای گام‌به‌گام و رسمی جهت چاپ فرایند ${process.title} شامل تمامی مراحل و مسیرهای دسترسی`,
  };
}

export default async function ProcessPrintPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { runId } = (await searchParams) || {};
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

  let initialRun: WorkflowRun | null = null;
  if (runId) {
    try {
      const rawRun = await prisma.workflowRun.findUnique({
        where: { id: runId },
        include: {
          stepLogs: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      });

      if (rawRun) {
        initialRun = {
          ...rawRun,
          startedAt: rawRun.startedAt.toISOString(),
          completedAt: rawRun.completedAt ? rawRun.completedAt.toISOString() : null,
          supervisorApprovedAt: rawRun.supervisorApprovedAt ? rawRun.supervisorApprovedAt.toISOString() : null,
          createdAt: rawRun.createdAt.toISOString(),
          updatedAt: rawRun.updatedAt.toISOString(),
          status: rawRun.status as any,
          supervisorApprovalStatus: rawRun.supervisorApprovalStatus as any,
          stepLogs: rawRun.stepLogs.map((log) => ({
            ...log,
            status: log.status as any,
            startedAt: log.startedAt ? log.startedAt.toISOString() : null,
            completedAt: log.completedAt ? log.completedAt.toISOString() : new Date().toISOString(),
            createdAt: log.createdAt.toISOString(),
          })),
        };
      }
    } catch (err) {
      console.error('Error fetching print workflow run:', err);
    }
  }

  return <ProcessPrintView process={process} initialRun={initialRun} />;
}
