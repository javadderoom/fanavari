import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

function requireManager(userPermissions: number) {
  return hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES);
}

/**
 * GET /api/scopes/impact?id=
 * How many processes use this scope key, and which exclusive categories
 * would be affected. Processes reference scopes by plain string key
 * (no FK), so deleting without remapping leaves dangling values.
 */
export async function GET(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');
    if (!requireManager(userPermissions)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to manage taxonomy' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'شناسه حوزه الزامی است' }, { status: 400 });
    }

    const scope = await prisma.processScope.findUnique({
      where: { id },
      include: { categories: { select: { id: true, key: true, name: true } } },
    });
    if (!scope) {
      return NextResponse.json({ error: 'حوزه یافت نشد' }, { status: 404 });
    }

    const processesUsingKey = await prisma.process.count({ where: { scope: scope.key } });

    return NextResponse.json({
      scope: { id: scope.id, key: scope.key, name: scope.name },
      impact: { processesUsingKey, exclusiveCategories: scope.categories },
    });
  } catch (error: any) {
    console.error('Error computing scope delete impact:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در محاسبه پیامدهای حذف حوزه' },
      { status: 500 }
    );
  }
}
