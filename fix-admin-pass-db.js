const fs = require('fs');
const files = ['apps/admin/app/api/auth/login/route.ts', 'apps/web/app/api/auth/login/route.ts'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the completely bypassed DB logic with normal DB logic
    const bypassedLogic = `// Completely bypass DB for admin to ensure Vercel environment variables work flawlessly
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
        // No self-healing needed with Postgres
      }

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
    }`;

    // Wait, the web app's login might have different role checks at the bottom.
    // I should just use regex to replace it back to standard prisma check.
    // Actually, I can just do a git checkout from before I bypassed it!
});
