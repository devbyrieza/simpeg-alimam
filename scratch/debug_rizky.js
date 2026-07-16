require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: {
      nama_lengkap: {
        contains: 'Lalu Muhamad Rizky Ananda',
        mode: 'insensitive'
      }
    },
    include: {
      jadwal_ujian: {
        include: {
          exam_session: true,
          nilai_ujian: true
        }
      },
      nilai_ujian: true
    }
  });

  console.log(JSON.stringify(pendaftar, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
