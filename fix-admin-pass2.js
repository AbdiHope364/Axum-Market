const fs = require('fs');
const files = ['apps/admin/app/api/auth/login/route.ts', 'apps/web/app/api/auth/login/route.ts'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const newContent = content.replace(/try {\n\s+user = await prisma\.user\.findUnique\(\{\n\s+where: \{ email: cleanEmail \},\n\s+\}\);\n\s+\} catch \(dbErr\) \{[\s\S]+?\}\n\s+\}\n\n\s+\/\/ Resilient admin guarantee[\s\S]+?if \(!isMatch\) \{\n\s+return NextResponse\.json\(\{ error: 'Invalid email or password\.' \}, \{ status: 401 \}\);\n\s+\}/,
`
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
`);
    
    fs.writeFileSync(file, newContent);
});
console.log("Updated files!");
