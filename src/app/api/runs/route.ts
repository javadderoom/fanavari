import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const approvalStatus = searchParams.get('approvalStatus') || undefined;
    const processId = searchParams.get('processId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (approvalStatus && approvalStatus !== 'all') {
      where.supervisorApprovalStatus = approvalStatus;
    }
    if (processId && processId !== 'all') {
      where.processId = processId;
    }

    const runs = await prisma.workflowRun.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        process: {
          select: {
            id: true,
            title: true,
            slug: true,
            department: {
              select: {
                name: true,
              },
            },
            targetSystem: true,
          },
        },
        stepLogs: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    const [
      totalRuns,
      completedRuns,
      inProgressRuns,
      pendingApprovalRuns,
      approvedRuns
    ] = await Promise.all([
      prisma.workflowRun.count(),
      prisma.workflowRun.count({ where: { status: 'completed' } }),
      prisma.workflowRun.count({ where: { status: 'in_progress' } }),
      prisma.workflowRun.count({ where: { supervisorApprovalStatus: 'pending' } }),
      prisma.workflowRun.count({ where: { supervisorApprovalStatus: 'approved' } }),
    ]);

    return NextResponse.json({
      runs,
      stats: {
        totalRuns,
        completedRuns,
        inProgressRuns,
        pendingApprovalRuns,
        approvedRuns,
      },
    });
  } catch (err: any) {
    console.error('Error fetching organization workflow runs:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
