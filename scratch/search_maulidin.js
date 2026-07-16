// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const EXAMINER_NAME = 'Maulidin Bachtiar';
  
  console.log(`Searching for records updated by: ${EXAMINER_NAME}`);

  // Fetch all NilaiUjian records
  const allScores = await prisma.nilaiUjian.findMany({
    include: { pendaftar: true }
  });

  const filtered = allScores.filter(s => {
    const detailOrtu = s.detail_cawalsan || {};
    const detailSantri = s.detail_wawancara || {};
    const detailQuran = s.detail_quran || {};
    
    return (
      (detailOrtu.nama_pewawancara && detailOrtu.nama_pewawancara.toLowerCase().includes(EXAMINER_NAME.toLowerCase())) ||
      (detailSantri.nama_pewawancara && detailSantri.nama_pewawancara.toLowerCase().includes(EXAMINER_NAME.toLowerCase())) ||
      (detailQuran.nama_penguji && detailQuran.nama_penguji.toLowerCase().includes(EXAMINER_NAME.toLowerCase())) ||
      (s.input_by_ortu && s.input_by_ortu.toLowerCase().includes(EXAMINER_NAME.toLowerCase()))
    );
  });

  console.log(`Found ${filtered.length} records.`);
  filtered.forEach(s => {
    console.log(`Pendaftar: ${s.pendaftar?.nama_lengkap} (${s.pendaftar?.nomor_pendaftaran})`);
    console.log(`  NilaiID: ${s.id}`);
    console.log(`  Ortu: ${s.nilai_wawancara_ortu}, Santri: ${s.nilai_wawancara_santri}, Quran: ${s.nilai_tes_quran}`);
    console.log(`  Pewawancara: ${s.detail_cawalsan?.nama_pewawancara || s.detail_wawancara?.nama_pewawancara || s.detail_quran?.nama_penguji}`);
    console.log(`  InputAtOrtu: ${s.input_at_ortu}`);
    console.log(`  DetailOrtu: ${JSON.stringify(s.detail_cawalsan)}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
