import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { mapPrismaProcess } from '@/lib/db-service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    const rawRole = req.headers.get('x-user-role');
    let userRole = rawRole;
    if (rawRole) {
      try {
        userRole = decodeURIComponent(rawRole);
      } catch (e) {
        userRole = rawRole;
      }
    }
    const userDeptId = req.headers.get('x-user-dept');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const process = await prisma.process.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
          include: {
            errorGuides: true,
          },
        },
        department: true,
        systemTool: true,
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    // Access control check for restricted processes
    if (process.visibility === 'restricted') {
      const isSuperAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);
      const isAuthor = userId && process.authorId === userId;
      const hasUserGrant = userId && process.accessGrants.some((g) => g.userId === userId);
      const hasDeptGrant = userDeptId && process.accessGrants.some((g) => g.departmentId === userDeptId);
      const hasRoleGrant = userRole && process.accessGrants.some((g) => g.roleName === userRole);

      if (!isSuperAdmin && !isAuthor && !hasUserGrant && !hasDeptGrant && !hasRoleGrant) {
        return NextResponse.json(
          { error: 'دسترسی محدود: این فرایند فقط برای افراد و واحدهای مجاز قابل مشاهده است.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(mapPrismaProcess(process));
  } catch (error: any) {
    console.error('Error fetching process by ID:', error);
    return NextResponse.json({ error: error.message || 'خطا در دریافت فرایند' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Discord-style bitfield check: Requires EDIT_PROCESSES or ADMINISTRATOR
    if (!hasPermission(userPermissions, Permissions.EDIT_PROCESSES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (EDIT_PROCESSES required)' },
        { status: 403 }
      );
    }

    const { title, description, scope, category, visibility, targetSystem, targetUrl, estimatedMinutes, schedule } = body;

    const updated = await prisma.process.update({
      where: { id },
      data: {
        title,
        description,
        scope,
        category,
        ...(visibility ? { visibility } : {}),
        targetSystem,
        targetUrl,
        estimatedMinutes: Number(estimatedMinutes) || 10,
        ...(schedule !== undefined ? { schedule } : {}),
      },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
          include: { errorGuides: true },
        },
        department: true,
        systemTool: true,
        accessGrants: {
          include: { user: true, department: true },
        },
      },
    });

    return NextResponse.json(mapPrismaProcess(updated));
  } catch (error: any) {
    console.error('Error updating process:', error);
    return NextResponse.json({ error: error.message || 'Failed to update process' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Discord-style bitfield check: Requires DELETE_PROCESSES or ADMINISTRATOR
    if (!hasPermission(userPermissions, Permissions.DELETE_PROCESSES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (DELETE_PROCESSES required)' },
        { status: 403 }
      );
    }

    await prisma.process.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Process deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting process:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete process' }, { status: 500 });
  }
}
