require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  console.log(`Checking schedules between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

  const schedules = await prisma.jadwalUjian.findMany({
    where: {
      tanggal_ujian: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    include: {
      pendaftar: true,
      exam_session: true,
      penguji_santri: true,
      penguji_quran: true,
      penguji_ortu: true,
    },
  });

  console.log(`Total schedules found: ${schedules.length}`);

  for (const s of schedules) {
    console.log(`---`);
    console.log(`Santri: ${s.pendaftar.nama_lengkap}`);
    console.log(`Session: ${s.exam_session?.title || 'Manual'}`);
    console.log(`Time: ${s.exam_session?.start_time || s.waktu_mulai_santri}`);
    
    if (s.penguji_santri) console.log(`  Penguji Santri: ${s.penguji_santri.full_name} (${s.penguji_santri.google_meet_link || 'NO LINK'})`);
    if (s.penguji_quran) console.log(`  Penguji Quran: ${s.penguji_quran.full_name} (${s.penguji_quran.google_meet_link || 'NO LINK'})`);
    if (s.penguji_ortu) console.log(`  Penguji Ortu: ${s.penguji_ortu.full_name} (${s.penguji_ortu.google_meet_link || 'NO LINK'})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
