import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mintExtensionToken } from '@/lib/extension-auth';
import { Permissions, hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * Issues a browser-login token for the authoring Chrome extension.
 * Body: { userId: string }
 * Note: the web app uses persona switching without passwords, so issuance
 * is gated on the target user already holding authoring rights
 * (EDIT_PROCESSES or ADMINISTRATOR). Returns the raw token exactly once.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, roleName: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      !hasPermission(user.permissions, Permissions.EDIT_PROCESSES) &&
      !hasPermission(user.permissions, Permissions.ADMINISTRATOR)
    ) {
      return NextResponse.json(
        { error: 'User lacks process authoring rights (EDIT_PROCESSES required)' },
        { status: 403 }
      );
    }

    const token = await mintExtensionToken(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
      },
    });
  } catch (error) {
    console.error('Error issuing extension token:', error);
    return NextResponse.json({ error: 'Failed to issue token' }, { status: 500 });
  }
}
