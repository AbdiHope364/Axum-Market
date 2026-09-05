import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@axum/database';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        region: true,
        city: true,
        area: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

