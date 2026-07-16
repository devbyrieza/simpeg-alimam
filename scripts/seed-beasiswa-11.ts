import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const TAHUN_AJARAN_ID = "33acea8f-5049-4a0a-a064-ede3db6d133f"; // 2026/2027

// 7 Beasiswa Full Uang Pangkal (Potongan Rp 7.500.000)
const beasiswaFull = [
  { nama: "Labibullah El Fatih", reg: "MTA2600010" },
  { nama: "Fariq Malaibui", reg: "MTA2600023" },
  { nama: "Muhammad Rizky", reg: "ILA2600014" },
  { nama: "Muh Asrorin Da Silva", reg: "MTA2600022" },
  { nama: "Azka Panji Kusuma", reg: "MTA2600021" },
  { nama: "M Fazril Alkais", reg: "MTA2600020" },
  { nama: "Naufal Dzakiy Purnama", reg: "MTA2600024" }
];

// 4 Keringanan Potongan (Potongan Rp 1.500.000)
const keringananPotongan = [
  { nama: "Haidar Ayyubi", reg: "MTA2600009" },
  { nama: "Atqanul Ummah Ahmad", reg: "MTA2600001" },
  { nama: "Muhammad Hafidz Reo Afelano", reg: "MTA2600015" },
  { nama: "Muhammad Rasyid Ridho", reg: "ILA2600015" }
];

async function seedStudent(student: { nama: string, reg: string }, type: "BEASISWA_PRESTASI" | "KERINGANAN_BIAYA", discount: number) {
  console.log(`Processing ${student.nama} (${student.reg}) - Type: ${type}, Discount: ${discount}...`);

  // Find pendaftar by registration number
  const pendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: student.reg }
  });

  if (!pendaftar) {
    console.error(`❌ Student not found: ${student.nama} (${student.reg})`);
    return;
  }

  // 1. Create or Update PengajuanBeasiswa
  const now = new Date();
  const pengajuan = await prisma.pengajuanBeasiswa.upsert({
    where: { pendaftar_id: pendaftar.id },
    update: {
      jenis_pengajuan: type,
      alasan_pengajuan: type === "BEASISWA_PRESTASI" ? "Beasiswa Full Uang Pangkal (Lazsip)" : "Keringanan Potongan Uang Pangkal (Lazsip)",
      nominal_kesanggupan: null,
      status: "DISETUJUI",
      nominal_potongan: discount,
      tipe_potongan: "NOMINAL",
      disetujui_oleh: null, // system seeded
      disetujui_pada: now,
      updated_at: now
    },
    create: {
      pendaftar_id: pendaftar.id,
      tahun_ajaran_id: TAHUN_AJARAN_ID,
      jenis_pengajuan: type,
      alasan_pengajuan: type === "BEASISWA_PRESTASI" ? "Beasiswa Full Uang Pangkal (Lazsip)" : "Keringanan Potongan Uang Pangkal (Lazsip)",
      nominal_kesanggupan: null,
      status: "DISETUJUI",
      nominal_potongan: discount,
      tipe_potongan: "NOMINAL",
      disetujui_pada: now
    }
  });

  // 2. Sync to Pendaftar data_lengkap.keringanan_daftar_ulang
  let dataLengkap = pendaftar.data_lengkap as any || {};
  if (typeof dataLengkap === "string") {
    try { dataLengkap = JSON.parse(dataLengkap); } catch (e) { dataLengkap = {}; }
  }

  dataLengkap.keringanan_daftar_ulang = {
    jenis: type,
    nominal_potongan: discount
  };

  await prisma.pendaftar.update({
    where: { id: pendaftar.id },
    data: { data_lengkap: dataLengkap }
  });

  // 3. Update existing DAFTAR_ULANG payment records if any
  const payments = await prisma.pembayaran.findMany({
    where: {
      pendaftar_id: pendaftar.id,
      jenis_pembayaran: "DAFTAR_ULANG"
    }
  });

  for (const pay of payments) {
    const normalTotal = 8500000;
    const newTotal = normalTotal - discount;
    console.log(`   Updating payment ${pay.id} total_tagihan from ${pay.total_tagihan} to ${newTotal}`);
    await prisma.pembayaran.update({
      where: { id: pay.id },
      data: { total_tagihan: newTotal }
    });
  }

  console.log(`   ✅ Successfully processed ${student.nama}`);
}

async function main() {
  console.log("Starting scholarship & discount seeding...");

  // Seed Beasiswa Full
  for (const s of beasiswaFull) {
    await seedStudent(s, "BEASISWA_PRESTASI", 7500000);
  }

  // Seed Keringanan
  for (const s of keringananPotongan) {
    await seedStudent(s, "KERINGANAN_BIAYA", 1500000);
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch(err => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
