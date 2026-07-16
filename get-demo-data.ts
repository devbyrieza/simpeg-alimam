import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pendaftarList = await prisma.pendaftar.findMany({
    take: 5,
    select: {
      nama_lengkap: true,
      nomor_pendaftaran: true,
    }
  });

  console.log("=== DATA UNTUK DEMO KASIR ===");
  console.log("Gunakan nomor pendaftaran di bawah ini untuk dibuatkan QR Code di HP-mu (bisa pakai web qrcode-monkey.com):");
  pendaftarList.forEach((p, i) => {
    console.log(`${i + 1}. Nama: ${p.nama_lengkap}`);
    console.log(`   Kode QR (Nomor Pendaftaran): ${p.nomor_pendaftaran}`);
    console.log("----------------------------");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
