import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      categoryId,
      breedId,
      title,
      description,
      price,
      age,
      gender,
      region,
      city,
      area,
      contactPhone,
      images, // array of { imageUrl, imageType }
    } = body;

    // Validate fields
    if (
      !categoryId ||
      !title ||
      !description ||
      !price ||
      !age ||
      !gender ||
      !region ||
      !city ||
      !contactPhone
    ) {
      return NextResponse.json(
        { error: 'Please fill in all required livestock details.' },
        { status: 400 }
      );
    }

    // Validate 3 images
    if (!images || !Array.isArray(images) || images.length < 3) {
      return NextResponse.json(
        { error: 'All 3 livestock photos (Profile/Front, Left Side, Right Side) are required.' },
        { status: 400 }
      );
    }

    const hasFront = images.some((i) => i.imageType === 'FRONT' || i.imageType === 'PROFILE');
    const hasLeft = images.some((i) => i.imageType === 'LEFT');
    const hasRight = images.some((i) => i.imageType === 'RIGHT');

    if (!hasFront || !hasLeft || !hasRight) {
      return NextResponse.json(
        { error: 'Please provide images for Profile/Front, Left Side, and Right Side.' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: session.userId,
        categoryId,
        breedId: breedId || null,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        age: age.trim(),
        gender,
        region: region.trim(),
        city: city.trim(),
        area: area ? area.trim() : null,
        contactPhone: contactPhone.trim(),
        status: 'ACTIVE', // Post as active, admin can moderate/suspend
        images: {
          create: images.map((img: { imageUrl: string; imageType: string }) => ({
            imageUrl: img.imageUrl,
            imageType: img.imageType,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing.' },
      { status: 500 }
    );
  }
}

