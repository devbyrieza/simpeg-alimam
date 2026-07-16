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
      data_lengkap: true,
      pengajuan_beasiswa: {
        select: {
          status: true,
          jenis_pengajuan: true,
          nominal_potongan: true,
        }
      },
      pembayaran: {
        where: { jenis_pembayaran: "DAFTAR_ULANG" },
        select: { keringanan_reason: true, status_pembayaran: true }
      }
    }
  });

  const rekapData = students.map((student) => {
    const dataLengkap = student.data_lengkap || {};
    const keringananJson = dataLengkap.keringanan_daftar_ulang || {};
    const isApproved = student.pengajuan_beasiswa?.status === "DISETUJUI" || !!keringananJson.nominal_potongan;
    const nominalPotongan = Number(
      (student.pengajuan_beasiswa?.status === "DISETUJUI" ? student.pengajuan_beasiswa?.nominal_potongan : null) ?? 
      keringananJson.nominal_potongan ?? 
      0
    );

    const verifiedPayments = student.pembayaran.filter((p) => p.status_pembayaran === "verified");
    const reasons = verifiedPayments.map((p) => p.keringanan_reason).filter(Boolean);

    if (isApproved) {
      let beasiswaLabel = "Keringanan Biaya";
      if (keringananJson.jenis) {
        beasiswaLabel = keringananJson.jenis;
      } else if (student.pengajuan_beasiswa?.status === "DISETUJUI") {
        const rawJenis = student.pengajuan_beasiswa.jenis_pengajuan || "";
        if (rawJenis === "BEASISWA_PRESTASI") {
          beasiswaLabel = "Beasiswa Prestasi";
        } else if (rawJenis === "KERINGANAN_BIAYA") {
          beasiswaLabel = "Keringanan Biaya";
        } else if (rawJenis) {
          beasiswaLabel = rawJenis
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }
      reasons.unshift(`${beasiswaLabel} (Potongan: Rp ${nominalPotongan.toLocaleString("id-ID")})`);
    }
    const keringanan_reason = reasons.length > 0 ? reasons.join(" | ") : null;

    return {
      nama: student.nama_lengkap,
      keringanan_reason
    };
  });

  console.log(JSON.stringify(rekapData, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
