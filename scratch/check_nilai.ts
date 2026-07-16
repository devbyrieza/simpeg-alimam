
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: 'MTI2600005' },
    include: { nilai_ujian: true }
  });

  console.log('--- PENDAFTAR ---');
  console.log(JSON.stringify({ id: pendaftar?.id, nama: pendaftar?.nama_lengkap }, null, 2));
  
  console.log('\n--- NILAI UJIAN ---');
  console.log(JSON.stringify(pendaftar?.nilai_ujian, null, 2));
  
  await prisma.$disconnect();
}

checkData();
