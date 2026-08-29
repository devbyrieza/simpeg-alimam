const fs = require('fs');
const file = 'src/app/api/kalender/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /deskripsi: item\.description,/,
  'deskripsi: item.description || null,'
);
fs.writeFileSync(file, content);
console.log("Fixed kalender route");
