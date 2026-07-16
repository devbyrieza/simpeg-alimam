const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam',
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab',
  'c:/Users/itpua/Dev/Work/al-andalus/template-demo'
];

for (const dir of targetDirs) {
  console.log(`Processing ${dir}`);

  // 1. Fix whatsapp-queue.ts
  const waQueuePath = path.join(dir, 'src/lib/whatsapp-queue.ts');
  if (fs.existsSync(waQueuePath)) {
    let content = fs.readFileSync(waQueuePath, 'utf8');
    content = content.replace(
      /Mengingatkan jadwal \$\{agendaText\.includes\("Wawancara"\) \? "wawancara" : "menguji"\} Ustadz\/Ustadzah:/g,
      'Mengingatkan jadwal ${agendaText.includes("Wawancara") ? "wawancara" : "menguji"} ${title}:'
    );
    fs.writeFileSync(waQueuePath, content);
  }

  // 2. Fix magic-link.ts
  const magicLinkPath = path.join(dir, 'src/lib/utils/magic-link.ts');
  if (fs.existsSync(magicLinkPath)) {
    let content = fs.readFileSync(magicLinkPath, 'utf8');
    content = content.replace(
      /export function getPermanentAuthUrl\(\s*slug: string,\s*pendaftarNomor\?: string,?\s*\): string \{/g,
      `export function getPermanentAuthUrl(
  slug: string,
  pendaftarNomor?: string,
  baseUrlOverride?: string,
): string {`
    );
    content = content.replace(
      /const baseUrl =\s*process\.env\.NEXT_PUBLIC_APP_URL \|\| "\/daftar";/g,
      `const baseUrl = baseUrlOverride || process.env.NEXT_PUBLIC_APP_URL || "/daftar";`
    );
    fs.writeFileSync(magicLinkPath, content);
  }

  // 3. Fix cron/reminder/route.ts
  const cronPath = path.join(dir, 'src/app/api/cron/reminder/route.ts');
  if (fs.existsSync(cronPath)) {
    let content = fs.readFileSync(cronPath, 'utf8');
    
    // Insert fullAppUrl definition if not exists
    if (!content.includes('const reqBaseUrl')) {
      content = content.replace(
        /const startOfDay = new Date\(\);/g,
        `const host = req.headers.get("host") || "pesantren-alimam.com";
        const protocol = req.headers.get("x-forwarded-proto") || "https";
        const reqBaseUrl = \`\${protocol}://\${host}\`;
        const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || "";
        const fullAppUrl = appUrlEnv.startsWith("http") ? appUrlEnv : \`\${reqBaseUrl}\${appUrlEnv}\`;\n\n        const startOfDay = new Date();`
      );
    }
    
    // Fix magicLink usage
    content = content.replace(
      /const magicLink = `\$\{process\.env\.NEXT_PUBLIC_APP_URL \|\| 'https:\/\/pesantren-alimam\.com'\}\/api\/auth\/magic\?token=\$\{token\}`;/g,
      `const magicLink = \`\${fullAppUrl}/api/auth/magic?token=\${token}\`;`
    );

    // Fix getPermanentAuthUrl call
    content = content.replace(
      /const dynamicAuthUrl = getPermanentAuthUrl\(slug, jadwal\.pendaftar\.nomor_pendaftaran\);/g,
      `const dynamicAuthUrl = getPermanentAuthUrl(slug, jadwal.pendaftar.nomor_pendaftaran, fullAppUrl);`
    );

    // Fix google_meet_link fallback
    content = content.replace(
      /profile\.google_meet_link \|\| "Menyesuaikan",/g,
      `profile.google_meet_link || "-",`
    );

    fs.writeFileSync(cronPath, content);
  }

  // 4. Fix pendaftar/jadwal/route.ts
  const jadwalRoutePath = path.join(dir, 'src/app/api/pendaftar/jadwal/route.ts');
  if (fs.existsSync(jadwalRoutePath)) {
    let content = fs.readFileSync(jadwalRoutePath, 'utf8');

    if (!content.includes('const fullAppUrl')) {
        content = content.replace(
          /const redirectPathH1 = `\/dashboard\/penguji\/input-nilai\?search=\$\{encodeURIComponent\(pendaftarInfo\.nama_lengkap\)\}`;/g,
          `const host = req.headers.get("host") || "pesantren-alimam.com";
            const protocol = req.headers.get("x-forwarded-proto") || "https";
            const reqBaseUrl = \`\${protocol}://\${host}\`;
            const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || "";
            const fullAppUrl = appUrlEnv.startsWith("http") ? appUrlEnv : \`\${reqBaseUrl}\${appUrlEnv}\`;
            
            const redirectPathH1 = \`/dashboard/penguji/input-nilai?search=\${encodeURIComponent(pendaftarInfo.nama_lengkap)}\`;`
        );
    }

    content = content.replace(
      /const magicLinkRem4h = `\$\{process\.env\.NEXT_PUBLIC_APP_URL \|\| "https:\/\/pesantren-alimam\.com"\}\/api\/auth\/magic\?token=\$\{tokenH1\}`;/g,
      `const magicLinkRem4h = \`\${fullAppUrl}/api/auth/magic?token=\${tokenH1}\`;`
    );

    // Replace the generateShortLink section to use slug if possible
    content = content.replace(
      /const \{ generateShortLink \} =\s*await import\("@\/lib\/utils\/magic-link"\);\s*const shortUrlRem4h =\s*\(await generateShortLink\(magicLinkRem4h\)\);/g,
      `const { generateShortLink, getSlugByName, getPermanentAuthUrl } = await import("@/lib/utils/magic-link");
            const slug = getSlugByName(interviewer.full_name);
            let shortUrlRem4h = "";
            if (slug) {
                const dynamicAuthUrl = getPermanentAuthUrl(slug, pendaftarInfo.nomor_pendaftaran, fullAppUrl);
                shortUrlRem4h = await generateShortLink(dynamicAuthUrl);
            } else {
                shortUrlRem4h = await generateShortLink(magicLinkRem4h);
            }`
    );

    // Fix buildMessageReminderH1Penguji call
    content = content.replace(
      /const remIntMessage = buildMessageReminderH1Penguji\([\s\S]*?interviewer\.full_name,\s*pendaftarInfo\.nama_lengkap,\s*dateStr\.split\([^)]*\)\[0\] \|\| "",\s*dateStr,\s*timeStr,\s*interviewer\.google_meet_link \|\| lokasi,\s*jenisUjian,\s*undefined, \/\/ gender \(default L\)\s*shortUrlRem4h,?\s*\);/g,
      `const gender = (interviewer.full_name.match(/halimah|maryani|fatimah|azzahra|putri|utami/i)) ? "P" : "L";
              const remIntMessage = buildMessageReminderH1Penguji(
                interviewer.full_name,
                pendaftarInfo.nama_lengkap,
                dateStr.split(",")[0] || "",
                dateStr,
                timeStr,
                interviewer.google_meet_link || "-",
                jenisUjian,
                gender,
                shortUrlRem4h,
              );`
    );

    fs.writeFileSync(jadwalRoutePath, content);
  }

}
console.log("Fixes applied.");
