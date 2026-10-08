import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, maskContact, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { verifyPassword } from '@/lib/password';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';
import { createSession, type SessionUser } from '@/lib/session';

function toPayload(u: any): SessionUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    emailVerified: Boolean(u.emailVerifiedAt),
    phoneVerified: Boolean(u.phoneVerifiedAt),
    roleName: u.roleName,
    departmentId: u.departmentId,
    departmentName: u.department?.name || null,
    permissions: u.permissions,
    avatarUrl: u.avatarUrl,
    otpEnabled: u.otpEnabled,
    status: u.status,
  };
}

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set('fanavari_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * POST /api/auth/login { identifier, password }
 * Password step. Without otpEnabled this completes login; with it, an OTP
 * challenge is issued to the user's verified contact instead of a session.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = typeof body.identifier === 'string' ? body.identifier : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const rl = checkRateLimit(`login:${ip}:${rawIdentifier}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها زیاد است. لطفاً بعداً دوباره امتحان کنید.' },
        { status: 429 }
      );
    }

    const phone = normalizePhone(rawIdentifier);
    const email = normalizeEmail(rawIdentifier);
    if ((!phone && !email) || !password) {
      return NextResponse.json({ error: 'مشخصات ورود نادرست است.' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
      include: { department: { select: { name: true } } },
    });
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      void logAuthEvent({ action: 'login', identifier: rawIdentifier, success: false, ...auditMeta(req) });
      return NextResponse.json({ error: 'مشخصات ورود نادرست است.' }, { status: 401 });
    }
    if (user.status === 'pending') {
      const channel = user.phone ? 'sms' : 'email';
      const contact = (user.phone || user.email) as string;
      return NextResponse.json(
        {
          error: 'حساب شما هنوز فعال نشده است. ابتدا مشخصات تماس را تأیید کنید.',
          needVerification: true,
          channel,
          masked: maskContact(contact),
          identifier: contact,
        },
        { status: 403 }
      );
    }
    if (user.status === 'suspended') {
      void logAuthEvent({ action: 'login', userId: user.id, identifier: rawIdentifier, success: false, ...auditMeta(req) });
      return NextResponse.json({ error: 'این حساب تعلیق شده است.' }, { status: 403 });
    }

    if (user.otpEnabled) {
      const channel = user.phoneVerifiedAt && user.phone ? 'sms' : 'email';
      const contact = (channel === 'sms' ? user.phone : user.email) as string;
      try {
        const { code } = await issueVerificationCode({ userId: user.id, channel, identifier: contact });
        if (channel === 'sms') {
          await getSmsProvider().sendOtp(contact, code);
        } else {
          await getEmailProvider().sendOtp(contact, code);
        }
      } catch (err) {
        if (err instanceof OtpTooSoonError) {
          return NextResponse.json(
            {
              otpRequired: true,
              channel,
              masked: maskContact(contact),
              identifier: contact,
              notice: `کد قبلاً ارسال شده است. ${err.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید.`,
            },
            { status: 200 }
          );
        }
        throw err;
      }
      void logAuthEvent({ action: 'login', userId: user.id, identifier: contact, ...auditMeta(req) });
      return NextResponse.json({
        otpRequired: true,
        channel,
        masked: maskContact(contact),
        identifier: contact,
      });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    void logAuthEvent({ action: 'login', userId: user.id, identifier: rawIdentifier, ...auditMeta(req) });
    const token = await createSession(user.id, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
    });
    const res = NextResponse.json({ user: toPayload(user) });
    setSessionCookie(res, token);
    return res;
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: error.message || 'خطا در ورود' }, { status: 500 });
  }
}
