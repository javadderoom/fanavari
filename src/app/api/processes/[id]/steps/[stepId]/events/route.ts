import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveExtensionUser, canAuthor } from '@/lib/extension-auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>;
}

export interface RecordedEvent {
  type: 'click' | 'input' | 'navigation';
  /** Clicked element text or input field label (never a password value). */
  label: string;
  /** Typed value — only present when the author explicitly approved values. */
  value?: string;
  /** Element tag, e.g. button, input, a. */
  tag?: string;
  /** Page URL where the event happened (origin only, no query). */
  page?: string;
  /** Unix ms timestamp. */
  at: number;
}

function sanitizeLine(text: string, max = 140): string {
  return (text || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

/**
 * Cleans a click label for use as a menu-path segment. The MenuPathDisplay
 * parser treats >, ›, », → as delimiters, so those are neutralized to keep
 * one click == one box.
 */
function sanitizeMenuSegment(text: string, max = 80): string {
  return sanitizeLine(text, max)
    .replace(/[>›»→]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatEventsMarkdown(events: RecordedEvent[]): string {
  const lines = events.map((ev, idx) => {
    const label = sanitizeLine(ev.label) || '(بدون عنوان)';
    const tag = ev.tag ? ` \`${ev.tag}\`` : '';
    if (ev.type === 'input') {
      const valuePart = ev.value ? ` ← مقدار: \`${sanitizeLine(ev.value, 80)}\`` : '';
      return `${idx + 1}. ورود اطلاعات در «${label}»${tag}${valuePart}`;
    }
    if (ev.type === 'navigation') {
      return `${idx + 1}. رفتن به «${label}»`;
    }
    return `${idx + 1}. کلیک روی «${label}»${tag}`;
  });
  return lines.join('\n');
}

/**
 * Appends interaction-recorder events from the authoring extension to a step.
 * Clicks extend the step's hierarchical menu path (`targetMenuPath`,
 * rendered as «مسیر گام‌به‌گام کلیک در منوی سامانه» boxes); input and
 * navigation events are appended as reviewable draft markdown to the step
 * instructions («دستورالعمل اجرایی و شرح تفصیلی گام»).
 * Auth: `x-extension-token` (or dashboard `x-user-id` headers).
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await resolveExtensionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canAuthor(user)) {
      return NextResponse.json({ error: 'Forbidden: EDIT_PROCESSES required' }, { status: 403 });
    }

    const { id, stepId } = await params;
    const body = await req.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? (body.events as RecordedEvent[]) : [];

    if (events.length === 0) {
      return NextResponse.json({ error: 'events array is required' }, { status: 400 });
    }
    if (events.length > 200) {
      return NextResponse.json({ error: 'Too many events (max 200)' }, { status: 400 });
    }

    const step = await prisma.step.findFirst({
      where: {
        id: stepId,
        process: {
          OR: [{ id }, { slug: decodeURIComponent(id) }],
        },
      },
      select: { id: true, stepKey: true, title: true, contentMarkdown: true, targetMenuPath: true, processId: true },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    const clickEvents = events.filter((ev) => ev.type === 'click');
    const noteEvents = events.filter((ev) => ev.type !== 'click');

    const stepUpdate: { contentMarkdown?: string; targetMenuPath?: string } = {};
    let appendedMenuSegments = 0;

    // Clicks → hierarchical menu-path boxes (deduped against the tail).
    if (clickEvents.length > 0) {
      const existing = (step.targetMenuPath || '')
        .split('>')
        .map((seg) => seg.trim())
        .filter((seg) => seg.length > 0);
      for (const ev of clickEvents) {
        const segment = sanitizeMenuSegment(ev.label);
        if (!segment) continue;
        if (existing.length === 0 || existing[existing.length - 1] !== segment) {
          existing.push(segment);
          appendedMenuSegments++;
        }
      }
      stepUpdate.targetMenuPath = existing.join(' > ');
    }

    // Inputs / navigations → step instructions draft.
    if (noteEvents.length > 0) {
      const stamp = new Date().toLocaleString('fa-IR');
      const block = [
        '',
        `📝 ثبت افزونه نویسندگی — ${stamp} (توسط ${user.name})`,
        formatEventsMarkdown(noteEvents),
      ].join('\n');
      stepUpdate.contentMarkdown = `${step.contentMarkdown || ''}\n${block}`;
    }

    const updated = await prisma.step.update({
      where: { id: step.id },
      data: stepUpdate,
      select: { id: true, stepKey: true, title: true },
    });

    await prisma.process.update({
      where: { id: step.processId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      step: updated,
      appendedMenuSegments,
      appendedEvents: noteEvents.length,
    });
  } catch (error) {
    console.error('Error appending step events:', error);
    return NextResponse.json({ error: 'Failed to append events' }, { status: 500 });
  }
}
