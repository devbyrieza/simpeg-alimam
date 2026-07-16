import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Searching for duplicate records...');
  
  const pendaftar16 = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2600016' },
    include: {
      user: true,
      _count: {
        select: {
          whatsapp_logs: true,
          dokumen: true,
          pembayaran: true,
          jadwal_ujian: true,
        },
      },
    },
  });

  const pendaftar19 = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2600019' },
    include: {
      user: true,
      _count: {
        select: {
          whatsapp_logs: true,
          dokumen: true,
          pembayaran: true,
          jadwal_ujian: true,
        },
      },
    },
  });

  console.log('MTA2600016:', JSON.stringify(pendaftar16, null, 2));
  console.log('MTA2600019:', JSON.stringify(pendaftar19, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
