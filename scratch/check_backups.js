require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const backups = await prisma.pendaftarBackup.findMany({
    where: {
      nama_lengkap: {
        contains: 'Rizky Ananda',
        mode: 'insensitive'
      }
    }
  });

  console.log(`--- PENDAFTAR BACKUPS FOUND: ${backups.length} ---`);
  backups.forEach(b => {
    console.log(`BackupID: ${b.id}, Name: ${b.nama_lengkap}, No: ${b.nomor_pendaftaran}, DeletedAt: ${b.deleted_at}`);
    const data = b.backup_data;
    if (data && data.nilai_ujian) {
      console.log(`  Scores in backup: ${data.nilai_ujian.length}`);
      data.nilai_ujian.forEach((n, i) => {
        console.log(`    [${i}] W_Santri: ${n.nilai_wawancara_santri}, W_Ortu: ${n.nilai_wawancara_ortu}, DetailOrtu: ${n.detail_cawalsan ? 'YES' : 'NO'}`);
      });
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
