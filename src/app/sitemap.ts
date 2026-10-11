import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://farayandnama.ir';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/systems`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/timeline`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/information`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/organizations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const [processes, systems, posts] = await Promise.all([
      prisma.process.findMany({
        where: { isPublished: true, visibility: 'public' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.systemTool.findMany({
        select: { slug: true, createdAt: true },
      }),
      prisma.informationPost.findMany({
        where: { isPublished: true, visibility: 'public' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    for (const p of processes) {
      routes.push({
        url: `${baseUrl}/process/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    for (const s of systems) {
      routes.push({
        url: `${baseUrl}/system/${encodeURIComponent(s.slug)}`,
        lastModified: s.createdAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const post of posts) {
      routes.push({
        url: `${baseUrl}/information/${encodeURIComponent(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (err) {
    // If database is not available during pre-rendering, return base static routes
    console.warn('Sitemap dynamic entity query skipped:', err);
  }

  return routes;
}
