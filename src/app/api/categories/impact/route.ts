import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';

/**
 * GET /api/categories/impact?id=
 * How many processes use this category key. Processes reference categories
 * by plain string key (no FK), so deleting without remapping leaves
 * dangling values in the process catalog.
 */
export async function GET(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (!hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to manage taxonomy' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی الزامی است' }, { status: 400 });
    }

    const category = await prisma.processCategory.findUnique({
      where: { id },
      include: { scope: { select: { id: true, key: true, name: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    const processesUsingKey = await prisma.process.count({ where: { category: category.key } });

    return NextResponse.json({
      category: {
        id: category.id,
        key: category.key,
        name: category.name,
        scopeId: category.scopeId,
        scopeName: category.scope?.name || null,
      },
      impact: { processesUsingKey },
    });
  } catch (error: any) {
    console.error('Error computing category delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف دسته‌بندی' },
      { status: 500 }
    );
  }
}
