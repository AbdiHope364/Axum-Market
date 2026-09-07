import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@axum/database';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
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
          role: true,
        },
      });
    } catch (e) {
      console.error('Database query error in /auth/me:', e);
    }

    // Self-healing / Ephemeral DB fallback for Admin
    if (!user && session.email === 'admin@axummarket.et') {
      user = {
        id: session.userId,
        fullName: session.fullName || 'System Administrator',
        email: session.email,
        role: 'ADMIN',
      };
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
