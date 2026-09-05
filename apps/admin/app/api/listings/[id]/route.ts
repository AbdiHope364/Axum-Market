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
    const body = await req.json();
    const { status, price, title } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (title) dataToUpdate.title = title;

    const updated = await prisma.listing.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        breed: true,
        seller: { select: { fullName: true, phone: true } },
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Admin update listing error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
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

    // Delete associated images & reports first
    await prisma.listingImage.deleteMany({ where: { listingId: id } });
    await prisma.report.deleteMany({ where: { listingId: id } });

    // Delete listing
    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Listing permanently deleted' });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}

