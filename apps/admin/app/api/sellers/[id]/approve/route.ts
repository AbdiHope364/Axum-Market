import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { getSession } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin required' }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }

    const nextStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';

    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
    });

    return NextResponse.json({
      success: true,
      seller: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    return NextResponse.json({ error: 'Failed to process seller approval' }, { status: 500 });
  }
}

