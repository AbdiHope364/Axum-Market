import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      include: {
        breeds: {
          where: { status: 'ACTIVE' },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

