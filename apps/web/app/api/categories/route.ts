import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

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

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { name, icon } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || '🐾',
        status: 'ACTIVE',
      },
      include: {
        breeds: true,
        _count: { select: { listings: true } },
      },
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
