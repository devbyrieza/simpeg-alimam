// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findUnique({ 
    where: { nomor_pendaftaran: 'MTA2600016' }, 
    select: { status_pendaftaran: true } 
  });
  console.log(JSON.stringify(p));
}

main().catch(console.error).finally(() => prisma.$disconnect());
