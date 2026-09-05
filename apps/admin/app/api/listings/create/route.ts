import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      sellerId,
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
      status = 'ACTIVE',
      images, // array of { imageUrl, imageType }
    } = body;

    // Validate required fields
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
        { error: 'Please fill in all required livestock details (category, title, price, age, gender, location, phone).' },
        { status: 400 }
      );
    }

    // Validate 3 angles
    if (!images || !Array.isArray(images) || images.length < 3) {
      return NextResponse.json(
        { error: 'All 3 livestock photo angles (Front/Profile, Left Side, Right Side) are required.' },
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

    // Determine target seller
    let targetSellerId = session.userId;
    if (sellerId && sellerId !== 'self' && sellerId !== session.userId) {
      const existingSeller = await prisma.user.findUnique({ where: { id: sellerId } });
      if (existingSeller) {
        targetSellerId = existingSeller.id;
      }
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: targetSellerId,
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
        status: status === 'PENDING' ? 'PENDING' : 'ACTIVE', // Default ACTIVE for admin
        images: {
          create: images.map((img: { imageUrl: string; imageType: string }) => ({
            imageUrl: img.imageUrl,
            imageType: img.imageType,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        breed: true,
        seller: { select: { id: true, fullName: true, phone: true } },
      },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Admin create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create livestock listing.' },
      { status: 500 }
    );
  }
}

