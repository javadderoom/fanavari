import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * Resolves the browser's current account (dashboard persona email) to its
 * database author record. Only accounts with EDIT_PROCESSES or
 * ADMINISTRATOR resolve — anything else gets 403, unknown emails 404.
 * This is the only account /extension-auth will ever offer.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        roleName: true,
        avatarUrl: true,
        permissions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'No author account for this login' }, { status: 404 });
    }

    if (
      !hasPermission(user.permissions, Permissions.EDIT_PROCESSES) &&
      !hasPermission(user.permissions, Permissions.ADMINISTRATOR)
    ) {
      return NextResponse.json({ error: 'This account has no authoring rights' }, { status: 403 });
    }

    const { permissions: _permissions, ...author } = user;
    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error resolving extension session:', error);
    return NextResponse.json({ error: 'Failed to resolve session' }, { status: 500 });
  }
}
