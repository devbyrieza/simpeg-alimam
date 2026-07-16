import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.whatsappLog.findMany({
    where: {
      jenis_notif: 'hasil_tes',
    },
    include: {
      pendaftar: {
        select: {
          nama_lengkap: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 10,
  });

  console.log(JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
