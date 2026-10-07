import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const runs = await prisma.workflowRun.findMany({
      take: 10,
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
      },
    });

    const totalRuns = await prisma.workflowRun.count();
    const completedRuns = await prisma.workflowRun.count({
      where: { status: 'completed' },
    });
    const inProgressRuns = await prisma.workflowRun.count({
      where: { status: 'in_progress' },
    });

    return NextResponse.json({
      runs,
      stats: {
        totalRuns,
        completedRuns,
        inProgressRuns,
      },
    });
  } catch (err: any) {
    console.error('Error fetching organization workflow runs:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
