import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

/**
 * POST /api/scopes/reassign-delete { id, replacementScopeId? }
 * Remaps processes (by scope key string) and moves exclusive categories to
 * the replacement scope, then deletes the scope — all in one transaction so
 * no process is left pointing at a dead scope key. replacementScopeId is
 * required when any process still uses the scope.
 */
export async function POST(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');
    if (!hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to manage taxonomy' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id, replacementScopeId } = body;
    if (!id) {
      return NextResponse.json({ error: 'شناسه حوزه الزامی است' }, { status: 400 });
    }

    const scope = await prisma.processScope.findUnique({ where: { id } });
    if (!scope) {
      return NextResponse.json({ error: 'حوزه یافت نشد' }, { status: 404 });
    }

    const processesUsingKey = await prisma.process.count({ where: { scope: scope.key } });

    let replacement = null;
    if (replacementScopeId) {
      if (replacementScopeId === id) {
        return NextResponse.json(
          { error: 'حوزه جایگزین نمی‌تواند همان حوزه در حال حذف باشد.' },
          { status: 400 }
        );
      }
      replacement = await prisma.processScope.findUnique({ where: { id: replacementScopeId } });
      if (!replacement) {
        return NextResponse.json({ error: 'حوزه جایگزین یافت نشد.' }, { status: 404 });
      }
    } else if (processesUsingKey > 0) {
      return NextResponse.json(
        { error: `این حوزه توسط ${processesUsingKey} فرایند استفاده می‌شود؛ ابتدا حوزه جایگزین انتخاب کنید.` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let remappedProcesses = 0;
      let movedCategories = 0;
      if (replacement) {
        const p = await tx.process.updateMany({
          where: { scope: scope.key },
          data: { scope: replacement.key },
        });
        remappedProcesses = p.count;
        const c = await tx.processCategory.updateMany({
          where: { scopeId: scope.id },
          data: { scopeId: replacement.id },
        });
        movedCategories = c.count;
      }
      await tx.processScope.delete({ where: { id: scope.id } });
      return { remappedProcesses, movedCategories };
    });

    return NextResponse.json({
      success: true,
      message: `حوزه «${scope.name}» حذف شد.` + (replacement ? ` ${result.remappedProcesses} فرایند و ${result.movedCategories} دسته‌بندی به «${replacement.name}» منتقل شدند.` : ''),
      ...result,
    });
  } catch (error: any) {
    console.error('Error reassign-deleting scope:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در حذف حوزه' },
      { status: 500 }
    );
  }
}
