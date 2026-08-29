const fs = require('fs');
const file = 'src/app/api/profile/update/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const { full_name, email, phone, username } = body;/,
  'const { full_name, email, phone, username, foto_url } = body;'
);

content = content.replace(
  /phone: phone \|\| "",\r?\n\s*username: username \? username\.toLowerCase\(\)\.trim\(\) : null/,
  'phone: phone || "",\n        username: username ? username.toLowerCase().trim() : null,\n        ...(foto_url !== undefined && { foto_url })'
);

content = content.replace(
  /phone: updatedProfile\.phone,\r?\n\s*username: updatedProfile\.username/,
  'phone: updatedProfile.phone,\n      username: updatedProfile.username,\n      foto_url: updatedProfile.foto_url'
);

fs.writeFileSync(file, content);
console.log("Updated API route");
