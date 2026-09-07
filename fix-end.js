const fs = require('fs');
let content = fs.readFileSync('apps/admin/app/page.tsx', 'utf8');
content = content.replace(/    <\/div>\n    <\/div>\n    <\/div>\n  \);\n}/g, '    </div>\n    </div>\n  );\n}');
fs.writeFileSync('apps/admin/app/page.tsx', content);
