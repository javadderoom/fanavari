import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Check if the caller has permission to view or manage process access grants.
 */
async function canManageProcessAccess(processId: string, userId?: string | null, permissions: number = 0) {
  if (hasPermission(permissions, Permissions.ADMINISTRATOR)) {
    return true;
  }
  if (!userId) return false;

  const proc = await prisma.process.findUnique({
    where: { id: processId },
    select: { authorId: true },
  });

  if (!proc) return false;
  if (proc.authorId && proc.authorId === userId) return true;

  // Check if user has explicit 'edit' grant
  const grant = await prisma.processAccessGrant.findUnique({
    where: {
      processId_userId: {
        processId,
        userId,
      },
    },
  });

  return grant?.permission === 'edit';
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Find process
    const process = await prisma.process.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        accessGrants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                roleName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageProcessAccess(process.id, userId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز: فقط سازنده یا مدیر ارشد امکان مدیریت دسترسی‌ها را دارد.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      processId: process.id,
      visibility: process.visibility || 'public',
      authorId: process.authorId,
      accessGrants: process.accessGrants.map((g) => ({
        id: g.id,
        userId: g.userId,
        permission: g.permission,
        createdAt: g.createdAt,
        user: g.user,
      })),
    });
  } catch (error) {
    console.error('Error fetching process access grants:', error);
    return NextResponse.json({ error: 'خطا در دریافت دسترسی‌ها' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const currentUserId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const process = await prisma.process.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageProcessAccess(process.id, currentUserId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز: تغییر دسترسی تنها توسط سازنده یا مدیر ارشد امکان‌پذیر است.' },
        { status: 403 }
      );
    }

    const { visibility, targetUserId, permission } = body;

    // 1. Update visibility if requested
    if (visibility && ['public', 'restricted'].includes(visibility)) {
      await prisma.process.update({
        where: { id: process.id },
        data: { visibility },
      });
    }

    // 2. Upsert grant for target user if requested
    if (targetUserId) {
      const validPermission = permission === 'edit' ? 'edit' : 'view';

      await prisma.processAccessGrant.upsert({
        where: {
          processId_userId: {
            processId: process.id,
            userId: targetUserId,
          },
        },
        update: {
          permission: validPermission,
        },
        create: {
          processId: process.id,
          userId: targetUserId,
          permission: validPermission,
          grantedById: currentUserId || null,
        },
      });
    }

    // Return updated grants
    const updatedGrants = await prisma.processAccessGrant.findMany({
      where: { processId: process.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const updatedProcess = await prisma.process.findUnique({
      where: { id: process.id },
      select: { visibility: true },
    });

    return NextResponse.json({
      success: true,
      visibility: updatedProcess?.visibility || 'public',
      accessGrants: updatedGrants,
    });
  } catch (error) {
    console.error('Error updating process access:', error);
    return NextResponse.json({ error: 'خطا در ثبت تغییرات دسترسی' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');
    const currentUserId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    if (!targetUserId) {
      return NextResponse.json({ error: 'شناسه کاربر هدف الزامی است.' }, { status: 400 });
    }

    const process = await prisma.process.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageProcessAccess(process.id, currentUserId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    await prisma.processAccessGrant.deleteMany({
      where: {
        processId: process.id,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ success: true, message: 'دسترسی کاربر با موفقیت لغو شد.' });
  } catch (error) {
    console.error('Error deleting process grant:', error);
    return NextResponse.json({ error: 'خطا در حذف دسترسی' }, { status: 500 });
  }
}
