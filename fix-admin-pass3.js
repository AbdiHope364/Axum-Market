const fs = require('fs');

// Admin App Login
let adminAppContent = fs.readFileSync('apps/admin/app/api/auth/login/route.ts', 'utf8');
if (!adminAppContent.includes("if (!user || user.role !== 'ADMIN')")) {
    adminAppContent = adminAppContent.replace("const token = signToken({", `if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Valid Administrator credentials required.' }, { status: 403 });
    }

    const token = signToken({`);
    fs.writeFileSync('apps/admin/app/api/auth/login/route.ts', adminAppContent);
}

// Web App Login
let webAppContent = fs.readFileSync('apps/web/app/api/auth/login/route.ts', 'utf8');
if (!webAppContent.includes("if (requireRole && user.role !== requireRole)")) {
    webAppContent = webAppContent.replace("const token = signToken({", `if (requireRole && user.role !== requireRole) {
      return NextResponse.json({ error: 'Unauthorized role access.' }, { status: 403 });
    }

    const token = signToken({`);
    fs.writeFileSync('apps/web/app/api/auth/login/route.ts', webAppContent);
}

console.log("Re-added role checks!");
