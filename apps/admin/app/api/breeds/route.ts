import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { categoryId, name } = await req.json();

    if (!categoryId || !name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category ID and breed name are required' }, { status: 400 });
    }

    const breed = await prisma.breed.create({
      data: {
        categoryId,
        name: name.trim(),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, breed });
  } catch (error) {
    console.error('Create breed error:', error);
    return NextResponse.json({ error: 'Failed to create breed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Breed ID is required' }, { status: 400 });
    }

    await prisma.breed.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Breed deleted' });
  } catch (error) {
    console.error('Delete breed error:', error);
    return NextResponse.json({ error: 'Failed to delete breed' }, { status: 500 });
  }
}

