const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /username\s+String\?\s+@unique\s*\n\s*email\s+String\?/,
  'username               String?               @unique\n    email                  String?\n    foto_url               String?'
);

fs.writeFileSync(file, content);
console.log("Added foto_url to Profile");
