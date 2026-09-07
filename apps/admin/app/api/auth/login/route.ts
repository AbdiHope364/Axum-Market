import { NextResponse } from 'next/server';
import { prisma, restoreEmbeddedDatabase } from '@axum/database';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    
    // Completely bypass DB for admin to ensure Vercel environment variables work flawlessly
    // even if the SQLite database hasn't been wiped yet and contains old hashes.
    if (cleanEmail === 'admin@axummarket.et') {
      const adminPass = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';
      if (password !== adminPass) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      user = {
        id: 'admin-system-id',
        email: 'admin@axummarket.et',
        fullName: 'System Administrator',
        phone: '+251911000000',
        role: 'ADMIN',
        status: 'ACTIVE',
      } as any;
    } else {
      try {
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      } catch (dbErr) {
        console.error('Database query error in login route, attempting self-healing:', dbErr);
        try {
          const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
          if (isServerless) {
            restoreEmbeddedDatabase('/tmp/axum_dev.db');
            user = await prisma.user.findUnique({
              where: { email: cleanEmail },
            });
          }
        } catch (healingErr) {
          console.error('Self-healing retry failed:', healingErr);
        }
      }

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
    }


    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Valid Administrator credentials required.' }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'ADMIN',
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.url.startsWith('https:');

    // Admin session base timeout: 24 hours (Client-side enforces 5-min inactivity)
    const ADMIN_MAX_AGE = 24 * 60 * 60;

    response.cookies.set('axum_admin_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: ADMIN_MAX_AGE,
      path: '/',
    });

    response.cookies.set('axum_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: ADMIN_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

