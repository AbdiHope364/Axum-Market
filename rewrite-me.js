const fs = require('fs');

const routeTemplate = `import { NextResponse } from 'next/server';
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

    if (!user || user.status === 'SUSPENDED') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
`;

fs.writeFileSync('apps/admin/app/api/auth/me/route.ts', routeTemplate);
fs.writeFileSync('apps/web/app/api/auth/me/route.ts', routeTemplate);
console.log("Rewritten /auth/me routes for traditional hosting!");
