import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { formatToSlug } from '@/lib/slug-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scopeId = searchParams.get('scopeId');
    const scopeKey = searchParams.get('scopeKey');
    const includeCounts = searchParams.get('counts') === 'true';

    let resolvedScopeId: string | null = scopeId;

    if (!resolvedScopeId && scopeKey && scopeKey !== 'all') {
      const scope = await prisma.processScope.findUnique({
        where: { key: scopeKey },
      });
      if (scope) {
        resolvedScopeId = scope.id;
      }
    }

    // Where condition: if a scope is requested, return categories for that scope AND global categories (scopeId: null)
    let whereClause: any = {};
    if (resolvedScopeId && resolvedScopeId !== 'all') {
      whereClause = {
        OR: [
          { scopeId: resolvedScopeId },
          { scopeId: null }, // General / Global category applying to all scopes
        ],
      };
    }

    const categories = await prisma.processCategory.findMany({
      where: whereClause,
      orderBy: [
        { scopeId: 'asc' }, // specific first, or global
        { orderIndex: 'asc' },
      ],
      include: {
        scope: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
    });

    // Optionally calculate process counts
    let countsMap = new Map<string, number>();
    if (includeCounts) {
      const processCounts = await prisma.process.groupBy({
        by: ['category'],
        _count: { id: true },
      });
      processCounts.forEach((c) => {
        countsMap.set(c.category, c._count.id);
      });
    }

    const mapped = categories.map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      description: c.description,
      icon: c.icon,
      orderIndex: c.orderIndex,
      scopeId: c.scopeId,
      scopeKey: c.scope?.key || null,
      scopeName: c.scope?.name || 'عمومی (همه حوزه‌ها)',
      scope: c.scope,
      processCount: countsMap.get(c.key) || 0,
      isGlobal: c.scopeId === null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (
      !hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) &&
      !hasPermission(userPermissions, Permissions.CREATE_PROCESSES)
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to create category' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, key, description, icon, scopeId, orderIndex } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'نام دسته‌بندی موضوعی الزامی است' }, { status: 400 });
    }

    const finalKey = (key?.trim() ? formatToSlug(key.trim()) : formatToSlug(name.trim())) || `cat-${Date.now()}`;
    const cleanScopeId = (scopeId && scopeId !== 'all' && scopeId !== 'global') ? scopeId.trim() : null;

    // Verify scope exists if provided
    if (cleanScopeId) {
      const scopeExists = await prisma.processScope.findUnique({ where: { id: cleanScopeId } });
      if (!scopeExists) {
        return NextResponse.json({ error: 'حوزه والد انتخابی معتبر نمی‌باشد' }, { status: 400 });
      }
    }

    // Check duplicate key in same scope
    const existing = await prisma.processCategory.findFirst({
      where: {
        key: finalKey,
        scopeId: cleanScopeId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `دسته‌بندی با شناسه «${finalKey}» در این حوزه قبلاً تعریف شده است` },
        { status: 409 }
      );
    }

    const created = await prisma.processCategory.create({
      data: {
        name: name.trim(),
        key: finalKey,
        description: description?.trim() || null,
        icon: icon?.trim() || 'Folder',
        scopeId: cleanScopeId,
        orderIndex: Number(orderIndex) || 0,
      },
      include: {
        scope: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (
      !hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) &&
      !hasPermission(userPermissions, Permissions.EDIT_PROCESSES)
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to edit category' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, key, description, icon, scopeId, orderIndex } = body;

    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی الزامی است' }, { status: 400 });
    }

    const existing = await prisma.processCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    let finalKey = existing.key;
    if (key && key.trim() && key.trim() !== existing.key) {
      finalKey = formatToSlug(key.trim());

      // If key changes, update existing processes using this category
      await prisma.process.updateMany({
        where: { category: existing.key },
        data: { category: finalKey },
      });
    }

    const cleanScopeId = scopeId !== undefined 
      ? (scopeId && scopeId !== 'all' && scopeId !== 'global' ? scopeId.trim() : null)
      : existing.scopeId;

    const updated = await prisma.processCategory.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        key: finalKey,
        description: description !== undefined ? description?.trim() : existing.description,
        icon: icon !== undefined ? icon?.trim() : existing.icon,
        scopeId: cleanScopeId,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
      },
      include: {
        scope: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (!hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to delete category' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی الزامی است' }, { status: 400 });
    }

    const catToDelete = await prisma.processCategory.findUnique({ where: { id } });
    if (!catToDelete) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    await prisma.processCategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `دسته‌بندی «${catToDelete.name}» با موفقیت حذف گردید.` });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
