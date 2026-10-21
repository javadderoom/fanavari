import { NextRequest, NextResponse } from 'next/server';
import { recordProcessView, getProcessViewStats } from '@/lib/db-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isBotRequest, BotClientPayload } from '@/lib/bot-detector';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Process identifier is required' }, { status: 400 });
    }

    // Safely parse optional client verification payload
    const body: BotClientPayload = await req.json().catch(() => ({}));

    // 1. Multi-layered bot and crawler detection
    const botCheck = isBotRequest(req, body);
    if (botCheck.isBot) {
      // Gracefully return current viewCount without incrementing the database
      const currentStats = await getProcessViewStats(id);
      return NextResponse.json({
        success: true,
        viewCount: currentStats?.viewCount ?? 0,
        isPopular: currentStats?.isPopular ?? false,
        counted: false,
        filtered: true,
        reason: botCheck.reason,
      });
    }

    const ip = getClientIp(req);

    // 2. Global burst rate limit: Max 60 requests per IP/minute across the site
    const globalRl = checkRateLimit(`view_burst:${ip}`, 60, 60 * 1000);
    if (!globalRl.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های ثبت بازدید بیش از حد مجاز است.' },
        { status: 429, headers: { 'Retry-After': String(globalRl.retryAfterSeconds) } }
      );
    }

    // 3. Sliding Window Deduplication: 1 view increment per IP per process every 30 minutes
    const dedupeRl = checkRateLimit(`view_dedupe:${ip}:${id}`, 1, 30 * 60 * 1000);
    if (!dedupeRl.allowed) {
      // Repeat view within 30 minutes: return current stats without incrementing
      const currentStats = await getProcessViewStats(id);
      return NextResponse.json({
        success: true,
        viewCount: currentStats?.viewCount ?? 0,
        isPopular: currentStats?.isPopular ?? false,
        counted: false,
        deduplicated: true,
      });
    }

    // 4. Clean verified human view: atomically increment in database
    const result = await recordProcessView(id);
    if (!result) {
      return NextResponse.json({ error: 'فرایند یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      viewCount: result.viewCount,
      isPopular: result.isPopular,
      counted: true,
    });
  } catch (error) {
    console.error('Error in recordProcessView API:', error);
    return NextResponse.json({ error: 'خطای سرور در ثبت بازدید' }, { status: 500 });
  }
}
