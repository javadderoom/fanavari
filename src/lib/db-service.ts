import { prisma } from './prisma';
import { 
  Process, 
  ProcessStep, 
  SystemTool, 
  OrganizationEntity, 
  ErrorGuideItem, 
  InformationPost,
  ProcessScopeEntity,
  ProcessCategoryEntity
} from '@/types/process';

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
    visibility: (p.visibility as any) || 'public',
    authorId: p.authorId || null,
    accessGrants: Array.isArray(p.accessGrants)
      ? p.accessGrants.map((g: any) => ({
          id: g.id,
          processId: g.processId,
          userId: g.userId || null,
          user: g.user
            ? {
                id: g.user.id,
                name: g.user.name,
                email: g.user.email,
                roleName: g.user.roleName,
                avatarUrl: g.user.avatarUrl,
              }
            : undefined,
          departmentId: g.departmentId || null,
          departmentName: g.department?.name || null,
          department: g.department
            ? {
                id: g.department.id,
                name: g.department.name,
                slug: g.department.slug,
              }
            : undefined,
          roleName: g.roleName || null,
          claimToken: g.claimToken || null,
          claimExpiresAt: g.claimExpiresAt || null,
          permission: (g.permission as any) || 'view',
          grantedById: g.grantedById || null,
          createdAt: g.createdAt,
        }))
      : [],
    departmentName: p.department?.name || 'سازمان نامشخص',
    departmentSlug: p.department?.slug || undefined,
    estimatedMinutes: p.estimatedMinutes || 10,
    targetSystem: p.systemTool?.name || p.targetSystem || 'سامانه سازمانی',
    targetSystemSlug: p.systemTool?.slug || 'portal',
    targetUrl: p.systemTool?.websiteUrl || p.targetUrl || undefined,
    isPopular: true,
    totalSteps: p.steps?.length || 0,
    tags: [p.department?.name, p.department?.slug, p.systemTool?.name, 'ضمن خدمت'].filter(Boolean) as string[],
    schedule: p.schedule ? (typeof p.schedule === 'string' ? JSON.parse(p.schedule) : p.schedule) : undefined,
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
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
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
    if (!slug) return null;
    const rawSlug = slug.trim();
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug).trim();
    } catch (e) {
      // ignore
    }

    const item = await prisma.process.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: rawSlug },
          { id: rawSlug },
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
      id: t.id,
      slug: t.slug,
      name: t.name,
      category: (t.category as any) || 'portal',
      icon: t.icon || 'Laptop',
      description: t.description || '',
      websiteUrl: t.websiteUrl || undefined,
      processCount: t.processes.length,
      createdAt: t.createdAt,
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
    if (!slug) return { tool: null, processes: [] };
    const rawSlug = slug.trim();
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug).trim();
    } catch (e) {
      // ignore
    }

    const tool = await prisma.systemTool.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: rawSlug },
          { id: rawSlug },
        ],
      },
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

/**
 * Maps a Prisma information post record to frontend InformationPost interface.
 */
