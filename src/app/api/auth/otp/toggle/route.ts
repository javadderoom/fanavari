import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { getSessionUser } from '@/lib/session';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/otp/toggle { enable: boolean, password }
 * Password-confirmed opt in/out of second-factor OTP. Enabling requires at
 * least one verified contact to receive codes.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const enable = body.enable === true;
    const password = typeof body.password === 'string' ? body.password : '';

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true, phoneVerifiedAt: true, emailVerifiedAt: true, otpEnabled: true },
    });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'گذرواژه نادرست است.' }, { status: 400 });
    }

    if (enable && !user.phoneVerifiedAt && !user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'برای فعال‌سازی ورود دومرحله‌ای ابتدا یک شماره یا ایمیل را تأیید کنید.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { otpEnabled: enable },
      select: { otpEnabled: true },
    });
    void logAuthEvent({ action: 'otp-toggle', userId: user.id, ...auditMeta(req) });

    return NextResponse.json({ success: true, otpEnabled: updated.otpEnabled });
  } catch (error: any) {
    console.error('Error toggling OTP:', error);
    return NextResponse.json({ error: 'خطا در تغییر وضعیت ورود دومرحله‌ای' }, { status: 500 });
  }
}
