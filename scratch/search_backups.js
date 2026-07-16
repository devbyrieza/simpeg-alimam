// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const NAME_TARGET = 'Rizky Ananda';
  
  console.log(`Searching for backups matching name: ${NAME_TARGET}`);

  const backups = await prisma.pendaftarBackup.findMany({
    where: {
      nama_lengkap: { contains: NAME_TARGET, mode: 'insensitive' }
    }
  });

  console.log(`Found ${backups.length} backups.`);
  backups.forEach(b => {
    console.log(`BackupID: ${b.id}, Name: ${b.nama_lengkap}, No: ${b.nomor_pendaftaran}, DeletedAt: ${b.deleted_at}`);
    const data = b.backup_data;
    if (data && data.nilai_ujian) {
      console.log(`  Scores in backup: ${data.nilai_ujian.length}`);
      data.nilai_ujian.forEach((n, i) => {
        console.log(`    [${i}] Ortu: ${n.nilai_wawancara_ortu}, DetailOrtu: ${JSON.stringify(n.detail_cawalsan)}`);
      });
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
