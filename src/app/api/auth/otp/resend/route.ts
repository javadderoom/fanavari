import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, maskContact, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/auth/otp/resend { identifier, channel? }
 * Re-issues a verification code with the standard 60s cooldown (also a soft
 * spend control for SMS). Binds to the owning account when one exists.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`otp-resend:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها زیاد است. لطفاً بعداً دوباره امتحان کنید.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.identifier === 'string' ? body.identifier : '';
    const channel: 'sms' | 'email' =
      body.channel === 'email' ? 'email' : body.channel === 'sms' ? 'sms' : normalizePhone(raw) ? 'sms' : 'email';
    const identifier = channel === 'sms' ? normalizePhone(raw) : normalizeEmail(raw);
    if (!identifier) {
      return NextResponse.json({ error: 'مشخصات معتبر نیست.' }, { status: 400 });
    }

    const owner = await prisma.user.findFirst({
      where: channel === 'sms' ? { phone: identifier } : { email: identifier },
      select: { id: true },
    });

    try {
      const { code } = await issueVerificationCode({
        userId: owner?.id || null,
        channel,
        identifier,
      });
      if (channel === 'sms') {
        await getSmsProvider().sendOtp(identifier, code);
      } else {
        await getEmailProvider().sendOtp(identifier, code);
      }
    } catch (err) {
      if (err instanceof OtpTooSoonError) {
        return NextResponse.json(
          { error: `کد قبلاً ارسال شده است. ${err.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید.` },
          { status: 429 }
        );
      }
      throw err;
    }

    return NextResponse.json({ success: true, channel, masked: maskContact(identifier) });
  } catch (error: any) {
    console.error('Error resending OTP:', error);
    return NextResponse.json({ error: 'خطا در ارسال مجدد کد' }, { status: 500 });
  }
}
