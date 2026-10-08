import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import { mapPrismaInformationPost, resolveDbUserId } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const departmentSlug = searchParams.get('departmentSlug') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const systemSlug = searchParams.get('systemSlug') || undefined;
    const systemToolId = searchParams.get('systemToolId') || undefined;
    const search = searchParams.get('search') || undefined;
    const pinnedOnly = searchParams.get('pinned') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const statusParam = searchParams.get('status'); // 'published' | 'draft' | 'all'
    const isPublishedParam = searchParams.get('isPublished');

    const where: any = {};
    if (statusParam === 'draft' || isPublishedParam === 'false') {
      where.isPublished = false;
    } else if (statusParam === 'published' || isPublishedParam === 'true') {
      where.isPublished = true;
    }
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (pinnedOnly) where.isPinned = true;
    if (departmentId) where.departmentId = departmentId;
    else if (departmentSlug) where.department = { slug: departmentSlug };
    if (systemToolId) where.systemToolId = systemToolId;
    else if (systemSlug) where.systemTool = { slug: systemSlug };

    const {
      id: userId,
      roleName: userRole,
      departmentId: userDeptId,
      permissions: userPermissions,
    } = await resolveApiUser(req);
    const isSuperAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    // Multi-Audience Zero-Leak ACL Filter:
    // If not super admin, non-public posts are completely hidden unless user matches any target grant
    if (!isSuperAdmin) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { visibility: 'public' },
            ...(userId ? [{ authorId: userId }] : []),
            ...(userId ? [{ accessGrants: { some: { userId } } }] : []),
            ...(userDeptId ? [{ accessGrants: { some: { departmentId: userDeptId } } }] : []),
            ...(userRole ? [{ accessGrants: { some: { roleName: userRole } } }] : []),
          ],
        },
      ];
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.informationPost.findMany({
      where,
      include: {
        department: true,
        systemTool: true,
        author: true,
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });


    return NextResponse.json(posts.map(mapPrismaInformationPost));
  } catch (error) {
    console.error('Error fetching information posts:', error);
    return NextResponse.json({ error: 'Failed to fetch information posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id: currentUserId, permissions: userPermissions } = await resolveApiUser(req);

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_INFORMATION) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR) ||
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: دسترسی لازم برای ایجاد اطلاعیه و راهنما را ندارید (MANAGE_INFORMATION required)' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      summary,
      content,
      type = 'announcement',
      priority = 'normal',
      isPinned = false,
      isPublished = true,
      visibility = 'public',
      departmentId,
      systemToolId,
      targetUrl,
      publishedAt,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'عنوان اطلاعیه یا راهنما الزامی است.' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'متن محتوا الزامی است.' }, { status: 400 });
    }

    const normalizedSlug = (slug || `info-${Date.now()}`)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const existing = await prisma.informationPost.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'مطلبی با این شناسه یکتا (Slug) قبلاً ثبت شده است.' },
        { status: 409 }
      );
    }

    const created = await prisma.informationPost.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        summary: summary ? summary.trim() : null,
        content: content.trim(),
        type: ['announcement', 'circular', 'guide', 'article'].includes(type) ? type : 'announcement',
        priority: ['urgent', 'high', 'normal'].includes(priority) ? priority : 'normal',
        isPinned: Boolean(isPinned),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        visibility: ['public', 'restricted'].includes(visibility) ? visibility : 'public',
        departmentId: departmentId && departmentId !== 'none' ? departmentId : null,
        systemToolId: systemToolId && systemToolId !== 'none' ? systemToolId : null,
        authorId: await resolveDbUserId(currentUserId),
        targetUrl: targetUrl ? targetUrl.trim() : null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
      include: {
        department: true,
        systemTool: true,
        author: true,
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json(mapPrismaInformationPost(created), { status: 201 });
  } catch (error: any) {
    console.error('Error creating information post:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت مطلب اطلاعاتی جدید' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_INFORMATION) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR) ||
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: دسترسی لازم برای ویرایش مطلب را ندارید' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      currentSlug,
      title,
      slug,
      summary,
      content,
      type,
      priority,
      isPinned,
      isPublished,
      visibility,
      departmentId,
      systemToolId,
      targetUrl,
      publishedAt,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'عنوان مطلب الزامی است.' }, { status: 400 });
    }

    let target = null;
    if (id) {
      target = await prisma.informationPost.findUnique({ where: { id } });
    }
    if (!target && currentSlug) {
      target = await prisma.informationPost.findUnique({ where: { slug: currentSlug } });
    }
    if (!target && slug) {
      target = await prisma.informationPost.findUnique({ where: { slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'مطلب مورد نظر برای ویرایش یافت نشد.' }, { status: 404 });
    }

    const finalSlug = (slug || target.slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    if (finalSlug !== target.slug) {
      const existing = await prisma.informationPost.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== target.id) {
        return NextResponse.json(
          { error: 'مطلب دیگری با این شناسه یکتا (Slug) ثبت شده است.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.informationPost.update({
      where: { id: target.id },
      data: {
        title: title.trim(),
        slug: finalSlug,
        summary: summary !== undefined ? (summary ? summary.trim() : null) : target.summary,
        content: content !== undefined ? content.trim() : target.content,
        type: type && ['announcement', 'circular', 'guide', 'article'].includes(type) ? type : target.type,
        priority: priority && ['urgent', 'high', 'normal'].includes(priority) ? priority : target.priority,
        isPinned: isPinned !== undefined ? Boolean(isPinned) : target.isPinned,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : target.isPublished,
        visibility: visibility && ['public', 'restricted'].includes(visibility) ? visibility : target.visibility,
        departmentId: departmentId !== undefined ? (departmentId && departmentId !== 'none' ? departmentId : null) : target.departmentId,
        systemToolId: systemToolId !== undefined ? (systemToolId && systemToolId !== 'none' ? systemToolId : null) : target.systemToolId,
        targetUrl: targetUrl !== undefined ? (targetUrl ? targetUrl.trim() : null) : target.targetUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : target.publishedAt,
      },
      include: {
        department: true,
        systemTool: true,
        author: true,
        accessGrants: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json(mapPrismaInformationPost(updated));
  } catch (error: any) {
    console.error('Error updating information post:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ویرایش مطلب' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);

    const isAllowed =
      hasPermission(userPermissions, Permissions.MANAGE_INFORMATION) ||
      hasPermission(userPermissions, Permissions.ADMINISTRATOR) ||
      hasPermission(userPermissions, Permissions.MANAGE_CATEGORIES);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: دسترسی لازم برای حذف مطلب را ندارید' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    let target = null;
    if (id) {
      target = await prisma.informationPost.findUnique({ where: { id } });
    }
    if (!target && slug) {
      target = await prisma.informationPost.findUnique({ where: { slug } });
    }

    if (!target) {
      const body = await req.json().catch(() => ({}));
      if (body.id) target = await prisma.informationPost.findUnique({ where: { id: body.id } });
      if (!target && body.slug) target = await prisma.informationPost.findUnique({ where: { slug: body.slug } });
    }

    if (!target) {
      return NextResponse.json({ error: 'مطلب مورد نظر برای حذف یافت نشد.' }, { status: 404 });
    }

    await prisma.informationPost.delete({
      where: { id: target.id },
    });

    return NextResponse.json({ success: true, deletedSlug: target.slug, deletedId: target.id });
  } catch (error: any) {
    console.error('Error deleting information post:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در حذف مطلب' },
      { status: 500 }
    );
  }
}
