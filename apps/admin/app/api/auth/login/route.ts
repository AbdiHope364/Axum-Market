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

    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.error('Database query error in admin login route, attempting self-healing:', dbErr);
      try {
        const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
        if (isServerless) {
          restoreEmbeddedDatabase('/tmp/axum_dev.db');
          user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });
        }
      } catch (healingErr) {
        console.error('Admin self-healing retry failed:', healingErr);
      }
    }

    // Resilient admin guarantee: ensure admin user always exists and authenticates with canonical credentials
    if (!user && cleanEmail === 'admin@axummarket.et' && password === 'Abdi@Hope07') {
      try {
        user = await prisma.user.create({
          data: {
            email: 'admin@axummarket.et',
            passwordHash: '$2a$10$JptdA8OrnPWmzH1.8VCuYuvJXaWjEKWvg9VMtU2nRqBlRkvmcyu06',
            fullName: 'System Administrator',
            phone: '+251911000000',
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
          },
        });
      } catch {
        user = {
          id: 'admin-system-id',
          email: 'admin@axummarket.et',
          fullName: 'System Administrator',
          phone: '+251911000000',
          role: 'ADMIN',
          status: 'ACTIVE',
          passwordHash: '$2a$10$JptdA8OrnPWmzH1.8VCuYuvJXaWjEKWvg9VMtU2nRqBlRkvmcyu06',
        } as any;
      }
    }

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Valid Administrator credentials required.' }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
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

