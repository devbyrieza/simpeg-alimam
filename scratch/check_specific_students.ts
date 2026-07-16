import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const names = [
    "Daffa Muammar Dzaki",
    "Rieza Tes",
    "Labibullah El Fatih",
    "Farid",
    "Haidar Ayyubi",
    "Raylan Akbar",
    "Muhammad Azzam Al Hafiz"
  ];

  const students = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: { in: names }
    },
    select: {
      id: true,
      nama_lengkap: true,
      no_hp: true,
      status_pendaftaran: true,
      notif_hasil_tes_terkirim: true,
      whatsapp_logs: {
        where: { jenis_notif: 'hasil_tes' },
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });

  console.log(JSON.stringify(students, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
