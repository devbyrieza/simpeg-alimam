// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching for NilaiUjian records from yesterday (May 14, 2026)...');

  const start = new Date('2026-05-14T00:00:00Z');
  const end = new Date('2026-05-14T23:59:59Z');

  const records = await prisma.nilaiUjian.findMany({
    where: {
      OR: [
        { updated_at: { gte: start, lte: end } },
        { input_at_ortu: { gte: start, lte: end } }
      ]
    },
    include: { pendaftar: true }
  });

  console.log(`Found ${records.length} records.`);
  records.forEach(r => {
    console.log(`Pendaftar: ${r.pendaftar?.nama_lengkap} (${r.pendaftar?.nomor_pendaftaran})`);
    console.log(`  NilaiID: ${r.id}, UpdatedAt: ${r.updated_at}, InputAtOrtu: ${r.input_at_ortu}`);
    console.log(`  Ortu: ${r.nilai_wawancara_ortu}, Pewawancara: ${r.detail_cawalsan?.nama_pewawancara}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
