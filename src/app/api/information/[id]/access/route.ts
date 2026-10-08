import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveDbUserId } from '@/lib/db-service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Check if the caller has permission to view or manage information post access grants.
 */
async function canManageInformationAccess(postId: string, userId?: string | null, permissions: number = 0) {
  if (
    hasPermission(permissions, Permissions.ADMINISTRATOR) ||
    hasPermission(permissions, Permissions.MANAGE_INFORMATION)
  ) {
    return true;
  }
  if (!userId) return false;

  const post = await prisma.informationPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) return false;
  if (post.authorId && post.authorId === userId) return true;

  // Check if user has explicit 'edit' grant
  const grant = await prisma.informationAccessGrant.findFirst({
    where: {
      postId,
      userId,
      permission: 'edit',
    },
  });

  return Boolean(grant);
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Find information post
    const post = await prisma.informationPost.findFirst({
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
            department: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'مطلب یا بخشنامه یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageInformationAccess(post.id, userId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز: فقط نگارنده، مدیر اطلاعات یا مدیر ارشد امکان مدیریت دسترسی‌ها را دارد.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      postId: post.id,
      visibility: post.visibility || 'public',
      authorId: post.authorId,
      accessGrants: post.accessGrants.map((g) => ({
        id: g.id,
        postId: g.postId,
        userId: g.userId,
        departmentId: g.departmentId,
        department: g.department,
        roleName: g.roleName,
        claimToken: g.claimToken,
        claimExpiresAt: g.claimExpiresAt,
        permission: g.permission,
        createdAt: g.createdAt,
        user: g.user,
      })),
    });
  } catch (error) {
    console.error('Error fetching information access grants:', error);
    return NextResponse.json({ error: 'خطا در دریافت دسترسی‌ها' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const currentUserId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');
    // Demo persona ids are not real FK targets — resolve or fall back to null.
    const grantedByDbId = await resolveDbUserId(currentUserId);

    const post = await prisma.informationPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json({ error: 'مطلب یا بخشنامه یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageInformationAccess(post.id, currentUserId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز: تغییر دسترسی تنها توسط نگارنده یا مدیر ارشد امکان‌پذیر است.' },
        { status: 403 }
      );
    }

    const { 
      visibility, 
      targetUserId, 
      targetDepartmentId, 
      targetRoleName, 
      generateClaim, 
      expiresInDays,
      permission 
    } = body;

    const validPermission = permission === 'edit' ? 'edit' : 'view';

    // 1. Update visibility if requested
    if (visibility && ['public', 'restricted'].includes(visibility)) {
      await prisma.informationPost.update({
        where: { id: post.id },
        data: { visibility },
      });
    }

    // 2. Individual User Grant
    if (targetUserId) {
      const existing = await prisma.informationAccessGrant.findFirst({
        where: { postId: post.id, userId: targetUserId },
      });

      if (existing) {
        await prisma.informationAccessGrant.update({
          where: { id: existing.id },
          data: { permission: validPermission },
        });
      } else {
        await prisma.informationAccessGrant.create({
          data: {
            postId: post.id,
            userId: targetUserId,
            permission: validPermission,
            grantedById: grantedByDbId,
          },
        });
      }
    }

    // 3. Department-Level Grant
    if (targetDepartmentId) {
      const existing = await prisma.informationAccessGrant.findFirst({
        where: { postId: post.id, departmentId: targetDepartmentId },
      });

      if (existing) {
        await prisma.informationAccessGrant.update({
          where: { id: existing.id },
          data: { permission: validPermission },
        });
      } else {
        await prisma.informationAccessGrant.create({
          data: {
            postId: post.id,
            departmentId: targetDepartmentId,
            permission: validPermission,
            grantedById: grantedByDbId,
          },
        });
      }
    }

    // 4. Role-Based Grant (RBAC)
    if (targetRoleName && targetRoleName.trim()) {
      const trimmedRole = targetRoleName.trim();
      const existing = await prisma.informationAccessGrant.findFirst({
        where: { postId: post.id, roleName: trimmedRole },
      });

      if (existing) {
        await prisma.informationAccessGrant.update({
          where: { id: existing.id },
          data: { permission: validPermission },
        });
      } else {
        await prisma.informationAccessGrant.create({
          data: {
            postId: post.id,
            roleName: trimmedRole,
            permission: validPermission,
            grantedById: grantedByDbId,
          },
        });
      }
    }

    // 5. Generate Secure Claim Link Token
    if (generateClaim) {
      const token = `clm_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
      const days = typeof expiresInDays === 'number' && expiresInDays > 0 ? expiresInDays : 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      await prisma.informationAccessGrant.create({
        data: {
          postId: post.id,
          claimToken: token,
          claimExpiresAt: expiresAt,
          permission: validPermission,
          grantedById: grantedByDbId,
        },
      });
    }

    // Return updated grants
    const updatedGrants = await prisma.informationAccessGrant.findMany({
      where: { postId: post.id },
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
        department: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const updatedPost = await prisma.informationPost.findUnique({
      where: { id: post.id },
      select: { visibility: true },
    });

    return NextResponse.json({
      success: true,
      visibility: updatedPost?.visibility || 'public',
      accessGrants: updatedGrants,
    });
  } catch (error) {
    console.error('Error updating information access:', error);
    return NextResponse.json({ error: 'خطا در ثبت تغییرات دسترسی' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const grantId = searchParams.get('grantId');
    const targetUserId = searchParams.get('userId');
    const targetDepartmentId = searchParams.get('departmentId');
    const targetRoleName = searchParams.get('roleName');
    const currentUserId = req.headers.get('x-user-id');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const post = await prisma.informationPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json({ error: 'مطلب یا بخشنامه یافت نشد' }, { status: 404 });
    }

    const hasAccess = await canManageInformationAccess(post.id, currentUserId, userPermissions);
    if (!hasAccess) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    if (grantId) {
      await prisma.informationAccessGrant.deleteMany({
        where: { id: grantId, postId: post.id },
      });
    } else if (targetUserId) {
      await prisma.informationAccessGrant.deleteMany({
        where: { postId: post.id, userId: targetUserId },
      });
    } else if (targetDepartmentId) {
      await prisma.informationAccessGrant.deleteMany({
        where: { postId: post.id, departmentId: targetDepartmentId },
      });
    } else if (targetRoleName) {
      await prisma.informationAccessGrant.deleteMany({
        where: { postId: post.id, roleName: targetRoleName },
      });
    } else {
      return NextResponse.json({ error: 'پارامتر حذف معتبر ارسال نشده است.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'دسترسی با موفقیت لغو شد.' });
  } catch (error) {
    console.error('Error deleting information grant:', error);
    return NextResponse.json({ error: 'خطا در حذف دسترسی' }, { status: 500 });
  }
}
