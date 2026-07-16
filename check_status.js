const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
      status_pendaftaran: true,
      data_lengkap: true,
    }
  });

  const counts = {};
  pendaftar.forEach(p => {
    counts[p.status_pendaftaran] = (counts[p.status_pendaftaran] || 0) + 1;
  });
  console.log("Counts:", counts);

  console.log("Details:");
  pendaftar.forEach(p => {
    let hasData = false;
    if (p.data_lengkap) {
      try {
        const parsed = typeof p.data_lengkap === 'string' ? JSON.parse(p.data_lengkap) : p.data_lengkap;
        if (Object.keys(parsed).length > 0) hasData = true;
      } catch (e) {}
    }
    console.log(`- ${p.nomor_pendaftaran} | ${p.nama_lengkap} | ${p.status_pendaftaran} | hasData: ${hasData}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
