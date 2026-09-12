const fs = require('fs');

let config = fs.readFileSync('apps/web/next.config.ts', 'utf8');

// Add import path
if (!config.includes('import path')) {
  config = config.replace('import type { NextConfig } from "next";', 'import type { NextConfig } from "next";\nimport path from "path";');
}

// Add outputFileTracingRoot
if (!config.includes('outputFileTracingRoot')) {
  config = config.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  outputFileTracingRoot: path.join(__dirname, "../../"),');
}

fs.writeFileSync('apps/web/next.config.ts', config);
console.log("Fixed Next.js config!");
