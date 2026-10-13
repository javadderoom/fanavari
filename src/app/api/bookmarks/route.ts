import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveApiUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { dbUserId } = await resolveApiUser(req);

    if (!dbUserId) {
      // Guest / unauthenticated users store bookmarks in localStorage
      return NextResponse.json({ processIds: [] });
    }

    const bookmarks = await prisma.userBookmark.findMany({
      where: { userId: dbUserId },
      select: { processId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      processIds: bookmarks.map((b) => b.processId),
    });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return NextResponse.json({ error: 'خطا در بارگذاری نشان‌شده‌ها' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dbUserId } = await resolveApiUser(req);

    if (!dbUserId) {
      return NextResponse.json(
        { error: 'برای ذخیره ابری نشان‌شده‌ها لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { processId, processIds } = body as { processId?: string; processIds?: string[] };

    // Batch sync (e.g. merging guest localStorage bookmarks on login)
    if (Array.isArray(processIds)) {
      if (processIds.length === 0) {
        return NextResponse.json({ success: true, count: 0, processIds: [] });
      }

      const validProcesses = await prisma.process.findMany({
        where: { id: { in: processIds } },
        select: { id: true },
      });
      const validIds = validProcesses.map((p) => p.id);

      if (validIds.length > 0) {
        await prisma.userBookmark.createMany({
          data: validIds.map((id) => ({
            userId: dbUserId,
            processId: id,
          })),
          skipDuplicates: true,
        });
      }

      return NextResponse.json({
        success: true,
        count: validIds.length,
        processIds: validIds,
      });
    }

    // Single bookmark addition / toggle
    if (!processId || typeof processId !== 'string') {
      return NextResponse.json({ error: 'شناسه فرایند مشخص نشده است.' }, { status: 400 });
    }

    const process = await prisma.process.findFirst({
      where: { OR: [{ id: processId }, { slug: processId }] },
      select: { id: true },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد.' }, { status: 404 });
    }

    await prisma.userBookmark.upsert({
      where: {
        userId_processId: {
          userId: dbUserId,
          processId: process.id,
        },
      },
      create: {
        userId: dbUserId,
        processId: process.id,
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      bookmarked: true,
      processId: process.id,
    });
  } catch (error) {
    console.error('Error saving user bookmark:', error);
    return NextResponse.json({ error: 'خطا در ذخیره نشان‌شده' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { dbUserId } = await resolveApiUser(req);

    if (!dbUserId) {
      return NextResponse.json(
        { error: 'برای مدیریت نشان‌شده‌ها لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    let processId = req.nextUrl.searchParams.get('processId');
    if (!processId) {
      const body = await req.json().catch(() => ({}));
      processId = body?.processId;
    }

    if (!processId || typeof processId !== 'string') {
      return NextResponse.json({ error: 'شناسه فرایند مشخص نشده است.' }, { status: 400 });
    }

    // Resolve process ID (if slug was provided)
    const process = await prisma.process.findFirst({
      where: { OR: [{ id: processId }, { slug: processId }] },
      select: { id: true },
    });

    const targetId = process ? process.id : processId;

    await prisma.userBookmark.deleteMany({
      where: {
        userId: dbUserId,
        processId: targetId,
      },
    });

    return NextResponse.json({
      success: true,
      removed: true,
      processId: targetId,
    });
  } catch (error) {
    console.error('Error removing user bookmark:', error);
    return NextResponse.json({ error: 'خطا در حذف نشان‌شده' }, { status: 500 });
  }
}
