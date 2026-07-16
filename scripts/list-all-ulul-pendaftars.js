const { PrismaClient } = require('@prisma/client');

const url = "postgresql://admin_ulul:password123@72.61.141.50:5432/db_ululalbaab_migrasi";
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
      jenjang: true,
      status_pendaftaran: true
    },
    orderBy: { nama_lengkap: 'asc' }
  });

  console.log(`Total pendaftar in db_ululalbaab_migrasi: ${pendaftars.length}`);
  pendaftars.forEach((p, index) => {
    console.log(`${index + 1}. ${p.nama_lengkap} (${p.nomor_pendaftaran}) - ${p.jenjang} - ${p.status_pendaftaran}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
