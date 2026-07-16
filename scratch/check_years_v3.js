const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = env.split('\n').find(l => l.includes('DATABASE_URL=')).split('=')[1].replace(/\"/g, '').trim();
  
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const tas = await prisma.tahunAjaran.findMany();
    console.log("TAHUN AJARAN LIST:");
    console.log(JSON.stringify(tas, null, 2));

    const pendaftarByYear = await prisma.pendaftar.groupBy({
      by: ['tahun_ajaran_id'],
      _count: { id: true }
    });
    console.log("\nPENDAFTAR BY YEAR ID:");
    console.log(JSON.stringify(pendaftarByYear, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
