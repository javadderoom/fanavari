import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';

/**
 * POST /api/categories/reassign { fromKey, toKey }
 * Moves every process using one category key to another key. Used before
 * deleting a category so no process is left with a dangling category value.
 * The caller then deletes the category itself.
 */
export async function POST(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (!hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to manage taxonomy' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const fromKey = typeof body.fromKey === 'string' ? body.fromKey.trim() : '';
    const toKey = typeof body.toKey === 'string' ? body.toKey.trim() : '';

    if (!fromKey || !toKey) {
      return NextResponse.json({ error: 'کلید مبدأ و مقصد الزامی است.' }, { status: 400 });
    }
    if (fromKey === toKey) {
      return NextResponse.json({ error: 'مقصد نمی‌تواند با مبدأ یکسان باشد.' }, { status: 400 });
    }

    const targetExists = await prisma.processCategory.findFirst({ where: { key: toKey } });
    if (!targetExists) {
      return NextResponse.json({ error: 'دسته‌بندی مقصد یافت نشد.' }, { status: 404 });
    }

    const result = await prisma.process.updateMany({
      where: { category: fromKey },
      data: { category: toKey },
    });

    return NextResponse.json({ success: true, remappedProcesses: result.count });
  } catch (error: any) {
    console.error('Error reassigning category:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در انتقال فرایندها' },
      { status: 500 }
    );
  }
}
