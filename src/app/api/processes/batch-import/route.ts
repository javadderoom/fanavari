import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { mapPrismaProcess, resolveDbUserId } from '@/lib/db-service';
import { cleanSlugForSubmit } from '@/lib/slug-utils';
import { ParsedProcessDraft } from '@/lib/circular-parser';

export async function POST(req: NextRequest) {
  try {
    const { id: currentUserId, permissions: userPermissions } = await resolveApiUser(req);
    const canCreate = hasPermission(userPermissions, Permissions.CREATE_PROCESSES) || hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!canCreate) {
      return NextResponse.json({ error: 'عدم دسترسی: شما مجوز ثبت فرایند را ندارید.' }, { status: 403 });
    }

    const body = await req.json();
    const drafts: ParsedProcessDraft[] = Array.isArray(body.processes) ? body.processes : [];

    if (!drafts.length) {
      return NextResponse.json({ error: 'هیچ پیش‌نویس فرایندی جهت ثبت ارسال نشده است.' }, { status: 400 });
    }

    const authorDbId = await resolveDbUserId(currentUserId);

    // Run batch import in a single database transaction
    const createdProcessIds = await prisma.$transaction(async (tx) => {
      // Step A: Pre-resolve departments and systems
      const defaultDept = await tx.department.findFirst({
        where: {
          OR: [
            { name: { contains: 'آموزش و پرورش' } },
            { slug: 'org-medu' },
          ],
        },
      });

      const idsMap: string[] = [];

      // Pass 1: Create all processes without nextProcessId first (to obtain real DB UUIDs)
      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i];
        let baseSlug = draft.slug ? cleanSlugForSubmit(draft.slug) : cleanSlugForSubmit(draft.title);
        let finalSlug = baseSlug;
        const exists = await tx.process.findUnique({ where: { slug: finalSlug } });
        if (exists) {
          finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${i + 1}`;
        }

        // Try to match system tool if exists
        let systemToolId: string | undefined = undefined;
        if (draft.targetSystem) {
          const foundTool = await tx.systemTool.findFirst({
            where: {
              OR: [
                { name: { contains: draft.targetSystem } },
                { slug: { contains: draft.targetSystem } },
              ],
            },
          });
          if (foundTool) systemToolId = foundTool.id;
        }

        const sanitizedSteps = (draft.steps || []).map((step, idx) => ({
          orderIndex: idx + 1,
          stepKey: `step-${idx + 1}`,
          title: step.title.trim(),
          contentMarkdown: step.contentMarkdown || `اقدام: ${step.title.trim()}`,
          stepType: step.stepType || 'action',
          targetMenuPath: step.targetMenuPath ? step.targetMenuPath.trim() : null,
          positionX: (idx + 1) * 200,
          positionY: 100,
        }));

        const created = await tx.process.create({
          data: {
            title: draft.title.trim(),
            slug: finalSlug,
            description: draft.description ? draft.description.trim() : '',
            scope: draft.scope || 'portal',
            category: draft.category || 'education',
            visibility: 'public',
            authorId: authorDbId,
            departmentId: defaultDept?.id,
            systemToolId,
            targetSystem: draft.targetSystem?.trim() || 'سیدا',
            targetUrl: draft.targetUrl?.trim() || 'https://my.medu.ir',
            estimatedMinutes: 10,
            isPublished: true,
            audience: draft.audience?.trim() || null,
            sourceChannel: draft.sourceChannel?.trim() || null,
            circularDate: draft.circularDate?.trim() || null,
            steps: {
              create: sanitizedSteps,
            },
          },
        });

        idsMap.push(created.id);
      }

      // Pass 2: Connect nextProcessId and nextProcessNote for chained / sibling flows
      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i];
        if (typeof draft.nextProcessDraftIndex === 'number' && idsMap[draft.nextProcessDraftIndex]) {
          const targetNextId = idsMap[draft.nextProcessDraftIndex];
          await tx.process.update({
            where: { id: idsMap[i] },
            data: {
              nextProcessId: targetNextId,
              nextProcessNote: draft.nextProcessNote?.trim() || null,
            },
          });
        }
      }

      return idsMap;
    });

    // Fetch the created processes with relations to return to caller
    const createdProcesses = await prisma.process.findMany({
      where: { id: { in: createdProcessIds } },
      include: {
        steps: { orderBy: { orderIndex: 'asc' } },
        department: true,
        systemTool: true,
        nextProcess: {
          select: {
            id: true,
            slug: true,
            title: true,
            targetSystem: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: createdProcesses.length,
      processes: createdProcesses.map((p) => mapPrismaProcess(p)),
    });
  } catch (error: any) {
    console.error('Error in batch-import processes:', error);
    return NextResponse.json({ error: error.message || 'خطا در ثبت گروهی فرایندها' }, { status: 500 });
  }
}
