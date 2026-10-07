import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { mapPrismaProcess } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const scope = searchParams.get('scope');
    const userId = req.headers.get('x-user-id');
    const rawRole = req.headers.get('x-user-role');
    let userRole = rawRole;
    if (rawRole) {
      try {
        userRole = decodeURIComponent(rawRole);
      } catch (e) {
        userRole = rawRole;
      }
    }
    const userDeptId = req.headers.get('x-user-dept');
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    const isSuperAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    // Multi-Audience Zero-Leak ACL Filter:
    // If not super admin, non-public processes are completely hidden unless user matches any target grant
    const aclFilter = isSuperAdmin
      ? {}
      : {
          OR: [
            { visibility: 'public' },
            ...(userId ? [{ authorId: userId }] : []),
            ...(userId ? [{ accessGrants: { some: { userId } } }] : []),
            ...(userDeptId ? [{ accessGrants: { some: { departmentId: userDeptId } } }] : []),
            ...(userRole ? [{ accessGrants: { some: { roleName: userRole } } }] : []),
          ],
        };

    const processes = await prisma.process.findMany({
      where: {
        AND: [
          scope ? { scope } : {},
          aclFilter,
          query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { targetSystem: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
          include: {
            errorGuides: true,
          },
        },
        department: true,
        systemTool: true,
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(processes.map(mapPrismaProcess));
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Permissions check: Require CREATE_PROCESSES, EDIT_PROCESSES, or ADMINISTRATOR
    const isSuperAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);
    const canCreate = hasPermission(userPermissions, Permissions.CREATE_PROCESSES);
    const canEdit = hasPermission(userPermissions, Permissions.EDIT_PROCESSES);

    if (!isSuperAdmin && !canCreate && !canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (CREATE_PROCESSES or EDIT_PROCESSES required)' },
        { status: 403 }
      );
    }

    const {
      id,
      title,
      slug,
      description,
      scope,
      category,
      visibility,
      departmentName,
      departmentId,
      targetSystem,
      targetUrl,
      estimatedMinutes,
      steps,
      schedule,
    } = body;
    const currentUserId = req.headers.get('x-user-id');

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Process title is required' }, { status: 400 });
    }

    // Resolve department cleanly
    let resolvedDeptId: string | undefined = undefined;
    if (departmentId) {
      const exists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (exists) resolvedDeptId = exists.id;
    }

    if (!resolvedDeptId && departmentName) {
      const foundDept = await prisma.department.findFirst({
        where: {
          OR: [
            { name: departmentName.trim() },
            { slug: departmentName.trim() },
          ],
        },
      });
      if (foundDept) {
        resolvedDeptId = foundDept.id;
      }
    }

    // Resolve systemTool cleanly
    let resolvedSystemToolId: string | undefined = undefined;
    const incomingSystemToolId = body.systemToolId;
    if (incomingSystemToolId) {
      const exists = await prisma.systemTool.findUnique({ where: { id: incomingSystemToolId } });
      if (exists) resolvedSystemToolId = exists.id;
    }

    if (!resolvedSystemToolId && targetSystem) {
      const foundTool = await prisma.systemTool.findFirst({
        where: {
          OR: [
            { name: targetSystem.trim() },
            { slug: targetSystem.trim() },
          ],
        },
      });
      if (foundTool) {
        resolvedSystemToolId = foundTool.id;
      }
    }

    // Sanitize steps and nested error guides
    const sanitizedSteps = (steps || []).map((step: any, idx: number) => {
      const rawGuides = Array.isArray(step.errorGuides) ? step.errorGuides : [];
      const validGuides = rawGuides
        .filter((g: any) => g && (g.errorCode || g.errorTitle || g.solution || g.solutionMarkdown))
        .map((g: any, gIdx: number) => ({
          errorCode: String(g.errorCode || `ERR-${idx + 1}-${gIdx + 1}`).trim(),
          errorTitle: String(g.errorTitle || 'خطای احتمالی سیستم').trim(),
          solutionMarkdown: String(g.solution || g.solutionMarkdown || 'راهکاری ثبت نشده است.').trim(),
          screenshotUrl: g.screenshotUrl ? String(g.screenshotUrl) : null,
        }));

      return {
        orderIndex: idx + 1,
        stepKey: step.stepKey ? String(step.stepKey).trim() : `step-${idx + 1}`,
        title: String(step.title || `گام ${idx + 1}`).trim(),
        contentMarkdown: String(step.contentMarkdown || '').trim(),
        stepType: ['action', 'decision', 'warning', 'end', 'subprocess'].includes(step.stepType) ? step.stepType : 'action',
        targetMenuPath: step.targetMenuPath ? String(step.targetMenuPath).trim() : null,
        imageUrl: step.imageUrl ? String(step.imageUrl).trim() : null,
        subProcessId: step.subProcessId ? String(step.subProcessId).trim() : null,
        subProcessSlug: step.subProcessSlug ? String(step.subProcessSlug).trim() : null,
        copyableFields: Array.isArray(step.copyableFields) ? step.copyableFields : undefined,
        uiSnippets: Array.isArray(step.uiSnippets) ? step.uiSnippets : undefined,
        hotspots: Array.isArray(step.hotspots) ? step.hotspots : undefined,
        positionX: typeof step.positionX === 'number' ? step.positionX : (idx + 1) * 200,
        positionY: typeof step.positionY === 'number' ? step.positionY : 100,
        errorGuides: {
          create: validGuides,
        },
      };
    });

    // Check if updating an existing process
    let existingProcess = null;
    if (id) {
      existingProcess = await prisma.process.findUnique({ where: { id } });
    }
    if (!existingProcess && slug) {
      existingProcess = await prisma.process.findUnique({ where: { slug } });
    }

    if (existingProcess) {
      // Execute update inside a transaction to replace steps cleanly
      const updated = await prisma.$transaction(async (tx) => {
        await tx.step.deleteMany({ where: { processId: existingProcess.id } });

        return tx.process.update({
          where: { id: existingProcess.id },
          data: {
            title: title.trim(),
            description: description?.trim() || '',
            scope: scope || existingProcess.scope,
            category: category || existingProcess.category,
            visibility: visibility || existingProcess.visibility,
            departmentId: resolvedDeptId !== undefined ? resolvedDeptId : existingProcess.departmentId,
            systemToolId: resolvedSystemToolId !== undefined ? resolvedSystemToolId : existingProcess.systemToolId,
            targetSystem: targetSystem?.trim() || existingProcess.targetSystem,
            targetUrl: targetUrl !== undefined ? (targetUrl?.trim() || null) : existingProcess.targetUrl,
            estimatedMinutes: Number(estimatedMinutes) || existingProcess.estimatedMinutes,
            schedule: schedule !== undefined ? schedule : existingProcess.schedule,
            steps: {
              create: sanitizedSteps,
            },
          },
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
              include: { errorGuides: true },
            },
            department: true,
            systemTool: true,
            accessGrants: {
              include: { user: true, department: true },
            },
          },
        });
      });

      return NextResponse.json(mapPrismaProcess(updated), { status: 200 });
    }

    // Brand new process creation: ensure slug uniqueness
    let finalSlug = slug?.trim() || `proc-${Date.now()}`;
    const slugCollision = await prisma.process.findUnique({ where: { slug: finalSlug } });
    if (slugCollision) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const created = await prisma.process.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || '',
        scope: scope || 'organization',
        category: category || 'hr',
        visibility: visibility || 'public',
        authorId: currentUserId || null,
        departmentId: resolvedDeptId,
        systemToolId: resolvedSystemToolId,
        targetSystem: targetSystem?.trim() || 'سامانه سازمانی',
        targetUrl: targetUrl?.trim() || null,
        estimatedMinutes: Number(estimatedMinutes) || 10,
        schedule: schedule || null,
        steps: {
          create: sanitizedSteps,
        },
      },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
          include: { errorGuides: true },
        },
        department: true,
        systemTool: true,
        accessGrants: {
          include: { user: true, department: true },
        },
      },
    });

    return NextResponse.json(mapPrismaProcess(created), { status: 201 });
  } catch (error: any) {
    console.error('Error saving process in /api/processes:', error);
    return NextResponse.json({ error: error.message || 'Failed to save process' }, { status: 500 });
  }
}
