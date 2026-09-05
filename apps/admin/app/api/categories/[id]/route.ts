import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const { status, name, icon } = await req.json();

    const data: any = {};
    if (status) data.status = status;
    if (name) data.name = name;
    if (icon) data.icon = icon;

    const updated = await prisma.category.update({
      where: { id },
      data,
      include: {
        breeds: true,
        _count: { select: { listings: true } },
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = await params;

    const listingCount = await prisma.listing.count({ where: { categoryId: id } });
    if (listingCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${listingCount} active or historical listings are attached to it.` },
        { status: 400 }
      );
    }

    // Delete associated breeds first
    await prisma.breed.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

