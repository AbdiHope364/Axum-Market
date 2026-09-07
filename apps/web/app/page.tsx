import React from 'react';
import { prisma } from '@axum/database';
import HomeInteractiveView from '@/components/HomeInteractiveView';

export const dynamic = 'force-dynamic';

const FALLBACK_CATEGORIES = [
  {
    id: 'cat-dairy',
    name: 'Dairy Cattle (የወተት ከብቶች)',
    slug: 'dairy-cattle',
    icon: '🐄',
    breeds: [
      { id: 'b-holstein', name: 'Holstein Friesian (ሆልስታይን)' },
      { id: 'b-jersey', name: 'Jersey (ጀርሲ)' },
      { id: 'b-cross', name: 'Cross-Breed Dairy (የተዳቀሉ)' },
    ],
  },
  {
    id: 'cat-beef',
    name: 'Beef Cattle / Bulls (የስጋ በሬዎች)',
    slug: 'beef-cattle',
    icon: '🐂',
    breeds: [
      { id: 'b-boran', name: 'Boran (ቦረና)' },
      { id: 'b-harar', name: 'Harar / Ogaden (ሐረር)' },
    ],
  },
  {
    id: 'cat-calves',
    name: 'Calves & Heifers (ጥጃዎችና ጊደሮች)',
    slug: 'calves-heifers',
    icon: '🐮',
    breeds: [],
  },
  {
    id: 'cat-sheep',
    name: 'Sheep (በጎች)',
    slug: 'sheep',
    icon: '🐑',
    breeds: [
      { id: 'b-dorper', name: 'Dorper (ዶርፐር)' },
      { id: 'b-arqe', name: 'Menz / Wello (መንዝ)' },
    ],
  },
  {
    id: 'cat-goats',
    name: 'Goats (ፍየሎች)',
    slug: 'goats',
    icon: '🐐',
    breeds: [
      { id: 'b-boer', name: 'Boer (ቦየር)' },
      { id: 'b-somali', name: 'Somali Short-eared (ሶማሌ)' },
    ],
  },
  {
    id: 'cat-equines',
    name: 'Horses, Donkeys & Camels (ፈረሶች፣ አህዮችና ግመሎች)',
    slug: 'equines-camels',
    icon: '🐎',
    breeds: [],
  },
];

export default async function HomePage() {
  let categories: any[] = FALLBACK_CATEGORIES;
  let listings: any[] = [];

  try {
    const [dbCategories, dbListings] = await Promise.all([
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

    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
    }
    if (dbListings) {
      listings = dbListings;
    }
  } catch (error) {
    console.error('HomePage DB error (using fallback categories):', error);
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <HomeInteractiveView
        categories={categories}
        initialListings={listings as any}
      />
    </main>
  );
}

