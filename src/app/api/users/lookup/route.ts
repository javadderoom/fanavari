import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Privacy-Preserving Zero-Leak User Lookup API.
 * Strict rules:
 * 1. Directory dumps are strictly prohibited: Requires minimum 3 search characters.
 * 2. Capped at 5 results maximum.
 * 3. Sanitized payload only (id, name, roleName, avatarUrl, masked email).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (query.length < 3) {
      return NextResponse.json(
        { error: 'حداقل ۳ کاراکتر برای جستجوی پرسنل الزامی است.' },
        { status: 400 }
      );
    }

    const matchedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        roleName: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    // Mask emails to prevent harvesting
    const sanitized = matchedUsers.map((u) => {
      const parts = u.email.split('@');
      const maskedLocal = parts[0].length > 2
        ? parts[0].substring(0, 2) + '***'
        : parts[0] + '***';
      const maskedEmail = `${maskedLocal}@${parts[1] || 'domain'}`;

      return {
        id: u.id,
        name: u.name,
        roleName: u.roleName,
        avatarUrl: u.avatarUrl,
        maskedEmail,
      };
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error in secure user lookup:', error);
    return NextResponse.json(
      { error: 'خطا در جستجوی کاربران' },
      { status: 500 }
    );
  }
}
