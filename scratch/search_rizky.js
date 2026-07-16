// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const NAME_TARGET = 'Rizky Ananda';
  
  console.log(`Searching for records matching name: ${NAME_TARGET}`);

  // Fetch all NilaiUjian records
  const allScores = await prisma.nilaiUjian.findMany({
    include: { pendaftar: true }
  });

  const filtered = allScores.filter(s => 
    s.pendaftar && s.pendaftar.nama_lengkap.toLowerCase().includes(NAME_TARGET.toLowerCase())
  );

  console.log(`Found ${filtered.length} records.`);
  filtered.forEach(s => {
    console.log(`Pendaftar: ${s.pendaftar?.nama_lengkap} (${s.pendaftar?.nomor_pendaftaran})`);
    console.log(`  NilaiID: ${s.id}`);
    console.log(`  Ortu: ${s.nilai_wawancara_ortu}, Santri: ${s.nilai_wawancara_santri}, Quran: ${s.nilai_tes_quran}`);
    console.log(`  Pewawancara: ${s.detail_cawalsan?.nama_pewawancara || s.detail_wawancara?.nama_pewawancara || s.detail_quran?.nama_penguji}`);
    console.log(`  DetailOrtu: ${JSON.stringify(s.detail_cawalsan)}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
