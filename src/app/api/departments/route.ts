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
