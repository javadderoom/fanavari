import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

// GET: List all workflow execution runs for a process + summary metrics
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Resolve process by id or slug
    const process = await prisma.process.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    const runs = await prisma.workflowRun.findMany({
      where: { processId: process.id },
      orderBy: { createdAt: 'desc' },
      include: {
        stepLogs: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    // Calculate metrics
    const totalRuns = runs.length;
    const completedRuns = runs.filter((r) => r.status === 'completed').length;
    const pendingSupervisor = runs.filter((r) => r.supervisorApprovalStatus === 'pending').length;
    const approvedRuns = runs.filter((r) => r.supervisorApprovalStatus === 'approved').length;

    const durations = runs
      .filter((r) => r.status === 'completed' && r.totalDurationSeconds && r.totalDurationSeconds > 0)
      .map((r) => r.totalDurationSeconds as number);

    const averageDurationSeconds = durations.length > 0
      ? Math.round(durations.reduce((acc, curr) => acc + curr, 0) / durations.length)
      : null;

    const completionRatePercent = totalRuns > 0
      ? Math.round((completedRuns / totalRuns) * 100)
      : 0;

    return NextResponse.json({
      process: { id: process.id, title: process.title, slug: process.slug },
      runs,
      stats: {
        totalRuns,
        completedRuns,
        completionRatePercent,
        averageDurationSeconds,
        pendingSupervisor,
        approvedRuns,
      },
    });
  } catch (err: any) {
    console.error('Error fetching workflow runs:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Start a new official execution run instance
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || null;
    const body = await request.json().catch(() => ({}));

    // Resolve process
    const process = await prisma.process.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        steps: {
          select: { id: true, stepKey: true, orderIndex: true, title: true, stepType: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    // Resolve user if present
    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, roleName: true },
      });
    }

    // Determine runNumber
    const latestRun = await prisma.workflowRun.findFirst({
      where: { processId: process.id },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });
    const runNumber = (latestRun?.runNumber || 0) + 1;

    const operatorName = body.operatorName || dbUser?.name || 'کارشناس عملیات';
    const operatorRole = body.operatorRole || dbUser?.roleName || 'اپراتور سامانه';
    const title = body.title?.trim() || `اجرای ممیزی رسمی #${runNumber}`;
    const notes = body.notes?.trim() || null;

    const run = await prisma.workflowRun.create({
      data: {
        processId: process.id,
        runNumber,
        title,
        status: 'in_progress',
        operatorId: dbUser?.id || null,
        operatorName,
        operatorRole,
        totalStepsCount: process.steps.length,
        completedStepsCount: 0,
        notes,
        startedAt: new Date(),
      },
      include: {
        stepLogs: true,
      },
    });

    return NextResponse.json({ success: true, run }, { status: 201 });
  } catch (err: any) {
    console.error('Error starting workflow run:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
