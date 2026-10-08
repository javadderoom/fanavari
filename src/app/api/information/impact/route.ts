import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

/**
 * GET /api/information/impact?id=&slug=
 * Live relation counts for the delete-impact preview. Deleting a post
 * permanently destroys its access grants (CASCADE).
 */
export async function GET(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_INFORMATION) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR) ||
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: دسترسی لازم برای مشاهده پیامدهای حذف را ندارید' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    let target = null;
    if (id) {
      target = await prisma.informationPost.findUnique({ where: { id } });
    }
    if (!target && slug) {
      target = await prisma.informationPost.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'مطلب مورد نظر یافت نشد.' }, { status: 404 });
    }

    const [accessGrants] = await Promise.all([
      prisma.informationAccessGrant.count({ where: { postId: target.id } }),
    ]);

    return NextResponse.json({
      post: { id: target.id, slug: target.slug, title: target.title },
      impact: { accessGrants },
    });
  } catch (error: any) {
    console.error('Error computing information delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف مطلب' },
      { status: 500 }
    );
  }
}
