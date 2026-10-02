import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const scope = searchParams.get('scope');

    const processes = await prisma.process.findMany({
      where: {
        AND: [
          scope ? { scope } : {},
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
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(processes);
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPermissions = Number(req.headers.get('x-user-permissions') || '0');

    // Discord-style bitfield check: Requires CREATE_PROCESSES or ADMINISTRATOR
    if (!hasPermission(userPermissions, Permissions.CREATE_PROCESSES)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions (CREATE_PROCESSES required)' },
        { status: 403 }
      );
    }

    const {
      title,
      slug,
      description,
      scope,
      category,
      departmentName,
      targetSystem,
      targetUrl,
      estimatedMinutes,
      steps,
    } = body;

    const newProcess = await prisma.process.create({
      data: {
        title,
        slug: slug || `proc-${Date.now()}`,
        description,
        scope: scope || 'organization',
        category: category || 'hr',
        targetSystem: targetSystem || 'سامانه سازمانی',
        targetUrl: targetUrl || null,
        estimatedMinutes: Number(estimatedMinutes) || 10,
        steps: {
          create: (steps || []).map((step: any, idx: number) => ({
            orderIndex: idx + 1,
            stepKey: step.stepKey || `step-${idx + 1}`,
            title: step.title,
            contentMarkdown: step.contentMarkdown || '',
            stepType: step.stepType || 'action',
            targetMenuPath: step.targetMenuPath || null,
            copyableFields: step.copyableFields ? (step.copyableFields as any) : undefined,
            errorGuides: {
              create: (step.errorGuides || []).map((err: any) => ({
                errorCode: err.errorCode,
                errorTitle: err.errorTitle,
                solutionMarkdown: err.solution || err.solutionMarkdown || '',
              })),
            },
          })),
        },
      },
      include: {
        steps: {
          include: {
            errorGuides: true,
          },
        },
      },
    });

    return NextResponse.json(newProcess, { status: 201 });
  } catch (error: any) {
    console.error('Error creating process:', error);
    return NextResponse.json({ error: error.message || 'Failed to create process' }, { status: 500 });
  }
}
