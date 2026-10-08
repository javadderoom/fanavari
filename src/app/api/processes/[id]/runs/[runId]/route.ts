import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveApiUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string; runId: string }>;
}

// GET: Fetch detailed workflow run with all audit step logs
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id, runId } = await params;

    const run = await prisma.workflowRun.findFirst({
      where: {
        id: runId,
        process: {
          OR: [{ id }, { slug: id }],
        },
      },
      include: {
        process: {
          select: {
            id: true,
            title: true,
            slug: true,
            department: { select: { name: true } },
            targetSystem: true,
            steps: {
              select: {
                id: true,
                stepKey: true,
                orderIndex: true,
                title: true,
                stepType: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        stepLogs: {
          orderBy: { stepOrder: 'asc' },
        },
        operator: {
          select: { id: true, name: true, email: true, roleName: true, avatarUrl: true },
        },
        supervisor: {
          select: { id: true, name: true, email: true, roleName: true, avatarUrl: true },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 });
    }

    return NextResponse.json({ run });
  } catch (err: any) {
    console.error('Error fetching workflow run details:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update run status, log a step completion, or record supervisor sign-off
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id, runId } = await params;
    const { dbUserId: userId } = await resolveApiUser(request);
    const body = await request.json().catch(() => ({}));

    // Find the run
    const existingRun = await prisma.workflowRun.findFirst({
      where: {
        id: runId,
        process: {
          OR: [{ id }, { slug: id }],
        },
      },
      include: {
        stepLogs: true,
      },
    });

    if (!existingRun) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 });
    }

    // Resolve user if present
    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, roleName: true },
      });
    }

    const updateData: any = {};

    // 1. Step Log Action (Log an individual step as completed/skipped)
    if (body.stepLog) {
      const {
        stepKey,
        stepOrder,
        stepTitle,
        stepId,
        status = 'completed',
        durationSeconds,
        operatorNotes,
        isCheckpoint = false,
        startedAt,
      } = body.stepLog;

      if (!stepKey) {
        return NextResponse.json({ error: 'stepKey is required' }, { status: 400 });
      }

      // Check if this step was already logged for this run
      const existingStepLog = existingRun.stepLogs.find((s) => s.stepKey === stepKey);

      if (existingStepLog) {
        await prisma.workflowStepLog.update({
          where: { id: existingStepLog.id },
          data: {
            status,
            completedAt: new Date(),
            durationSeconds: durationSeconds ?? existingStepLog.durationSeconds,
            operatorNotes: operatorNotes ?? existingStepLog.operatorNotes,
            isCheckpoint: isCheckpoint ?? existingStepLog.isCheckpoint,
          },
        });
      } else {
        await prisma.workflowStepLog.create({
          data: {
            runId: existingRun.id,
            stepId: stepId || null,
            stepKey,
            stepOrder: Number(stepOrder) || 1,
            stepTitle: stepTitle || `گام ${stepOrder}`,
            status,
            startedAt: startedAt ? new Date(startedAt) : null,
            completedAt: new Date(),
            durationSeconds: durationSeconds ?? null,
            operatorNotes: operatorNotes || null,
            isCheckpoint: Boolean(isCheckpoint),
          },
        });
      }

      // Recalculate completed steps count
      const updatedLogs = await prisma.workflowStepLog.findMany({
        where: { runId: existingRun.id, status: 'completed' },
      });
      updateData.completedStepsCount = updatedLogs.length;
    }

    // 2. Supervisor Approval / Rejection Action
    if (body.supervisorAction) {
      const action = body.supervisorAction; // 'approve' | 'reject' | 'request_changes'
      const supervisorName = body.supervisorName || dbUser?.name || 'ناظر کنترل کیفیت';
      const supervisorNotes = body.supervisorNotes || null;

      updateData.supervisorId = dbUser?.id || existingRun.supervisorId;
      updateData.supervisorName = supervisorName;
      updateData.supervisorNotes = supervisorNotes;
      updateData.supervisorApprovedAt = new Date();

      if (action === 'approve') {
        updateData.supervisorApprovalStatus = 'approved';
        // If step sign-offs requested, mark checkpoint steps
        await prisma.workflowStepLog.updateMany({
          where: { runId: existingRun.id, isCheckpoint: true },
          data: {
            supervisorSignOff: true,
            supervisorSignedBy: supervisorName,
            supervisorSignedAt: new Date(),
          },
        });
      } else if (action === 'reject') {
        updateData.supervisorApprovalStatus = 'rejected';
      } else {
        updateData.supervisorApprovalStatus = 'pending';
      }
    }

    // 3. Status updates (in_progress, completed, paused, flagged)
    if (body.status && body.status !== existingRun.status) {
      updateData.status = body.status;

      if (body.status === 'completed') {
        const completedAt = new Date();
        updateData.completedAt = completedAt;
        const startedAt = new Date(existingRun.startedAt);
        const durationSec = Math.max(1, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000));
        updateData.totalDurationSeconds = durationSec;

        // If there are checkpoint steps, mark supervisor status as pending review if not already approved
        if (existingRun.supervisorApprovalStatus === 'none') {
          const hasCheckpoint = existingRun.stepLogs.some((s) => s.isCheckpoint);
          if (hasCheckpoint) {
            updateData.supervisorApprovalStatus = 'pending';
          }
        }
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    const updatedRun = await prisma.workflowRun.update({
      where: { id: existingRun.id },
      data: updateData,
      include: {
        stepLogs: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, run: updatedRun });
  } catch (err: any) {
    console.error('Error updating workflow run:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a run instance
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id, runId } = await params;

    const existingRun = await prisma.workflowRun.findFirst({
      where: {
        id: runId,
        process: {
          OR: [{ id }, { slug: id }],
        },
      },
    });

    if (!existingRun) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 });
    }

    await prisma.workflowRun.delete({
      where: { id: existingRun.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting workflow run:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
