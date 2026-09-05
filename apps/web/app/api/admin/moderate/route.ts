import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { listingId, action, rejectionReason } = await req.json();

    if (!listingId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'ACTIVE', rejectionReason: null },
      });
      return NextResponse.json({ success: true, listing: updated });
    }

    if (action === 'REJECT') {
      const updated = await prisma.listing.update({
        where: { id: listingId },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Violates marketplace guidelines.',
        },
      });
      return NextResponse.json({ success: true, listing: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Failed to moderate listing' }, { status: 500 });
  }
}

