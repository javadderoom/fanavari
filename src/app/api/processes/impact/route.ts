import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

/**
 * GET /api/processes/impact?id=&slug=
 * Live relation counts for the delete-impact preview. Deleting a process is
 * the most destructive operation in the system: steps, error guides, saved
 * sessions, access grants and entire workflow-run audit trails CASCADE.
 * Only parent steps linking to it as a sub-process survive (SET NULL).
 */
export async function GET(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const isAllowed =
      hasPermission(userPermissions, Permissions.DELETE_PROCESSES) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (DELETE_PROCESSES required)' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    let target = null;
    if (id) {
      target = await prisma.process.findUnique({ where: { id } });
    }
    if (!target && slug) {
      target = await prisma.process.findFirst({
        where: { OR: [{ id: slug }, { slug }] },
      });
    }

    if (!target) {
      return NextResponse.json({ error: 'فرایند مورد نظر یافت نشد.' }, { status: 404 });
    }

    const [steps, errorGuides, savedSessions, accessGrants, workflowRuns, parentSteps] =
      await Promise.all([
        prisma.step.count({ where: { processId: target.id } }),
        prisma.errorGuide.count({ where: { step: { processId: target.id } } }),
        prisma.savedSession.count({ where: { processId: target.id } }),
        prisma.processAccessGrant.count({ where: { processId: target.id } }),
        prisma.workflowRun.count({ where: { processId: target.id } }),
        prisma.step.count({ where: { subProcessId: target.id } }),
      ]);

    return NextResponse.json({
      process: { id: target.id, slug: target.slug, title: target.title },
      impact: { steps, errorGuides, savedSessions, accessGrants, workflowRuns, parentSteps },
    });
  } catch (error: any) {
    console.error('Error computing process delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف فرایند' },
      { status: 500 }
    );
  }
}
