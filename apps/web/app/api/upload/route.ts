import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const imageType = (data.get('imageType') as string) || 'FRONT';

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP image formats are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vercel Serverless environment has a read-only filesystem (except /tmp).
    // To ensure uploads work across serverless deploys without an external S3 bucket,
    // we convert the image directly into a base64 Data URI string.
    const base64String = buffer.toString('base64');
    const publicUrl = `data:${file.type};base64,${base64String}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      imageUrl: publicUrl,
      imageType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
