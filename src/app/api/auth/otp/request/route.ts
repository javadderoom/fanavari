import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, maskContact, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/otp/request { identifier }
 * Passwordless login challenge: sends a one-time code to a VERIFIED contact
 * of an active account. Unknown or unverified identifiers get the same
 * generic response (no account enumeration); the code entry step then
 * completes via POST /api/auth/login/otp.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`otp-login:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها زیاد است. لطفاً بعداً دوباره امتحان کنید.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.identifier === 'string' ? body.identifier : '';
    const phone = normalizePhone(raw);
    const email = normalizeEmail(raw);
    const GENERIC_OK = { sent: true, message: 'اگر حسابی با این مشخصات وجود داشته باشد، کد ورود ارسال شد.' };
    if (!phone && !email) return NextResponse.json(GENERIC_OK);

    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
      select: {
        id: true,
        phone: true,
        email: true,
        phoneVerifiedAt: true,
        emailVerifiedAt: true,
        status: true,
      },
    });

    const verified = user && user.status === 'active' && (
      (phone && user.phoneVerifiedAt) ||
      (email && user.emailVerifiedAt)
    );
    if (!verified || !user) return NextResponse.json(GENERIC_OK);

    const channel: 'sms' | 'email' = phone ? 'sms' : 'email';
    const contact = (phone ? user.phone : user.email) as string;

    try {
      const { code } = await issueVerificationCode({ userId: user.id, channel, identifier: contact });
      if (channel === 'sms') {
        await getSmsProvider().sendOtp(contact, code);
      } else {
        await getEmailProvider().sendOtp(contact, code);
      }
    } catch (err) {
      if (!(err instanceof OtpTooSoonError)) throw err;
      // A recent code is still valid — nothing more to do.
    }

    void logAuthEvent({ action: 'login', userId: user.id, identifier: contact, ...auditMeta(req) });

    return NextResponse.json({
      ...GENERIC_OK,
      channel,
      masked: maskContact(contact),
      identifier: contact,
    });
  } catch (error: any) {
    console.error('Error requesting OTP login:', error);
    return NextResponse.json({ error: 'خطا در ارسال کد ورود' }, { status: 500 });
  }
}
