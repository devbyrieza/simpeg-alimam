// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findUnique({ 
    where: { nomor_pendaftaran: 'MTA2600016' }, 
    include: { nilai_ujian: true } 
  });
  
  const scores = p.nilai_ujian[0];
  let count = 0;
  if (scores) {
    if (scores.score_akademik != null) count++;
    if (scores.score_kepribadian != null) count++;
    if (scores.score_kesiapan != null) count++;
    if (scores.score_quran != null) count++;
    if (scores.nilai_wawancara_santri != null) count++;
    if (scores.nilai_wawancara_ortu != null) count++;
  }
  
  console.log(`Pendaftar: ${p.nama_lengkap}`);
  console.log(`Status: ${p.status_pendaftaran}`);
  console.log(`Score Count: ${count}`);
  console.log(`Scores: ${JSON.stringify(scores)}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
