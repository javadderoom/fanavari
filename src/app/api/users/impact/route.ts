import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';

/**
 * GET /api/users/impact?id=
 * Live counts for the user delete-impact preview. Access grants, sessions
 * and verification codes CASCADE; authored processes/posts and audit
 * attributions unlink (SET NULL).
 */
export async function GET(req: NextRequest) {
  try {
    const { permissions } = await resolveApiUser(req);
    const isAllowed =
      hasPermission(permissions, Permissions.MANAGE_USERS) ||
      hasPermission(permissions, Permissions.ADMINISTRATOR);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_USERS required)' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'شناسه کاربر الزامی است.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!target) {
      return NextResponse.json({ error: 'کاربر یافت نشد.' }, { status: 404 });
    }

    const [processGrants, infoGrants, sessions, authoredProcesses, authoredPosts, operatedRuns] =
      await Promise.all([
        prisma.processAccessGrant.count({ where: { userId: id } }),
        prisma.informationAccessGrant.count({ where: { userId: id } }),
        prisma.userSession.count({ where: { userId: id } }),
        prisma.process.count({ where: { authorId: id } }),
        prisma.informationPost.count({ where: { authorId: id } }),
        prisma.workflowRun.count({ where: { operatorId: id } }),
      ]);

    return NextResponse.json({
      user: target,
      impact: { processGrants, infoGrants, sessions, authoredProcesses, authoredPosts, operatedRuns },
    });
  } catch (error: any) {
    console.error('Error computing user delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف کاربر' },
      { status: 500 }
    );
  }
}
