import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, isValidPassword } from '@/lib/password';
import { getSessionUser, createSession, revokeAllUserSessions } from '@/lib/session';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/**
 * POST /api/auth/password/change { currentPassword, newPassword }
 * Authenticated password change. Revokes all other sessions and re-issues
 * the current one so the user stays logged in on this device only.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!isValidPassword(newPassword)) {
      return NextResponse.json({ error: 'گذرواژه جدید باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true },
    });
    if (!user?.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: 'گذرواژه فعلی نادرست است.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    await revokeAllUserSessions(user.id);
    void logAuthEvent({ action: 'password-change', userId: user.id, ...auditMeta(req) });
    const token = await createSession(user.id, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set('fanavari_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'خطا در تغییر گذرواژه' }, { status: 500 });
  }
}
