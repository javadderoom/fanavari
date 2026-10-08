import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, maskContact, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { hashPassword, isValidPassword } from '@/lib/password';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/signup { name, contactType: 'phone'|'email', contact, password }
 * Creates a pending user and sends a verification OTP. No session is issued —
 * the account activates after the signup contact is verified.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها زیاد است. لطفاً بعداً دوباره امتحان کنید.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const contactType = body.contactType === 'email' ? 'email' : 'phone';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2) {
      return NextResponse.json({ error: 'نام و نام خانوادگی الزامی است.' }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ error: 'گذرواژه باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });
    }

    const contact = contactType === 'phone' ? normalizePhone(body.contact) : normalizeEmail(body.contact);
    if (!contact) {
      return NextResponse.json(
        { error: contactType === 'phone' ? 'شماره موبایل معتبر نیست.' : 'نشانی ایمیل معتبر نیست.' },
        { status: 400 }
      );
    }

    const taken = await prisma.user.findFirst({
      where: contactType === 'phone' ? { phone: contact } : { email: contact },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: 'این مشخصات قبلاً ثبت شده است. وارد شوید یا گذرواژه را بازیابی کنید.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone: contactType === 'phone' ? contact : null,
        email: contactType === 'email' ? contact : null,
        passwordHash: await hashPassword(password),
        roleName: 'Viewer',
        status: 'pending',
      },
      select: { id: true },
    });

    const channel = contactType === 'phone' ? 'sms' : 'email';
    let code: string;
    try {
      ({ code } = await issueVerificationCode({ userId: user.id, channel, identifier: contact }));
    } catch (err) {
      if (err instanceof OtpTooSoonError) {
        return NextResponse.json(
          { error: `کد قبلاً ارسال شده است. ${err.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید.` },
          { status: 429 }
        );
      }
      throw err;
    }

    if (channel === 'sms') {
      await getSmsProvider().sendOtp(contact, code);
    } else {
      await getEmailProvider().sendOtp(contact, code);
    }

    void logAuthEvent({ action: 'signup', userId: user.id, identifier: contact, ...auditMeta(req) });

    return NextResponse.json(
      { pendingUserId: user.id, channel, masked: maskContact(contact) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in signup:', error);
    return NextResponse.json({ error: error.message || 'خطا در ثبت‌نام' }, { status: 500 });
  }
}
