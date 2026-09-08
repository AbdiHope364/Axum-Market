import { NextResponse } from 'next/server';
import { prisma } from '@axum/database';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // On traditional server, SQLite is persistent, so we just do a normal query
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // If admin is completely missing on first boot, seed it
    if (!user && cleanEmail === 'admin@axummarket.et' && password === 'AdminSecure2026!') {
      try {
        user = await prisma.user.create({
          data: {
            email: 'admin@axummarket.et',
            passwordHash: '$2a$10$JptdA8OrnPWmzH1.8VCuYuvJXaWjEKWvg9VMtU2nRqBlRkvmcyu06', // Hash of 'AdminSecure2026!'
            fullName: 'System Administrator',
            phone: '+251911000000',
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
          },
        });
      } catch (err) {
        console.error('Failed to seed initial admin:', err);
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    
    // Web app allows any role, or you can restrict if needed.


    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'SELLER',
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

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https:');

    // Admin session base timeout: 24 hours (Client-side enforces 5-min inactivity)
    const ADMIN_MAX_AGE = 24 * 60 * 60;

    if (user.role === 'ADMIN') {
      response.cookies.set('axum_admin_token', token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        maxAge: ADMIN_MAX_AGE,
        path: '/',
      });
    }

    response.cookies.set('axum_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: ADMIN_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
