import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@axum/database';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
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
    } catch (e) {
      console.error('Database query error in /auth/me:', e);
    }

    // Self-healing / Ephemeral DB fallback for Admin
    if (!user && session.role === 'ADMIN' && session.email === 'admin@axummarket.et') {
      user = {
        id: session.userId,
        fullName: session.fullName || 'System Administrator',
        email: session.email,
        phone: '+251911000000',
        role: 'ADMIN',
        status: 'ACTIVE',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        area: 'Bole',
      } as any;
    }

    if (!user || user.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
