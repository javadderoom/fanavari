import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = (formData.get('folder') as string) || 'images';
    const customName = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename ensuring .webp extension
    const cleanBaseName = customName
      ? customName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)
      : 'img';
    const filename = `${folder}/${cleanBaseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    // 1. If Vercel Blob Token is configured, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/webp',
      });

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        size: buffer.length,
        storage: 'vercel_blob',
      });
    }

    // 2. Local Development Fallback: Save to public/uploads
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            'BLOB_READ_WRITE_TOKEN is missing on Vercel. Please connect your Vercel Blob store to this project in the Vercel Dashboard (Storage -> Blob Store -> Settings -> Connect Project).',
        },
        { status: 500 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const localFilename = path.basename(filename);
    const localFilePath = path.join(uploadDir, localFilename);
    await fs.writeFile(localFilePath, buffer);

    const localUrl = `/uploads/${folder}/${localFilename}`;

    return NextResponse.json({
      url: localUrl,
      pathname: filename,
      size: buffer.length,
      storage: 'local_disk',
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
