const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = env.split('\n').find(l => l.includes('DATABASE_URL=')).split('=')[1].replace(/\"/g, '').trim();
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  
  try {
    const tas = await prisma.tahunAjaran.findMany();
    const counts = await prisma.pendaftar.groupBy({
      by: ['tahun_ajaran_id'],
      _count: { id: true }
    });
    
    fs.writeFileSync('scratch/year_mapping_result.json', JSON.stringify({ tas, counts }, null, 2));
    console.log("Success! Results in scratch/year_mapping_result.json");
  } catch (e) {
    fs.writeFileSync('scratch/year_mapping_error.txt', e.stack);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
