
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAssignment() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: 'MTI2600005' },
    include: { 
      jadwal_ujian: {
        include: {
          exam_session: true
        }
      }
    }
  });

  console.log('--- DATA PENDAFTAR ---');
  console.log(JSON.stringify({ id: pendaftar?.id, nama: pendaftar?.nama_lengkap }, null, 2));
  
  console.log('\n--- DATA JADWAL & PENGUJI ---');
  console.log(JSON.stringify(pendaftar?.jadwal_ujian, null, 2));
  
  await prisma.$disconnect();
}

checkAssignment();
