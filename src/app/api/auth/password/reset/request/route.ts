import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/auth/password/reset/request { identifier }
 * Always returns generic success (no account enumeration). Sends a reset OTP
 * only when an active account owns the identifier.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`pw-reset:${ip}`, 5, 60 * 60 * 1000);
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
    const GENERIC_OK = { success: true, message: 'اگر حسابی با این مشخصات وجود داشته باشد، کد بازیابی ارسال شد.' };
    if (!phone && !email) return NextResponse.json(GENERIC_OK);

    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
      select: { id: true, phone: true, email: true, phoneVerifiedAt: true, emailVerifiedAt: true, status: true },
    });
    if (!user || user.status !== 'active') return NextResponse.json(GENERIC_OK);

    // Prefer a verified contact; fall back to any owned contact.
    const channel: 'sms' | 'email' =
      user.phone && (user.phoneVerifiedAt || !user.email) ? 'sms' : 'email';
    const contact = (channel === 'sms' ? user.phone : user.email) as string;

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

    return NextResponse.json(GENERIC_OK);
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json({ error: 'خطا در درخواست بازیابی' }, { status: 500 });
  }
}
