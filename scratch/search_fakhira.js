require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: 'Fakhira',
        mode: 'insensitive'
      }
    }
  });
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
