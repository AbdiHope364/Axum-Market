import React from 'react';
import { prisma } from '@axum/database';
import HomeInteractiveView from '@/components/HomeInteractiveView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({
      where: { status: 'ACTIVE' },
      include: {
        breeds: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: { select: { name: true, icon: true } },
        breed: { select: { name: true } },
        images: { select: { imageUrl: true, imageType: true } },
        seller: { select: { fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    }),
  ]);

  return (
    <main className="min-h-screen">
      <HomeInteractiveView
        categories={categories}
        initialListings={listings as any}
      />
    </main>
  );
}
