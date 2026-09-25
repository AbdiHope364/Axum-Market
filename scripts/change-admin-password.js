const bcrypt = require('bcryptjs');
const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter new admin password: ', async (newPassword) => {
  if (newPassword.length < 6) {
    console.log("Password must be at least 6 characters.");
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  const filesToUpdate = [
    'apps/admin/app/api/auth/login/route.ts',
    'apps/web/app/api/auth/login/route.ts'
  ];

  filesToUpdate.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the raw password check
    content = content.replace(/password === '[^']+'/g, `password === '${newPassword}'`);
    
    // Replace the hashed password string in the fallback creation
    content = content.replace(/passwordHash: '\$2a\$10\$[^']+'/g, `passwordHash: '${hash}'`);

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  });

  console.log("\nSuccess! The source code has been updated with the new credentials.");
  console.log("To apply this to your live site, simply run: git add . && git commit -m 'Update admin password' && git push origin main");
  
  process.exit(0);
});
