require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: 'Muhamad Rizky',
        mode: 'insensitive'
      }
    }
  });

  console.log('--- PENDAFTARS FOUND ---');
  pendaftars.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.nama_lengkap}, No: ${p.nomor_pendaftaran}, Status: ${p.status_pendaftaran}`);
  });

  if (pendaftars.length > 0) {
    const ids = pendaftars.map(p => p.id);
    const nilais = await prisma.nilaiUjian.findMany({
      where: { pendaftar_id: { in: ids } }
    });
    console.log('\n--- NILAI UJIAN RECORDS ---');
    nilais.forEach(n => {
      console.log(`PendaftarID: ${n.pendaftar_id}, NilaiID: ${n.id}, Created: ${n.created_at}, W_Santri: ${n.nilai_wawancara_santri}, W_Ortu: ${n.nilai_wawancara_ortu}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
