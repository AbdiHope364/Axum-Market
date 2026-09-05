import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const [totalSellers, pendingSellersCount, activeListings, pendingListings, totalReports] =
      await Promise.all([
        prisma.user.count({ where: { role: 'SELLER' } }),
        prisma.user.count({ where: { role: 'SELLER', status: 'PENDING' } }),
        prisma.listing.count({ where: { status: 'ACTIVE' } }),
        prisma.listing.count({ where: { status: 'PENDING' } }),
        prisma.report.count({ where: { status: 'PENDING' } }),
      ]);

    // Pending sellers awaiting admin approval
    const pendingSellers = await prisma.user.findMany({
      where: { role: 'SELLER', status: 'PENDING' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        region: true,
        city: true,
        area: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Pending listings for moderation
    const pendingItems = await prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        category: true,
        breed: true,
        seller: { select: { fullName: true, phone: true, email: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Recent reports
    const reports = await prisma.report.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            seller: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // All approved/active sellers list
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER', status: { not: 'PENDING' } },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        region: true,
        city: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      stats: {
        totalSellers,
        pendingSellersCount,
        activeListings,
        pendingListings,
        totalReports,
      },
      pendingSellers,
      pendingItems,
      reports,
      sellers,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load admin dashboard' }, { status: 500 });
  }
}
