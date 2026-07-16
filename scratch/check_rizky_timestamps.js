// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const REG_NUMBER = 'ILA2600006';
  
  const nilais = await prisma.nilaiUjian.findMany({
    where: { pendaftar: { nomor_pendaftaran: REG_NUMBER } },
    orderBy: { created_at: 'asc' }
  });

  console.log(`Found ${nilais.length} records for Rizky Ananda.`);
  nilais.forEach((n, i) => {
    console.log(`[${i}] ID: ${n.id}`);
    console.log(`    Created: ${n.created_at}`);
    console.log(`    Updated: ${n.updated_at}`);
    console.log(`    JadwalID: ${n.jadwal_ujian_id}`);
    console.log(`    Ortu Score: ${n.nilai_wawancara_ortu}`);
    console.log(`    Detail: ${JSON.stringify(n.detail_cawalsan)}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
