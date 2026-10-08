import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { formatToSlug } from '@/lib/slug-utils';

export async function GET(req: NextRequest) {
  try {
    const scopes = await prisma.processScope.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        categories: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Also calculate process count for each scope
    const processCounts = await prisma.process.groupBy({
      by: ['scope'],
      _count: {
        id: true,
      },
    });

    const countsMap = new Map<string, number>();
    processCounts.forEach((c) => {
      countsMap.set(c.scope, c._count.id);
    });

    const mapped = scopes.map((s) => ({
      ...s,
      processCount: countsMap.get(s.key) || 0,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching process scopes:', error);
    return NextResponse.json({ error: 'Failed to fetch scopes' }, { status: 500 });
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
        { error: 'Forbidden: Insufficient permissions to create scope' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, key, description, icon, orderIndex } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'نام حوزه الزامی است' }, { status: 400 });
    }

    const finalKey = (key?.trim() ? formatToSlug(key.trim()) : formatToSlug(name.trim())) || `scope-${Date.now()}`;

    // Check key collision
    const existing = await prisma.processScope.findUnique({ where: { key: finalKey } });
    if (existing) {
      return NextResponse.json({ error: 'حوزه‌ای با این شناسه لاتین قبلاً ثبت شده است' }, { status: 409 });
    }

    const created = await prisma.processScope.create({
      data: {
        name: name.trim(),
        key: finalKey,
        description: description?.trim() || null,
        icon: icon?.trim() || 'Layers',
        orderIndex: Number(orderIndex) || 0,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating scope:', error);
    return NextResponse.json({ error: error.message || 'Failed to create scope' }, { status: 500 });
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
        { error: 'Forbidden: Insufficient permissions to edit scope' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, key, description, icon, orderIndex } = body;

    if (!id) {
      return NextResponse.json({ error: 'شناسه حوزه الزامی است' }, { status: 400 });
    }

    const existing = await prisma.processScope.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'حوزه مورد نظر یافت نشد' }, { status: 404 });
    }

    let finalKey = existing.key;
    if (key && key.trim() && key.trim() !== existing.key) {
      finalKey = formatToSlug(key.trim());
      const collision = await prisma.processScope.findUnique({ where: { key: finalKey } });
      if (collision && collision.id !== id) {
        return NextResponse.json({ error: 'شناسه انتخابی تکراری است' }, { status: 409 });
      }

      // If key changes, update processes referencing the old key
      await prisma.process.updateMany({
        where: { scope: existing.key },
        data: { scope: finalKey },
      });
    }

    const updated = await prisma.processScope.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        key: finalKey,
        description: description !== undefined ? description?.trim() : existing.description,
        icon: icon !== undefined ? icon?.trim() : existing.icon,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating scope:', error);
    return NextResponse.json({ error: error.message || 'Failed to update scope' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    if (!hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to delete scope' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'شناسه حوزه الزامی است' }, { status: 400 });
    }

    const scopeToDelete = await prisma.processScope.findUnique({ where: { id } });
    if (!scopeToDelete) {
      return NextResponse.json({ error: 'حوزه یافت نشد' }, { status: 404 });
    }

    await prisma.processScope.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `حوزه «${scopeToDelete.name}» با موفقیت حذف گردید.` });
  } catch (error: any) {
    console.error('Error deleting scope:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete scope' }, { status: 500 });
  }
}
