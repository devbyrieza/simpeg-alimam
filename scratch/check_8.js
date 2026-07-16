// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: 'ILA2600008' } });
  console.log(p ? p.nama_lengkap : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
