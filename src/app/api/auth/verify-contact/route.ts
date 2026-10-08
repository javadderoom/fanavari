import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, verifyCode } from '@/lib/otp';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';
import { createSession, type SessionUser } from '@/lib/session';

/**
 * POST /api/auth/verify-contact { identifier, code, channel? }
 * Verifies an OTP for a phone/email, stamps the verified flag, activates
 * pending accounts, and logs the user in (session cookie).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = typeof body.identifier === 'string' ? body.identifier : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!rawIdentifier || !code) {
      return NextResponse.json({ error: 'مشخصات و کد تأیید الزامی است.' }, { status: 400 });
    }

    const channel: 'sms' | 'email' =
      body.channel === 'email' ? 'email' : body.channel === 'sms' ? 'sms' : normalizePhone(rawIdentifier) ? 'sms' : 'email';

    const result = await verifyCode({ channel, identifier: rawIdentifier, code });
    if (!result.ok) {
      const messages = {
        expired: 'کد منقضی شده است. کد جدید درخواست کنید.',
        mismatch: 'کد واردشده نادرست است.',
        locked: 'به‌دلیل تلاش‌های ناموفق قفل شد. کد جدید درخواست کنید.',
        'not-found': 'کدی برای این مشخصات یافت نشد.',
      } as const;
      void logAuthEvent({
        action: 'verify',
        userId: result.userId,
        identifier: rawIdentifier,
        success: false,
        ...auditMeta(req),
      });
      return NextResponse.json({ error: messages[result.reason || 'not-found'] }, { status: 400 });
    }

    const identifier = channel === 'sms' ? normalizePhone(rawIdentifier) : normalizeEmail(rawIdentifier);
    const user = result.userId
      ? await prisma.user.findUnique({
          where: { id: result.userId },
          include: { department: { select: { name: true } } },
        })
      : await prisma.user.findFirst({
          where: channel === 'sms' ? { phone: identifier } : { email: identifier },
          include: { department: { select: { name: true } } },
        });

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد.' }, { status: 404 });
    }
    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'این حساب تعلیق شده است.' }, { status: 403 });
    }

    // Attaching a second contact must not steal one owned by another account.
    const currentContact = channel === 'sms' ? user.phone : user.email;
    if (identifier && currentContact !== identifier) {
      const owner = await prisma.user.findFirst({
        where: channel === 'sms' ? { phone: identifier } : { email: identifier },
        select: { id: true },
      });
      if (owner && owner.id !== user.id) {
        return NextResponse.json({ error: 'این مشخصات به حساب دیگری تعلق دارد.' }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        // Attach the contact if it is new (second-contact flow), then stamp it.
        ...(channel === 'sms'
          ? { phone: identifier, phoneVerifiedAt: new Date() }
          : { email: identifier, emailVerifiedAt: new Date() }),
        ...(user.status === 'pending' ? { status: 'active', lastLoginAt: new Date() } : {}),
      },
      include: { department: { select: { name: true } } },
    });

    const payload: SessionUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      emailVerified: Boolean(updated.emailVerifiedAt),
      phoneVerified: Boolean(updated.phoneVerifiedAt),
      roleName: updated.roleName,
      departmentId: updated.departmentId,
      departmentName: updated.department?.name || null,
      permissions: updated.permissions,
      avatarUrl: updated.avatarUrl,
      otpEnabled: updated.otpEnabled,
      status: updated.status,
    };

    const token = await createSession(updated.id, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
    });
    void logAuthEvent({ action: 'verify', userId: updated.id, identifier, ...auditMeta(req) });

    const res = NextResponse.json({ user: payload });
    res.cookies.set('fanavari_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (error: any) {
    console.error('Error verifying contact:', error);
    return NextResponse.json({ error: error.message || 'خطا در تأیید مشخصات' }, { status: 500 });
  }
}
