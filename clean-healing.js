const fs = require('fs');
const files = ['apps/admin/app/api/auth/login/route.ts', 'apps/web/app/api/auth/login/route.ts'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove import
    content = content.replace(/, restoreEmbeddedDatabase/g, '');
    
    // Replace the healing block with a simpler catch
    const block = `try {
          const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
          if (isServerless) {
            restoreEmbeddedDatabase('/tmp/axum_dev.db');
            user = await prisma.user.findUnique({
              where: { email: cleanEmail },
            });
          }
        } catch (healingErr) {
          console.error('Self-healing retry failed:', healingErr);
        }`;
    
    if (content.includes(block)) {
        content = content.replace(block, `// No self-healing needed with Postgres`);
    }

    fs.writeFileSync(file, content);
});
console.log("Cleaned up SQLite self-healing code!");
