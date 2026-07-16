import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.whatsappLog.findMany({
    where: {
      jenis_notif: "broadcast",
      created_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { created_at: 'desc' },
    take: 10
  });
  console.log("Recent broadcast logs:", logs);
  
  const recentPendaftar = await prisma.pendaftar.findFirst({
    where: { user_id: { not: null } }
  });
  
  if (recentPendaftar) {
     const queueParams = {
        phone: recentPendaftar.no_hp || "081234567890",
        messageContent: "Test",
        jenisNotif: "broadcast" as const,
        pendaftarId: recentPendaftar.id,
        force: true
     };
     console.log("Testing enqueueWhatsapp with force:true");
     
     // I will use raw query to see if the table exists
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
