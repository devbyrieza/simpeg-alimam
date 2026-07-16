const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pendaftar = await prisma.pendaftar.findMany({ select: { id: true, nama_lengkap: true } });
  console.log(pendaftar);
}
main().catch(console.error).finally(() => prisma.$disconnect());
