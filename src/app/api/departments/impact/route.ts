import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';

/**
 * GET /api/departments/impact?id=&slug=
 * Returns live relation counts so the UI can show exactly what a department
 * delete will orphan (SET NULL survivors) vs permanently destroy (CASCADE).
 */
export async function GET(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_CATEGORIES required)' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    let target = null;
    if (id) {
      target = await prisma.department.findUnique({ where: { id } });
    }
    if (!target && slug) {
      target = await prisma.department.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سازمان مورد نظر یافت نشد.' }, { status: 404 });
    }

    const [processes, informationPosts, users, processGrants, infoGrants] = await Promise.all([
      prisma.process.count({ where: { departmentId: target.id } }),
      prisma.informationPost.count({ where: { departmentId: target.id } }),
      prisma.user.count({ where: { departmentId: target.id } }),
      prisma.processAccessGrant.count({ where: { departmentId: target.id } }),
      prisma.informationAccessGrant.count({ where: { departmentId: target.id } }),
    ]);

    return NextResponse.json({
      department: { id: target.id, slug: target.slug, name: target.name },
      impact: { processes, informationPosts, users, processGrants, infoGrants },
    });
  } catch (error: any) {
    console.error('Error computing department delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف سازمان' },
      { status: 500 }
    );
  }
}
