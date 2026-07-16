const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam',
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab',
  'c:/Users/itpua/Dev/Work/al-andalus/template-demo'
];

for (const dir of targetDirs) {
  const cronPath = path.join(dir, 'src/app/api/cron/reminder/route.ts');
  if (fs.existsSync(cronPath)) {
    let content = fs.readFileSync(cronPath, 'utf8');
    
    if (!content.includes('const fullAppUrl')) {
      content = content.replace(
        /const now = new Date\(\);/g,
        `const host = request.headers.get("host") || "pesantren-alimam.com";
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const reqBaseUrl = \`\${protocol}://\${host}\`;
        const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || "";
        const fullAppUrl = appUrlEnv.startsWith("http") ? appUrlEnv : \`\${reqBaseUrl}\${appUrlEnv}\`;\n\n        const now = new Date();`
      );
    }
    
    // Ensure magicLink is using fullAppUrl
    content = content.replace(
      /const magicLink = `\$\{process\.env\.NEXT_PUBLIC_APP_URL \|\| 'https:\/\/pesantren-alimam\.com'\}\/api\/auth\/magic\?token=\$\{token\}`;/g,
      `const magicLink = \`\${fullAppUrl}/api/auth/magic?token=\${token}\`;`
    );

    // Ensure getPermanentAuthUrl uses fullAppUrl
    content = content.replace(
      /const dynamicAuthUrl = getPermanentAuthUrl\(slug, jadwal\.pendaftar\.nomor_pendaftaran\);/g,
      `const dynamicAuthUrl = getPermanentAuthUrl(slug, jadwal.pendaftar.nomor_pendaftaran, fullAppUrl);`
    );

    fs.writeFileSync(cronPath, content);
  }
}
