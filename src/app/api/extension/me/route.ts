import { NextRequest, NextResponse } from 'next/server';
import { resolveExtensionUser } from '@/lib/extension-auth';

export const dynamic = 'force-dynamic';

/** Verifies an extension token and returns the linked author profile. */
export async function GET(req: NextRequest) {
  try {
    const user = await resolveExtensionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or missing extension token' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error verifying extension token:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
