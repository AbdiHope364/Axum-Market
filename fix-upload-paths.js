const fs = require('fs');

const adminUploadFile = 'apps/admin/app/api/upload/route.ts';
let adminContent = fs.readFileSync(adminUploadFile, 'utf8');

// Change the uploadDir for the admin app to point to the web app's public folder,
// so that images uploaded from the standalone admin app are accessible by the web app!
adminContent = adminContent.replace(
  "const uploadDir = path.join(process.cwd(), 'public', 'uploads');",
  "const uploadDir = path.join(process.cwd(), '..', 'web', 'public', 'uploads');"
);

fs.writeFileSync(adminUploadFile, adminContent);
console.log("Fixed admin upload path to share with web app!");
