import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@axum/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const breed = searchParams.get('breed')?.trim();
    const region = searchParams.get('region')?.trim();
    const city = searchParams.get('city')?.trim();
    const gender = searchParams.get('gender')?.trim();
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status') || 'ACTIVE';
    const sellerId = searchParams.get('sellerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Prisma.ListingWhereInput = {};

    // Filter by status (unless 'ALL' specified for authenticated queries)
    if (status !== 'ALL') {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Keyword search in title, description, city, area
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { region: { contains: q } },
        { area: { contains: q } },
        { breed: { name: { contains: q } } },
      ];
    }

    // Category filter by ID or slug
    if (category) {
      where.category = {
        OR: [{ id: category }, { slug: category }, { name: category }],
      };
    }

    // Breed filter
    if (breed) {
      where.breedId = breed;
    }

    // Region & City filters
    if (region && region !== 'all') {
      where.region = region;
    }
    if (city && city !== 'all') {
      where.city = city;
    }

    // Gender
    if (gender && (gender === 'FEMALE' || gender === 'MALE')) {
      where.gender = gender;
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        breed: {
          select: { id: true, name: true },
        },
        images: {
          select: { id: true, imageUrl: true, imageType: true },
        },
        seller: {
          select: { id: true, fullName: true, phone: true, city: true, region: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Fetch listings error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

