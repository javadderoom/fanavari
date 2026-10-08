import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

/**
 * GET /api/systems/impact?id=&slug=
 * Live relation counts for the delete-impact preview. Deleting a system only
 * unlinks (SET NULL) — nothing cascades — but callers deserve to see that.
 */
export async function GET(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_SYSTEMS) ||
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_SYSTEMS required)' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    let target = null;
    if (id) {
      target = await prisma.systemTool.findUnique({ where: { id } });
    }
    if (!target && slug) {
      target = await prisma.systemTool.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سامانه مورد نظر یافت نشد.' }, { status: 404 });
    }

    const [processes, informationPosts] = await Promise.all([
      prisma.process.count({ where: { systemToolId: target.id } }),
      prisma.informationPost.count({ where: { systemToolId: target.id } }),
    ]);

    return NextResponse.json({
      system: { id: target.id, slug: target.slug, name: target.name },
      impact: { processes, informationPosts },
    });
  } catch (error: any) {
    console.error('Error computing system delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف سامانه' },
      { status: 500 }
    );
  }
}
