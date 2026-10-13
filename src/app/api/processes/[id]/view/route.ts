import { NextRequest, NextResponse } from 'next/server';
import { recordProcessView } from '@/lib/db-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Process identifier is required' }, { status: 400 });
    }

    // Rate limiting: max 30 view increments per IP/minute to prevent manipulation
    const ip = getClientIp(req);
    const rl = checkRateLimit(`view:${ip}:${id}`, 30, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های ثبت بازدید بیش از حد مجاز است.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const result = await recordProcessView(id);
    if (!result) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      viewCount: result.viewCount,
      isPopular: result.isPopular,
    });
  } catch (error) {
    console.error('Error in recordProcessView API:', error);
    return NextResponse.json({ error: 'خطای سرور در ثبت بازدید' }, { status: 500 });
  }
}
