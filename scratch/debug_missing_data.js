const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const where = {
    deleted_at: null,
    NOT: [
      {
        AND: [
          { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
          { nama_lengkap: { not: { contains: "Rieza Tes", mode: "insensitive" } } }
        ]
      },
      { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
      { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
    ]
  };

  const total = await prisma.pendaftar.count({ where });
  console.log("Total Pendaftar (Filtered):", total);

  const byYear = await prisma.pendaftar.groupBy({
    by: ['tahun_ajaran_id'],
    _count: { id: true },
    where
  });
  console.log("By Year:", JSON.stringify(byYear, null, 2));

  const years = await prisma.tahunAjaran.findMany();
  console.log("Years:", JSON.stringify(years, null, 2));
}

main();
