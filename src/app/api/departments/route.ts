import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        processes: true,
      },
      orderBy: { name: 'asc' },
    });

    const mapped = departments.map((d) => ({
      id: d.id,
      slug: d.slug,
      name: d.name,
      icon: d.icon || 'Building2',
      category: 'gov',
      description: `سازمان و ارگان اجرایی متولی ${d.name}`,
      processCount: d.processes.length,
      createdAt: d.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Check if user has MANAGE_CATEGORIES or ADMINISTRATOR permission
    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_CATEGORIES required)' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug, icon } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'نام سازمان الزامی است.' }, { status: 400 });
    }

    const normalizedSlug = (slug || `org-${Date.now()}`)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existing = await prisma.department.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'سازمانی با این شناسه لاتین (Slug) قبلاً ثبت شده است.' },
        { status: 409 }
      );
    }

    const created = await prisma.department.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        icon: icon || 'Building2',
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
        icon: created.icon || 'Building2',
        category: 'gov',
        description: `سازمان و ارگان اجرایی متولی ${created.name}`,
        processCount: 0,
        createdAt: created.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت سازمان جدید' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_CATEGORIES required)' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, currentSlug, name, slug, icon } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'نام سازمان الزامی است.' }, { status: 400 });
    }

    // Locate target department
    let target = null;
    if (id) {
      target = await prisma.department.findUnique({ where: { id } });
    }
    if (!target && currentSlug) {
      target = await prisma.department.findUnique({ where: { slug: currentSlug } });
    }
    if (!target && slug) {
      target = await prisma.department.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سازمان مورد نظر یافت نشد.' }, { status: 404 });
    }

    const finalSlug = (slug || target.slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    // Check slug collision if slug changed
    if (finalSlug !== target.slug) {
      const existing = await prisma.department.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== target.id) {
        return NextResponse.json(
          { error: 'سازمانی با این شناسه لاتین (Slug) قبلاً وجود دارد.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.department.update({
      where: { id: target.id },
      data: {
        name: name.trim(),
        slug: finalSlug,
        icon: icon || target.icon || 'Building2',
      },
      include: {
        processes: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      icon: updated.icon || 'Building2',
      category: 'gov',
      description: `سازمان و ارگان اجرایی متولی ${updated.name}`,
      processCount: updated.processes.length,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ویرایش اطلاعات سازمان' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

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

    // Try reading from body if not in query params
    if (!target) {
      const body = await req.json().catch(() => ({}));
      if (body.id) target = await prisma.department.findUnique({ where: { id: body.id } });
      if (!target && body.slug) target = await prisma.department.findUnique({ where: { slug: body.slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'سازمان مورد نظر برای حذف یافت نشد.' }, { status: 404 });
    }

    await prisma.department.delete({
      where: { id: target.id },
    });

    return NextResponse.json({ success: true, deletedSlug: target.slug });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در حذف سازمان' },
      { status: 500 }
    );
  }
}
