import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { hashPassword } from '@/lib/password';
import { revokeAllUserSessions } from '@/lib/session';
import { toSafeUser } from '../route';

function canManageUsers(permissions: number): boolean {
  return (
    hasPermission(permissions, Permissions.MANAGE_USERS) ||
    hasPermission(permissions, Permissions.ADMINISTRATOR)
  );
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/users/[id] { name?, roleName?, departmentId?, permissions?, status?, personnelCode? }
 * Admin edits identity/assignment. Self-suspend and self-demotion from
 * Administrator are blocked (lockout prevention).
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const caller = await resolveApiUser(req);
    if (!canManageUsers(caller.permissions)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_USERS required)' },
        { status: 403 }
      );
    }
    const callerDbId = caller.dbUserId || caller.id;

    const { id } = await params;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'کاربر یافت نشد.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: any = {};

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length < 2) {
        return NextResponse.json({ error: 'نام باید حداقل ۲ کاراکتر باشد.' }, { status: 400 });
      }
      data.name = name;
    }
    if (body.roleName !== undefined) {
      const roleName = typeof body.roleName === 'string' ? body.roleName.trim() : '';
      if (!roleName) {
        return NextResponse.json({ error: 'نقش سازمانی الزامی است.' }, { status: 400 });
      }
      data.roleName = roleName;
    }
    if (body.departmentId !== undefined) {
      const deptId = typeof body.departmentId === 'string' && body.departmentId ? body.departmentId : null;
      if (deptId) {
        const dept = await prisma.department.findUnique({ where: { id: deptId }, select: { id: true } });
        if (!dept) {
          return NextResponse.json({ error: 'سازمان انتخاب‌شده یافت نشد.' }, { status: 400 });
        }
      }
      data.departmentId = deptId;
    }
    if (body.permissions !== undefined) {
      if (!Number.isInteger(body.permissions) || body.permissions < 0) {
        return NextResponse.json({ error: 'بیت دسترسی معتبر نیست.' }, { status: 400 });
      }
      if (target.id === callerDbId && !hasPermission(body.permissions, Permissions.ADMINISTRATOR)) {
        return NextResponse.json({ error: 'نمی‌توانید دسترسی مدیرکل خودتان را سلب کنید.' }, { status: 400 });
      }
      data.permissions = body.permissions;
    }
    if (body.status !== undefined) {
      if (!['pending', 'active', 'suspended'].includes(body.status)) {
        return NextResponse.json({ error: 'وضعیت معتبر نیست.' }, { status: 400 });
      }
      if (target.id === callerDbId && body.status === 'suspended') {
        return NextResponse.json({ error: 'نمی‌توانید حساب خودتان را تعلیق کنید.' }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.personnelCode !== undefined) {
      data.personnelCode =
        typeof body.personnelCode === 'string' && body.personnelCode.trim() ? body.personnelCode.trim() : null;
    }
    if (body.password !== undefined && body.password !== '') {
      const pw = typeof body.password === 'string' ? body.password : '';
      if (pw.length < 8) {
        return NextResponse.json({ error: 'گذرواژه جدید باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });
      }
      data.passwordHash = await hashPassword(pw);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'فیلدی برای به‌روزرسانی ارسال نشده است.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data,
      include: { department: { select: { name: true } } },
    });

    // A forced password reset kicks the user out everywhere.
    if (data.passwordHash) {
      await revokeAllUserSessions(target.id);
    }

    return NextResponse.json(toSafeUser(updated));
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'خطا در ویرایش کاربر' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id] — hard delete. Grants/sessions/codes CASCADE,
 * authored content is unlinked (SET NULL). Self-delete is blocked.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const caller = await resolveApiUser(req);
    if (!canManageUsers(caller.permissions)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_USERS required)' },
        { status: 403 }
      );
    }
    const callerDbId = caller.dbUserId || caller.id;

    const { id } = await params;
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!target) {
      return NextResponse.json({ error: 'کاربر یافت نشد.' }, { status: 404 });
    }
    if (target.id === callerDbId) {
      return NextResponse.json({ error: 'نمی‌توانید حساب خودتان را حذف کنید.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: target.id } });

    return NextResponse.json({ success: true, message: `کاربر «${target.name}» حذف شد.` });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'خطا در حذف کاربر' }, { status: 500 });
  }
}
