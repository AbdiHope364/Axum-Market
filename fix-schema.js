const fs = require('fs');
const file = 'packages/database/prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/url\s+=\s+env\("DATABASE_URL"\)/, 
`url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")`);

fs.writeFileSync(file, content);
console.log("Updated schema for Vercel Postgres!");
