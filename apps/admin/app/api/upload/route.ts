import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const imageType = (data.get('imageType') as string) || 'FRONT';

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP image formats are allowed.' },
        { status: 400 }
      );
    }

    // Max 10MB for admin
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds the 10MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `admin_${imageType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Write to both admin and web public/uploads so images are available across both apps
    const targetDirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.join(process.cwd(), '..', 'web', 'public', 'uploads'),
    ];

    for (const dir of targetDirs) {
      try {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, filename), buffer);
      } catch (err) {
        console.warn('Could not write to dir:', dir, err);
      }
    }

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      imageUrl: publicUrl,
      imageType,
    });
  } catch (error) {
    console.error('Admin upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

