import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, normalizeEmail, verifyCode } from '@/lib/otp';
import { hashPassword, isValidPassword } from '@/lib/password';
import { revokeAllUserSessions } from '@/lib/session';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/password/reset/confirm { identifier, code, newPassword }
 * Consumes a reset OTP and sets a new password. The code must have been
 * issued to the same account (userId binding) — identifier match alone
 * is not enough.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = typeof body.identifier === 'string' ? body.identifier : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!raw || !code) {
      return NextResponse.json({ error: 'مشخصات و کد تأیید الزامی است.' }, { status: 400 });
    }
    if (!isValidPassword(newPassword)) {
      return NextResponse.json({ error: 'گذرواژه جدید باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });
    }

    const channel: 'sms' | 'email' = normalizePhone(raw) ? 'sms' : 'email';
    const result = await verifyCode({ channel, identifier: raw, code });
    if (!result.ok) {
      const messages = {
        expired: 'کد منقضی شده است. دوباره درخواست دهید.',
        mismatch: 'کد واردشده نادرست است.',
        locked: 'به‌دلیل تلاش‌های ناموفق قفل شد. دوباره درخواست دهید.',
        'not-found': 'کدی برای این مشخصات یافت نشد.',
      } as const;
      void logAuthEvent({
        action: 'password-reset-confirm',
        userId: result.userId,
        identifier: raw,
        success: false,
        ...auditMeta(req),
      });
      return NextResponse.json({ error: messages[result.reason || 'not-found'] }, { status: 400 });
    }

    const identifier = channel === 'sms' ? normalizePhone(raw) : normalizeEmail(raw);
    const user = await prisma.user.findFirst({
      where: channel === 'sms' ? { phone: identifier } : { email: identifier },
      select: { id: true, status: true },
    });
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'حساب کاربری معتبر نیست.' }, { status: 403 });
    }
    if (!result.userId || result.userId !== user.id) {
      return NextResponse.json({ error: 'کد برای این حساب صادر نشده است.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    await revokeAllUserSessions(user.id);
    void logAuthEvent({ action: 'password-reset-confirm', userId: user.id, identifier: raw, ...auditMeta(req) });

    return NextResponse.json({ success: true, message: 'گذرواژه با موفقیت تغییر کرد. وارد شوید.' });
  } catch (error: any) {
    console.error('Error confirming password reset:', error);
    return NextResponse.json({ error: 'خطا در بازیابی گذرواژه' }, { status: 500 });
  }
}
