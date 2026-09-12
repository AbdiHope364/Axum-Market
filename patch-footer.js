const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/components/Footer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `<p className="flex items-center gap-1">
            Built for Ethiopian farmers & buyers with direct phone connectivity.
          </p>`;

const replaceStr = `<div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
          </div>`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(filePath, content);
console.log("Footer patched.");
