require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        startsWith: 'F',
        mode: 'insensitive'
      }
    }
  });
  console.log(results.map(r => r.nama_lengkap));
}

main().catch(console.error).finally(() => prisma.$disconnect());
