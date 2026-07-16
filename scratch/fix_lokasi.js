const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam',
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab',
  'c:/Users/itpua/Dev/Work/al-andalus/template-demo'
];

for (const dir of targetDirs) {
  // 1. whatsapp-queue.ts
  const waPath = path.join(dir, 'src/lib/whatsapp-queue.ts');
  if (fs.existsSync(waPath)) {
    let content = fs.readFileSync(waPath, 'utf8');
    content = content.replace(/📍 \*Link Meet:\*/g, '📍 *Lokasi/Link:*');
    fs.writeFileSync(waPath, content);
  }

  // 2. cron/reminder/route.ts
  const cronPath = path.join(dir, 'src/app/api/cron/reminder/route.ts');
  if (fs.existsSync(cronPath)) {
    let content = fs.readFileSync(cronPath, 'utf8');
    content = content.replace(
      /const lokasi = googleMeetLink\s*\?\s*\(googleMeetLink\.startsWith\("http"\)\s*\?\s*googleMeetLink\s*:\s*`\$\{jadwal\.exam_session\?\.location \|\| "Online"\}\s*\(\$\{googleMeetLink\}\)`\)\s*:\s*\(jadwal\.exam_session\?\.location \|\| "Pesantren Al Andalus Al Imam"\);/g,
      `const sessionLoc = jadwal.exam_session?.location || "Pesantren Al Andalus Al Imam";
            const lokasi = googleMeetLink
                ? googleMeetLink
                : (sessionLoc.toLowerCase() === "online" ? "-" : sessionLoc);`
    );
    fs.writeFileSync(cronPath, content);
  }

  // 3. pendaftar/jadwal/route.ts
  const jadwalPath = path.join(dir, 'src/app/api/pendaftar/jadwal/route.ts');
  if (fs.existsSync(jadwalPath)) {
    let content = fs.readFileSync(jadwalPath, 'utf8');
    
    const blockToReplace = `// Get interviewer info early for Google Meet link
        let interviewerGoogleMeetLink = null;
        if (examSession.created_by) {
          const interviewer = await prisma.profile.findUnique({
            where: { id: examSession.created_by },
            select: { google_meet_link: true },
          });
          interviewerGoogleMeetLink = interviewer?.google_meet_link;
        }

        // Build location with Google Meet link if available
        const lokasiWithMeet = interviewerGoogleMeetLink
          ? interviewerGoogleMeetLink.startsWith("http")
            ? interviewerGoogleMeetLink
            : \`Online (\${interviewerGoogleMeetLink})\`
          : lokasi;`;

    const newBlock = `// Get interviewer info early for Google Meet link
        const finalIdForLink =
            pengujiFields.penguji_quran_id ||
            pengujiFields.penguji_santri_id ||
            pengujiFields.penguji_ortu_id ||
            examSession.created_by;

        let interviewerGoogleMeetLink = null;
        if (finalIdForLink) {
          const interviewerInfo = await prisma.profile.findUnique({
            where: { id: finalIdForLink },
            select: { google_meet_link: true },
          });
          interviewerGoogleMeetLink = interviewerInfo?.google_meet_link;
        }

        const sessionLoc = lokasi || "Online";
        const lokasiWithMeet = interviewerGoogleMeetLink
          ? interviewerGoogleMeetLink
          : (sessionLoc.toLowerCase() === "online" ? "-" : sessionLoc);`;

    if (content.includes(blockToReplace)) {
        content = content.replace(blockToReplace, newBlock);
    } else {
        // Fallback replacement if formatting differs
        content = content.replace(/let interviewerGoogleMeetLink = null;[\s\S]*?: lokasi;/g, newBlock);
    }

    fs.writeFileSync(jadwalPath, content);
  }
}
