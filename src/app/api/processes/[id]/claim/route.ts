import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { claimToken } = body;
    const currentUserId = req.headers.get('x-user-id');

    if (!claimToken || !claimToken.trim()) {
      return NextResponse.json({ error: 'توکن دعوت ارسال نشده است.' }, { status: 400 });
    }

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'جهت فعال‌سازی دسترسی، ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const process = await prisma.process.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    // Find grant with matching claimToken
    const tokenGrant = await prisma.processAccessGrant.findFirst({
      where: {
        processId: process.id,
        claimToken: claimToken.trim(),
      },
    });

    if (!tokenGrant) {
      return NextResponse.json({ error: 'لینک دعوت نامعتبر است یا باطل شده است.' }, { status: 404 });
    }

    // Check expiration
    if (tokenGrant.claimExpiresAt && new Date(tokenGrant.claimExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'مهلت استفاده از این لینک دعوت به پایان رسیده است.' }, { status: 410 });
    }

    // Bind individual access grant to current user
    const existingUserGrant = await prisma.processAccessGrant.findFirst({
      where: {
        processId: process.id,
        userId: currentUserId,
      },
    });

    if (!existingUserGrant) {
      await prisma.processAccessGrant.create({
        data: {
          processId: process.id,
          userId: currentUserId,
          permission: tokenGrant.permission || 'view',
          grantedById: tokenGrant.grantedById || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'دسترسی شما به این فرایند با موفقیت فعال گردید.',
      permission: tokenGrant.permission,
    });
  } catch (error) {
    console.error('Error claiming process access token:', error);
    return NextResponse.json({ error: 'خطا در ثبت توکن دسترسی' }, { status: 500 });
  }
}
