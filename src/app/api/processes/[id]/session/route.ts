import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Load saved session for a process
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || null;

    if (!userId) {
      return NextResponse.json({ session: null });
    }

    const session = await prisma.savedSession.findFirst({
      where: {
        processId: id,
        userId: userId,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error('Error fetching process session:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Save/upsert execution session for a process
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.userId || null;

    if (!userId) {
      // For anonymous users, client stores in localStorage
      return NextResponse.json({ success: true, localOnly: true });
    }

    const { currentStepKey, completedSteps, scratchpadData } = body;

    const existing = await prisma.savedSession.findFirst({
      where: {
        processId: id,
        userId: userId,
      },
    });

    let session;
    if (existing) {
      session = await prisma.savedSession.update({
        where: { id: existing.id },
        data: {
          currentStepKey,
          completedSteps,
          scratchpadData,
        },
      });
    } else {
      session = await prisma.savedSession.create({
        data: {
          processId: id,
          userId,
          currentStepKey,
          completedSteps,
          scratchpadData,
        },
      });
    }

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    console.error('Error saving process session:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
