import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';

export async function POST(req: Request) {
  try {
    const { listingId, reason, description, reporterContact } = await req.json();

    if (!listingId || !reason) {
      return NextResponse.json(
        { error: 'Listing ID and reason are required' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        listingId,
        reason,
        description: description ? description.trim() : null,
        reporterContact: reporterContact ? reporterContact.trim() : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