export function mapPrismaInformationPost(p: any): InformationPost {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.summary || null,
    content: p.content,
    type: p.type || 'announcement',
    priority: p.priority || 'normal',
    isPinned: Boolean(p.isPinned),
    isPublished: p.isPublished !== undefined ? Boolean(p.isPublished) : true,
    departmentId: p.departmentId || null,
    departmentName: p.department?.name || null,
    departmentSlug: p.department?.slug || null,
    systemToolId: p.systemToolId || null,
    systemToolName: p.systemTool?.name || null,
    systemToolSlug: p.systemTool?.slug || null,
    authorId: p.authorId || null,
    authorName: p.author?.name || null,
    targetUrl: p.targetUrl || null,
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString(),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Fetch information posts directly from PostgreSQL database.
 */
export async function getDbInformationPosts(options?: {
  type?: string;
  priority?: string;
  departmentSlug?: string;
  systemSlug?: string;
  limit?: number;
  includeDrafts?: boolean;
}): Promise<InformationPost[]> {
  try {
    const where: any = {};
    if (!options?.includeDrafts) {
      where.isPublished = true;
    }
    if (options?.type) where.type = options.type;
    if (options?.priority) where.priority = options.priority;
    if (options?.departmentSlug) where.department = { slug: options.departmentSlug };
    if (options?.systemSlug) where.systemTool = { slug: options.systemSlug };

    const posts = await prisma.informationPost.findMany({
      where,
      include: {
        department: true,
        systemTool: true,
        author: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: options?.limit,
    });

    return posts.map(mapPrismaInformationPost);
  } catch (error) {
    console.error('Error in getDbInformationPosts:', error);
    return [];
  }
}

/**
 * Fetch a single information post by slug directly from PostgreSQL database.
 */
export async function getDbInformationPostBySlug(slug: string): Promise<InformationPost | null> {
  try {
    if (!slug) return null;
    const rawSlug = slug.trim();
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug).trim();
    } catch (e) {
      // ignore
    }

    const post = await prisma.informationPost.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: rawSlug },
          { id: rawSlug },
        ],
      },
      include: {
        department: true,
        systemTool: true,
        author: true,
      },
    });

    if (!post) return null;
    return mapPrismaInformationPost(post);
  } catch (error) {
    console.error('Error in getDbInformationPostBySlug:', error);
    return null;
  }
}

/**
 * Fetch all process scopes and their categories directly from PostgreSQL database.
 */
export async function getDbScopes(): Promise<ProcessScopeEntity[]> {
  try {
    const scopes = await prisma.processScope.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        categories: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    const processCounts = await prisma.process.groupBy({
      by: ['scope'],
      _count: { id: true },
    });
    const countsMap = new Map<string, number>();
    processCounts.forEach((c) => countsMap.set(c.scope, c._count.id));

    return scopes.map((s) => ({
      id: s.id,
      key: s.key,
      name: s.name,
      description: s.description || undefined,
      icon: s.icon || undefined,
      orderIndex: s.orderIndex,
      processCount: countsMap.get(s.key) || 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      categories: (s.categories || []).map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        description: c.description || undefined,
        icon: c.icon || undefined,
        orderIndex: c.orderIndex,
        scopeId: c.scopeId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    }));
  } catch (error) {
    console.error('Error in getDbScopes:', error);
    return [];
  }
}

/**
 * Fetch all process categories, optionally filtered by scope key or ID.
 * Returns both scope-specific categories AND global categories (scopeId: null).
 */
export async function getDbCategories(scopeKeyOrId?: string): Promise<ProcessCategoryEntity[]> {
  try {
    let targetScopeId: string | null = null;
    if (scopeKeyOrId && scopeKeyOrId !== 'all') {
      const scope = await prisma.processScope.findFirst({
        where: {
          OR: [
            { id: scopeKeyOrId },
            { key: scopeKeyOrId },
          ],
        },
      });
      if (scope) targetScopeId = scope.id;
    }

    const whereClause: any = targetScopeId
      ? {
          OR: [
            { scopeId: targetScopeId },
            { scopeId: null }, // Global category available for all scopes
          ],
        }
      : {};

    const categories = await prisma.processCategory.findMany({
      where: whereClause,
      orderBy: [
        { scopeId: 'asc' },
        { orderIndex: 'asc' },
      ],
      include: {
        scope: true,
      },
    });

    const processCounts = await prisma.process.groupBy({
      by: ['category'],
      _count: { id: true },
    });
    const countsMap = new Map<string, number>();
    processCounts.forEach((c) => countsMap.set(c.category, c._count.id));

    return categories.map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      description: c.description || undefined,
      icon: c.icon || undefined,
      orderIndex: c.orderIndex,
      scopeId: c.scopeId,
      scopeKey: c.scope?.key || null,
      scopeName: c.scope?.name || 'عمومی (همه حوزه‌ها)',
      processCount: countsMap.get(c.key) || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  } catch (error) {
    console.error('Error in getDbCategories:', error);
    return [];
  }
}


