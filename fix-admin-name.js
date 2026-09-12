const fs = require('fs');

const file = 'apps/web/app/listings/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace {listing.seller.fullName} with a ternary
const searchString = '{listing.seller.fullName}';
const replaceString = '{listing.seller.fullName === "System Administrator" ? "AxumMarket Official" : listing.seller.fullName}';

content = content.replace(/\{listing\.seller\.fullName\}/g, replaceString);

// Also fix {listing.seller.fullName[0]}
content = content.replace(/\{listing\.seller\.fullName\[0\]\}/g, '{listing.seller.fullName === "System Administrator" ? "A" : listing.seller.fullName[0]}');

fs.writeFileSync(file, content);
console.log("Updated listing detail page to display AxumMarket Official!");
