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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
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

