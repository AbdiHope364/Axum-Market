import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    const { status, role, newPassword } = await req.json();

    const data: any = {};
    if (status && ['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      data.status = status;
    }
    if (role && ['SELLER', 'ADMIN'].includes(role)) {
      data.role = role;
    }
    if (newPassword && newPassword.trim().length >= 6) {
      data.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    if (status === 'SUSPENDED') {
      await prisma.listing.updateMany({
        where: { sellerId: id, status: 'ACTIVE' },
        data: { status: 'REMOVED' },
      });
    }

    return NextResponse.json({ success: true, seller: updated });
  } catch (error) {
    console.error('Update seller error:', error);
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
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

    // Prevent deleting self
    if (session.userId === id) {
      return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
    }

    // Cascade delete listings, images, reports
    const listings = await prisma.listing.findMany({ where: { sellerId: id }, select: { id: true } });
    const listingIds = listings.map((l) => l.id);

    if (listingIds.length > 0) {
      await prisma.listingImage.deleteMany({ where: { listingId: { in: listingIds } } });
      await prisma.report.deleteMany({ where: { listingId: { in: listingIds } } });
      await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Seller and their listings deleted successfully' });
  } catch (error) {
    console.error('Delete seller error:', error);
    return NextResponse.json({ error: 'Failed to delete seller' }, { status: 500 });
  }
}
