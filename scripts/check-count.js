const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pendaftar.count();
  console.log(`Total Pendaftar: ${count}`);
  if (count > 0) {
    const list = await prisma.pendaftar.findMany({
      take: 10,
      select: { nama_lengkap: true }
    });
    console.log("Sample names:");
    list.forEach(p => console.log(`- ${p.nama_lengkap}`));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
