import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, maskContact, issueVerificationCode, OtpTooSoonError } from '@/lib/otp';
import { getSmsProvider } from '@/lib/sms';
import { getEmailProvider } from '@/lib/email';
import { getSessionUser } from '@/lib/session';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/contacts/add { contactType: 'phone'|'email', contact }
 * Starts verification for an additional contact. The contact is attached in
 * verify-contact after the OTP is confirmed (with ownership check).
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const contactType = body.contactType === 'email' ? 'email' : 'phone';
    const contact = contactType === 'phone' ? normalizePhone(body.contact) : normalizeEmail(body.contact);
    if (!contact) {
      return NextResponse.json(
        { error: contactType === 'phone' ? 'شماره موبایل معتبر نیست.' : 'نشانی ایمیل معتبر نیست.' },
        { status: 400 }
      );
    }

    const owner = await prisma.user.findFirst({
      where: contactType === 'phone' ? { phone: contact } : { email: contact },
      select: { id: true },
    });
    if (owner && owner.id !== sessionUser.id) {
      return NextResponse.json({ error: 'این مشخصات به حساب دیگری تعلق دارد.' }, { status: 409 });
    }
    if (owner && owner.id === sessionUser.id) {
      return NextResponse.json({ error: 'این مشخصات قبلاً به حساب شما افزوده شده است.' }, { status: 409 });
    }

    const channel = contactType === 'phone' ? 'sms' : 'email';
    let code: string;
    try {
      ({ code } = await issueVerificationCode({ userId: sessionUser.id, channel, identifier: contact }));
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
    void logAuthEvent({ action: 'contact-add', userId: sessionUser.id, identifier: contact, ...auditMeta(req) });

    return NextResponse.json({ channel, masked: maskContact(contact), identifier: contact });
  } catch (error: any) {
    console.error('Error adding contact:', error);
    return NextResponse.json({ error: error.message || 'خطا در افزودن مشخصات تماس' }, { status: 500 });
  }
}
