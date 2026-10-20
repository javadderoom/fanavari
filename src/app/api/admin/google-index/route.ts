import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permissions, hasPermission } from '@/lib/permissions';
import { resolveApiUser } from '@/lib/api-auth';
import {
  getGoogleIndexingConfig,
  notifyGoogleIndexing,
  batchNotifyGoogleIndexing,
  getGoogleIndexingMetadata,
  IndexingNotificationType,
} from '@/lib/google-indexing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    const isAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Administrator permission required' },
        { status: 403 }
      );
    }

    const config = getGoogleIndexingConfig();
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    // If query URL specified, fetch its metadata from Google
    if (targetUrl) {
      const meta = await getGoogleIndexingMetadata(targetUrl);
      return NextResponse.json({
        config,
        metadata: meta,
      });
    }

    // Query current counts of indexable entities
    const [publicProcesses, publicSystems, publicPosts] = await Promise.all([
      prisma.process.count({ where: { isPublished: true, visibility: 'public' } }),
      prisma.systemTool.count(),
      prisma.informationPost.count({ where: { isPublished: true, visibility: 'public' } }),
    ]);

    const staticRoutesCount = 7; // /, /systems, /timeline, /information, /guide, /organizations, /tools/exam-pdf
    const totalIndexableUrls = staticRoutesCount + publicProcesses + publicSystems + publicPosts;

    return NextResponse.json({
      configured: config.configured,
      clientEmail: config.clientEmail,
      hasPrivateKey: config.hasPrivateKey,
      baseUrl: config.appUrl,
      sitemapUrl: `${config.appUrl}/sitemap.xml`,
      stats: {
        publicProcesses,
        publicSystems,
        publicPosts,
        staticRoutes: staticRoutesCount,
        totalIndexableUrls,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/google-index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve indexing status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { permissions: userPermissions } = await resolveApiUser(req);
    const isAdmin = hasPermission(userPermissions, Permissions.ADMINISTRATOR);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Administrator permission required' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'notify';

    if (action === 'notify') {
      const targetUrl = body.url;
      const type: IndexingNotificationType = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

      if (!targetUrl || typeof targetUrl !== 'string') {
        return NextResponse.json({ error: 'Field "url" is required' }, { status: 400 });
      }

      const result = await notifyGoogleIndexing({ url: targetUrl, type });
      return NextResponse.json({ success: result.success, result });
    }

    if (action === 'index_all') {
      const config = getGoogleIndexingConfig();
      const baseUrl = config.appUrl;

      const staticRoutes = [
        baseUrl,
        `${baseUrl}/systems`,
        `${baseUrl}/timeline`,
        `${baseUrl}/information`,
        `${baseUrl}/guide`,
        `${baseUrl}/organizations`,
        `${baseUrl}/tools/exam-pdf`,
      ];

      const [processes, systems, posts] = await Promise.all([
        prisma.process.findMany({
          where: { isPublished: true, visibility: 'public' },
          select: { slug: true },
        }),
        prisma.systemTool.findMany({
          select: { slug: true },
        }),
        prisma.informationPost.findMany({
          where: { isPublished: true, visibility: 'public' },
          select: { slug: true },
        }),
      ]);

      const allUrls = [
        ...staticRoutes,
        ...processes.map((p) => `${baseUrl}/process/${encodeURIComponent(p.slug)}`),
        ...systems.map((s) => `${baseUrl}/system/${encodeURIComponent(s.slug)}`),
        ...posts.map((post) => `${baseUrl}/information/${encodeURIComponent(post.slug)}`),
      ];

      const summary = await batchNotifyGoogleIndexing({
        urls: allUrls,
        type: 'URL_UPDATED',
        concurrency: 4,
      });

      return NextResponse.json({
        success: summary.failed === 0,
        summary,
      });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/google-index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process indexing request' },
      { status: 500 }
    );
  }
}
