import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, getSessionUser } from '@/lib/session';
import { logAuthEvent, auditMeta } from '@/lib/auth-audit';

/** POST /api/auth/logout — revokes the current session and clears the cookie. */
export async function POST(req: NextRequest) {
  try {
    const who = await getSessionUser(req).catch(() => null);
    await revokeSession(req);
    if (who) {
      void logAuthEvent({ action: 'logout', userId: who.id, ...auditMeta(req) });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set('fanavari_session', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  } catch (error: any) {
    console.error('Error in logout:', error);
    return NextResponse.json({ error: 'خطا در خروج' }, { status: 500 });
  }
}
