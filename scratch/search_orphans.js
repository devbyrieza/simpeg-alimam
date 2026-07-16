// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching for orphaned NilaiUjian records...');

  // 1. Get all active pendaftar IDs
  const activePendaftarIds = (await prisma.pendaftar.findMany({ select: { id: true } })).map(p => p.id);
  
  // 2. Find NilaiUjian records where pendaftar_id is NOT in active list
  const orphans = await prisma.nilaiUjian.findMany({
    where: {
      pendaftar_id: { notIn: activePendaftarIds }
    }
  });

  console.log(`Found ${orphans.length} orphaned NilaiUjian records.`);
  orphans.forEach(o => {
    console.log(`ID: ${o.id}, PendaftarID: ${o.pendaftar_id}, Ortu: ${o.nilai_wawancara_ortu}`);
    if (o.detail_cawalsan) {
        console.log(`  Detail: ${JSON.stringify(o.detail_cawalsan)}`);
    }
  });

  // 3. Search for any NilaiUjian that has "Zakiyyah" or "Maulidin" in its JSON but we haven't seen yet
  // We already did this via search_maulidin v3.
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
