const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.pendaftar.findMany({
    where: {
      data_lengkap: {
        path: ['keringanan_daftar_ulang'],
        not: null
      }
    },
    select: {
      nama_lengkap: true,
      data_lengkap: true
    }
  });

  console.log("Found students with keringanan JSON:");
  students.forEach(s => {
    console.log(`Student: ${s.nama_lengkap}`);
    console.log(`JSON:`, JSON.stringify((s.data_lengkap || {}).keringanan_daftar_ulang, null, 2));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
