const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const baseWhere = {
    deleted_at: null,
    tahun_ajaran_id: '33acea8f-5049-4a0a-a064-ede3db6d133f',
    NOT: [
      {
        AND: [
          { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
          {
            NOT: {
              nama_lengkap: { contains: "Rieza Tes", mode: "insensitive" },
            },
          },
        ],
      },
      { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
      { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } },
    ],
  };

  const students = await prisma.pendaftar.findMany({
    where: {
      ...baseWhere,
      status_pendaftaran: {
        not: "mengundurkan_diri",
      },
      OR: [
        {
          nilai_ujian: {
            some: {
              status_kelulusan: { in: ["LULUS", "DITERIMA"] },
            },
          },
        },
        {
          hasil_seleksi: {
            status_seleksi: { in: ["DITERIMA", "CADANGAN"] },
          },
        },
        {
          pengumuman: {
            status_kelulusan: { in: ["Lulus", "Diterima", "Cadangan"] },
          },
        },
        {
          status_pendaftaran: { in: ["accepted", "announced", "cadangan", "passed", "enrolled"] },
        },
        {
          tipe_pendaftaran: "PINDAHAN",
        },
        {
          nama_lengkap: { contains: "Fariq Malaibui", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "Asrorin", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "Azka Panji", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "Fazril", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "Muhammad Rizky", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "M. Rizky", mode: "insensitive" },
        },
        {
          nama_lengkap: { contains: "M Rizky", mode: "insensitive" },
        },
      ],
    },
    select: {
      nama_lengkap: true,
      nomor_pendaftaran: true,
      status_pendaftaran: true
    }
  });

  console.log("Returned students count:", students.length);
  console.log("Returned students:", students.map(s => s.nama_lengkap));
}

main().catch(console.error).finally(() => prisma.$disconnect());
