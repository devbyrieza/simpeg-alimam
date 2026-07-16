import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  console.log("=== DIAGNOSTIC DATABASE STATUS ===");

  // 1. Check deleted_at status
  const total = await prisma.pendaftar.count();
  const deletedCount = await prisma.pendaftar.count({
    where: { NOT: { deleted_at: null } }
  });
  const activeCount = await prisma.pendaftar.count({
    where: { deleted_at: null }
  });
  console.log(`Total records: ${total}`);
  console.log(`Soft deleted (deleted_at NOT null): ${deletedCount}`);
  console.log(`Active (deleted_at null): ${activeCount}`);

  // 2. Count distinct status_pendaftaran values
  const statuses = await prisma.pendaftar.groupBy({
    by: ['status_pendaftaran'],
    _count: { id: true },
    where: { deleted_at: null }
  });
  console.log("Active records by status_pendaftaran:", statuses);

  // 3. Count students who are accepted by different methods
  const passExam = await prisma.pendaftar.count({
    where: {
      deleted_at: null,
      nilai_ujian: { some: { status_kelulusan: "LULUS" } }
    }
  });
  const hasilDiterima = await prisma.pendaftar.count({
    where: {
      deleted_at: null,
      hasil_seleksi: { status_seleksi: "DITERIMA" }
    }
  });
  const announcedAccepted = await prisma.pendaftar.count({
    where: {
      deleted_at: null,
      status_pendaftaran: { in: ["accepted", "announced"] }
    }
  });
  console.log(`nilai_ujian.status_kelulusan LULUS: ${passExam}`);
  console.log(`hasil_seleksi.status_seleksi DITERIMA: ${hasilDiterima}`);
  console.log(`status_pendaftaran accepted/announced: ${announcedAccepted}`);

  // 4. Check if there are payment records for deleted pendaftar
  const deletedPayments = await prisma.pembayaran.count({
    where: {
      pendaftar: { NOT: { deleted_at: null } }
    }
  });
  console.log(`Payments associated with deleted pendaftars: ${deletedPayments}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

