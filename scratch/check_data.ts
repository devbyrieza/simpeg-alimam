import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const names = ['Haidar Ayyubi', 'Daffa Muammar Dzaki'];
  const candidates = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: '',
      },
      OR: names.map(name => ({ nama_lengkap: { contains: name, mode: 'insensitive' } }))
    },
    include: {
      nilai_ujian: true,
      jadwal_ujian: {
        include: {
          exam_session: true
        }
      }
    }
  });

  console.log(JSON.stringify(candidates, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
