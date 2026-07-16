require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check for ALL pendaftars including deleted ones if possible
  // Prisma doesn't show deleted ones by default if they are filtered, 
  // but here it's not a soft-delete in Prisma logic unless using a middleware.
  // The schema has deleted_at, so we just check for it.

  const allPendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: 'Rizky Ananda',
        mode: 'insensitive'
      }
    }
  });

  console.log('--- ALL PENDAFTARS (Including potentially soft-deleted) ---');
  for (const p of allPendaftars) {
    console.log(`ID: ${p.id}, Name: ${p.nama_lengkap}, No: ${p.nomor_pendaftaran}, DeletedAt: ${p.deleted_at}`);
    
    const nilais = await prisma.nilaiUjian.findMany({
      where: { pendaftar_id: p.id }
    });
    
    console.log(`  Found ${nilais.length} NilaiUjian records.`);
    nilais.forEach(n => {
      console.log(`    NilaiID: ${n.id}, W_Santri: ${n.nilai_wawancara_santri}, W_Ortu: ${n.nilai_wawancara_ortu}, DetailOrtu: ${n.detail_cawalsan ? 'YES' : 'NO'}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
