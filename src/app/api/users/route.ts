import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { normalizePhone, normalizeEmail } from '@/lib/otp';
import { hashPassword, isValidPassword } from '@/lib/password';

function canManageUsers(permissions: number): boolean {
  return (
    hasPermission(permissions, Permissions.MANAGE_USERS) ||
    hasPermission(permissions, Permissions.ADMINISTRATOR)
  );
}

export function toSafeUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    emailVerified: Boolean(u.emailVerifiedAt),
    phoneVerified: Boolean(u.phoneVerifiedAt),
    roleName: u.roleName,
    permissions: u.permissions,
    departmentId: u.departmentId,
    departmentName: u.department?.name || null,
    personnelCode: u.personnelCode || null,
    avatarUrl: u.avatarUrl,
    otpEnabled: Boolean(u.otpEnabled),
    status: u.status,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}

/**
 * GET /api/users — admin user directory (safe fields only, never secrets).
 */
export async function GET(req: NextRequest) {
  try {
    const { permissions } = await resolveApiUser(req);
    if (!canManageUsers(permissions)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_USERS required)' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: { department: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users.map(toSafeUser));
  } catch (error: any) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'خطا در دریافت کاربران' }, { status: 500 });
  }
}

/**
 * POST /api/users { name, contactType, contact, password, roleName?, departmentId?, permissions? }
 * Admin-created account: active immediately, contact pre-verified (the admin
 * vouches for it), Viewer permissions unless specified.
 */
export async function POST(req: NextRequest) {
  try {
    const { permissions } = await resolveApiUser(req);
    if (!canManageUsers(permissions)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (MANAGE_USERS required)' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const contactType = body.contactType === 'email' ? 'email' : 'phone';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2) {
      return NextResponse.json({ error: 'نام کاربر الزامی است.' }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ error: 'گذرواژه باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });
    }

    const contact = contactType === 'phone' ? normalizePhone(body.contact) : normalizeEmail(body.contact);
    if (!contact) {
      return NextResponse.json({ error: 'مشخصات تماس معتبر نیست.' }, { status: 400 });
    }

    const taken = await prisma.user.findFirst({
      where: contactType === 'phone' ? { phone: contact } : { email: contact },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: 'این مشخصات قبلاً ثبت شده است.' }, { status: 409 });
    }

    const roleName = typeof body.roleName === 'string' && body.roleName.trim() ? body.roleName.trim() : 'Viewer';
    const deptId = typeof body.departmentId === 'string' && body.departmentId ? body.departmentId : null;
    if (deptId) {
      const dept = await prisma.department.findUnique({ where: { id: deptId }, select: { id: true } });
      if (!dept) {
        return NextResponse.json({ error: 'سازمان انتخاب‌شده یافت نشد.' }, { status: 400 });
      }
    }

    const created = await prisma.user.create({
      data: {
        name,
        phone: contactType === 'phone' ? contact : null,
        email: contactType === 'email' ? contact : null,
        passwordHash: await hashPassword(password),
        phoneVerifiedAt: contactType === 'phone' ? new Date() : null,
        emailVerifiedAt: contactType === 'email' ? new Date() : null,
        roleName,
        permissions: Number.isInteger(body.permissions) ? body.permissions : Permissions.VIEW_PROCESSES,
        departmentId: deptId,
        status: 'active',
      },
      include: { department: { select: { name: true } } },
    });

    return NextResponse.json(toSafeUser(created), { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'خطا در ایجاد کاربر' }, { status: 500 });
  }
}
