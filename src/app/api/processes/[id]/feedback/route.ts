import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveApiUser } from '@/lib/api-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'شناسه فرایند الزامی است.' }, { status: 400 });
    }

    // Rate limiting: max 10 feedback submissions per IP/minute to prevent spam
    const ip = getClientIp(req);
    const rl = checkRateLimit(`feedback:${ip}`, 10, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های ثبت بازخورد بیش از حد مجاز است.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { isHelpful, reason, comment, stepKey } = body;

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: 'لطفاً وضعیت مفید بودن را مشخص فرمایید.' }, { status: 400 });
    }

    // Find the target process
    const process = await prisma.process.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد.' }, { status: 404 });
    }

    const { dbUserId } = await resolveApiUser(req);

    const feedback = await prisma.processFeedback.create({
      data: {
        processId: process.id,
        userId: dbUserId || null,
        isHelpful,
        reason: typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 100) : null,
        comment: typeof comment === 'string' && comment.trim() ? comment.trim().slice(0, 1000) : null,
        stepKey: typeof stepKey === 'string' && stepKey.trim() ? stepKey.trim().slice(0, 50) : null,
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording process feedback:', error);
    return NextResponse.json({ error: 'خطای سرور در ثبت بازخورد' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'شناسه فرایند الزامی است.' }, { status: 400 });
    }

    const process = await prisma.process.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!process) {
      return NextResponse.json({ error: 'فرایند یافت نشد.' }, { status: 404 });
    }

    const [helpfulCount, unhelpfulCount] = await Promise.all([
      prisma.processFeedback.count({
        where: { processId: process.id, isHelpful: true },
      }),
      prisma.processFeedback.count({
        where: { processId: process.id, isHelpful: false },
      }),
    ]);

    const total = helpfulCount + unhelpfulCount;
    const satisfactionRate = total > 0 ? Math.round((helpfulCount / total) * 100) : 100;

    return NextResponse.json({
      success: true,
      stats: {
        helpfulCount,
        unhelpfulCount,
        total,
        satisfactionRate,
      },
    });
  } catch (error) {
    console.error('Error fetching process feedback stats:', error);
    return NextResponse.json({ error: 'خطای سرور در بازیابی آمار بازخورد' }, { status: 500 });
  }
}
