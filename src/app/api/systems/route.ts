import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

export async function GET() {
  try {
    const tools = await prisma.systemTool.findMany({
      include: {
        processes: true,
      },
      orderBy: { name: 'asc' },
    });

    const mapped = tools.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      category: t.category || 'portal',
      icon: t.icon || 'Laptop',
      description: t.description || '',
      websiteUrl: t.websiteUrl || undefined,
      processCount: t.processes.length,
      createdAt: t.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching systems:', error);
    return NextResponse.json({ error: 'Failed to fetch systems' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Check if user has MANAGE_SYSTEMS, MANAGE_CATEGORIES, or ADMINISTRATOR permission
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

    const body = await req.json();
    const { name, slug, category, icon, description, websiteUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'نام نرم‌افزار یا سامانه الزامی است.' }, { status: 400 });
    }

    const normalizedSlug = (slug || `sys-${Date.now()}`)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existing = await prisma.systemTool.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'سامانه‌ای با این شناسه یکتا (Slug) قبلاً ثبت شده است.' },
        { status: 409 }
      );
    }

    const created = await prisma.systemTool.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        category: category || 'portal',
        icon: icon || 'Laptop',
        description: description ? description.trim() : null,
        websiteUrl: websiteUrl ? websiteUrl.trim() : null,
      },
      include: {
        processes: true,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        slug: created.slug,
        name: created.name,
        category: created.category,
        icon: created.icon || 'Laptop',
        description: created.description || '',
        websiteUrl: created.websiteUrl || undefined,
        processCount: 0,
        createdAt: created.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating system:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت سامانه جدید' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, currentSlug, name, slug, category, icon, description, websiteUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'نام نرم‌افزار یا سامانه الزامی است.' }, { status: 400 });
    }

    // Locate target system
    let target = null;
    if (id) {
      target = await prisma.systemTool.findUnique({ where: { id } });
    }
    if (!target && currentSlug) {
      target = await prisma.systemTool.findUnique({ where: { slug: currentSlug } });
    }
    if (!target && slug) {
      target = await prisma.systemTool.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سامانه یا نرم‌افزار مورد نظر یافت نشد.' }, { status: 404 });
    }

    const finalSlug = (slug || target.slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    // Check slug collision if slug changed
    if (finalSlug !== target.slug) {
      const existing = await prisma.systemTool.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== target.id) {
        return NextResponse.json(
          { error: 'سامانه‌ای با این شناسه یکتا (Slug) قبلاً وجود دارد.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.systemTool.update({
      where: { id: target.id },
      data: {
        name: name.trim(),
        slug: finalSlug,
        category: category || target.category,
        icon: icon || target.icon || 'Laptop',
        description: description !== undefined ? description.trim() : target.description,
        websiteUrl: websiteUrl !== undefined ? (websiteUrl ? websiteUrl.trim() : null) : target.websiteUrl,
      },
      include: {
        processes: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      category: updated.category,
      icon: updated.icon || 'Laptop',
      description: updated.description || '',
      websiteUrl: updated.websiteUrl || undefined,
      processCount: updated.processes.length,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    console.error('Error updating system:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ویرایش اطلاعات سامانه' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    // Try reading from body if not in query params
    if (!target) {
      const body = await req.json().catch(() => ({}));
      if (body.id) target = await prisma.systemTool.findUnique({ where: { id: body.id } });
      if (!target && body.slug) target = await prisma.systemTool.findUnique({ where: { slug: body.slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سامانه یا نرم‌افزار مورد نظر برای حذف یافت نشد.' }, { status: 404 });
    }

    await prisma.systemTool.delete({
      where: { id: target.id },
    });

    return NextResponse.json({ success: true, deletedSlug: target.slug });
  } catch (error: any) {
    console.error('Error deleting system:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در حذف سامانه' },
      { status: 500 }
    );
  }
}
