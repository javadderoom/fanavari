import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, verifyCode } from '@/lib/otp';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';
import { createSession, type SessionUser } from '@/lib/session';

/**
 * POST /api/auth/login/otp { identifier, code }
 * Completes a password+OTP login. The code must be bound to the same user
 * (issued with userId during the password step) to prevent identifier-only
 * confusion.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = typeof body.identifier === 'string' ? body.identifier : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!rawIdentifier || !code) {
      return NextResponse.json({ error: 'مشخصات و کد تأیید الزامی است.' }, { status: 400 });
    }

    const channel: 'sms' | 'email' = normalizePhone(rawIdentifier) ? 'sms' : 'email';
    const result = await verifyCode({ channel, identifier: rawIdentifier, code });
    if (!result.ok) {
      const messages = {
        expired: 'کد منقضی شده است. دوباره وارد شوید تا کد جدید ارسال شود.',
        mismatch: 'کد واردشده نادرست است.',
        locked: 'به‌دلیل تلاش‌های ناموفق قفل شد. دوباره وارد شوید.',
        'not-found': 'کدی برای این مشخصات یافت نشد.',
      } as const;
      void logAuthEvent({
        action: 'login-otp',
        userId: result.userId,
        identifier: rawIdentifier,
        success: false,
        ...auditMeta(req),
      });
      return NextResponse.json({ error: messages[result.reason || 'not-found'] }, { status: 400 });
    }

    const identifier = channel === 'sms' ? normalizePhone(rawIdentifier) : normalizeEmail(rawIdentifier);
    const user = await prisma.user.findFirst({
      where: channel === 'sms' ? { phone: identifier } : { email: identifier },
      include: { department: { select: { name: true } } },
    });
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'حساب کاربری معتبر نیست.' }, { status: 403 });
    }
    if (result.userId && result.userId !== user.id) {
      return NextResponse.json({ error: 'کد برای این حساب صادر نشده است.' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    void logAuthEvent({ action: 'login-otp', userId: user.id, identifier: rawIdentifier, ...auditMeta(req) });
    const token = await createSession(user.id, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
    });

    const payload: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: Boolean(user.emailVerifiedAt),
      phoneVerified: Boolean(user.phoneVerifiedAt),
      roleName: user.roleName,
      departmentId: user.departmentId,
      departmentName: user.department?.name || null,
      permissions: user.permissions,
      avatarUrl: user.avatarUrl,
      otpEnabled: user.otpEnabled,
      status: user.status,
    };

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
    console.error('Error completing OTP login:', error);
    return NextResponse.json({ error: error.message || 'خطا در تکمیل ورود' }, { status: 500 });
  }
}
