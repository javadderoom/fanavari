import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

/** GET /api/auth/me — resolves the session cookie to the current user. */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in auth/me:', error);
    return NextResponse.json({ error: 'خطا در شناسایی نشست' }, { status: 500 });
  }
}
