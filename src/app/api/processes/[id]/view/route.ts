import { NextRequest, NextResponse } from 'next/server';
import { recordProcessView } from '@/lib/db-service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Process identifier is required' }, { status: 400 });
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
