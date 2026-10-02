import { prisma } from './prisma';
import { Process, ProcessStep, SystemTool, OrganizationEntity, ErrorGuideItem } from '@/types/process';

/**
 * Maps a Prisma process record to the frontend Process interface.
 */
export function mapPrismaProcess(p: any): Process {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    scope: (p.scope as any) || 'portal',
    category: (p.category as any) || 'hr',
    departmentName: p.department?.name || 'سازمان نامشخص',
    departmentSlug: p.department?.slug || undefined,
    estimatedMinutes: p.estimatedMinutes || 10,
    targetSystem: p.systemTool?.name || p.targetSystem || 'سامانه سازمانی',
    targetSystemSlug: p.systemTool?.slug || 'portal',
    targetUrl: p.systemTool?.websiteUrl || p.targetUrl || undefined,
    isPopular: true,
    totalSteps: p.steps?.length || 0,
    tags: [p.department?.name, p.department?.slug, p.systemTool?.name, 'ضمن خدمت'].filter(Boolean) as string[],
    updatedAt: new Date(p.updatedAt).toLocaleDateString('fa-IR'),
    steps: (p.steps || []).map((step: any): ProcessStep => ({
      id: step.id,
      orderIndex: step.orderIndex,
      stepKey: step.stepKey,
      title: step.title,
      contentMarkdown: step.contentMarkdown,
      stepType: (step.stepType as any) || 'action',
      targetMenuPath: step.targetMenuPath || undefined,
      copyableFields: Array.isArray(step.copyableFields) ? step.copyableFields : undefined,
      hotspots: Array.isArray(step.hotspots) ? step.hotspots : undefined,
      tips: [],
      errorGuides: (step.errorGuides || []).map((err: any): ErrorGuideItem => ({
        id: err.id,
        errorCode: err.errorCode,
        errorTitle: err.errorTitle,
        cause: 'خطای سیستمی / مغایرت در پایگاه داده پرسنلی',
        solution: err.solutionMarkdown,
      })),
    })),
  };
}

/**
 * Fetch all processes directly from PostgreSQL database.
 */
export async function getDbProcesses(): Promise<Process[]> {
  try {
    const list = await prisma.process.findMany({
      where: { isPublished: true },
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
      orderBy: { createdAt: 'desc' },
    });

    return list.map(mapPrismaProcess);
  } catch (error) {
    console.error('Error in getDbProcesses:', error);
    return [];
  }
}

/**
 * Fetch single process by slug directly from PostgreSQL database.
 */
export async function getDbProcessBySlug(slug: string): Promise<Process | null> {
  try {
    const item = await prisma.process.findUnique({
      where: { slug },
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
    });

    if (!item) return null;
    return mapPrismaProcess(item);
  } catch (error) {
    console.error(`Error in getDbProcessBySlug(${slug}):`, error);
    return null;
  }
}

/**
 * Fetch all system tools directly from PostgreSQL database.
 */
export async function getDbSystemTools(): Promise<SystemTool[]> {
  try {
    const tools = await prisma.systemTool.findMany({
      include: {
        processes: true,
      },
      orderBy: { name: 'asc' },
    });

    return tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: (t.category as any) || 'portal',
      icon: t.icon || 'Laptop',
      description: t.description || '',
      websiteUrl: t.websiteUrl || undefined,
      processCount: t.processes.length,
    }));
  } catch (error) {
    console.error('Error in getDbSystemTools:', error);
    return [];
  }
}

/**
 * Fetch single system tool by slug directly from PostgreSQL database with related processes.
 */
export async function getDbSystemToolBySlug(slug: string): Promise<{ tool: SystemTool | null; processes: Process[] }> {
  try {
    const tool = await prisma.systemTool.findUnique({
      where: { slug },
      include: {
        processes: {
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
              include: { errorGuides: true },
            },
            department: true,
            systemTool: true,
          },
        },
      },
    });

    if (!tool) return { tool: null, processes: [] };

    return {
      tool: {
        slug: tool.slug,
        name: tool.name,
        category: (tool.category as any) || 'portal',
        icon: tool.icon || 'Laptop',
        description: tool.description || '',
        websiteUrl: tool.websiteUrl || undefined,
        processCount: tool.processes.length,
      },
      processes: tool.processes.map(mapPrismaProcess),
    };
  } catch (error) {
    console.error(`Error in getDbSystemToolBySlug(${slug}):`, error);
    return { tool: null, processes: [] };
  }
}

/**
 * Fetch all departments/organizations directly from PostgreSQL database.
 */
export async function getDbDepartments(): Promise<OrganizationEntity[]> {
  try {
    const depts = await prisma.department.findMany({
      include: {
        processes: true,
      },
      orderBy: { name: 'asc' },
    });

    return depts.map((d) => ({
      slug: d.slug,
      name: d.name,
      category: 'gov',
      description: `سازمان و ارگان اجرایی متولی ${d.name}`,
      processCount: d.processes.length,
    }));
  } catch (error) {
    console.error('Error in getDbDepartments:', error);
    return [];
  }
}

/**
 * Fetch all error guides across all processes directly from PostgreSQL database.
 */
export async function getDbErrorGuides(): Promise<any[]> {
  try {
    const errors = await prisma.errorGuide.findMany({
      include: {
        step: {
          include: {
            process: true,
          },
        },
      },
      orderBy: { errorCode: 'asc' },
    });

    return errors.map((e) => ({
      id: e.id,
      errorCode: e.errorCode,
      errorTitle: e.errorTitle,
      cause: 'مغایرت استعلامی یا تاخیر در پردازش سرور مرکزی',
      solution: e.solutionMarkdown,
      processTitle: e.step.process.title,
      processSlug: e.step.process.slug,
      stepTitle: e.step.title,
      stepIndex: e.step.orderIndex,
      targetSystem: e.step.process.targetSystem || 'آموزش و پرورش',
    }));
  } catch (error) {
    console.error('Error in getDbErrorGuides:', error);
    return [];
  }
}
