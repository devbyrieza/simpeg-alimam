import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database...");

  // Check TahunAjaran
  let ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true }});
  if (!ta) {
    ta = await prisma.tahunAjaran.create({
      data: {
        nama: "2026/2027",
        tahun_mulai: 2026,
        tahun_selesai: 2027,
        is_active: true,
        tanggal_buka_pendaftaran: new Date(),
        tanggal_tutup_pendaftaran: new Date(new Date().getTime() + 30*24*60*60*1000),
      }
    });
    console.log("Created TahunAjaran:", ta.id);
  } else {
    console.log("Found TahunAjaran:", ta.id);
  }

  // Create Pendaftar
  let p = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: "ILA2600001" }});
  if (!p) {
    p = await prisma.pendaftar.create({
      data: {
        nomor_pendaftaran: "ILA2600001",
        nik: "3173010107101006",
        nama_lengkap: "Daffa Muammar Dzaki",
        jenis_kelamin: "Laki-laki",
        jenjang: "IL",
        status_pendaftaran: "accepted",
        tahun_ajaran_id: ta.id,
      }
    });
    console.log("Created Pendaftar:", p.nomor_pendaftaran);
  } else {
    // Update status to accepted just in case
    await prisma.pendaftar.update({
        where: { id: p.id },
        data: { status_pendaftaran: "accepted" }
    });
    console.log("Found Pendaftar:", p.nomor_pendaftaran);
  }

  // Create DompetSantri if not exists
  let d = await prisma.dompetSantri.findUnique({ where: { pendaftar_id: p.id }});
  if (!d) {
    d = await prisma.dompetSantri.create({
      data: {
        pendaftar_id: p.id,
        qr_code_string: "QR-ILA2600001-" + Date.now(),
        saldo: 0,
        status: "AKTIF"
      }
    });
    console.log("Created DompetSantri:", d.id);
  } else {
    console.log("Found DompetSantri:", d.id);
  }

  console.log("Done seeding!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
