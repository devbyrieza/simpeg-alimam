const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkScores() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: "1112600005" },
    include: {
      nilai_ujian: {
        orderBy: { updated_at: 'desc' }
      }
    }
  });

  if (!pendaftar) {
    console.log("Pendaftar not found");
    return;
  }

  console.log("Pendaftar:", pendaftar.nama_lengkap);
  console.log("Scores Count:", pendaftar.nilai_ujian.length);
  pendaftar.nilai_ujian.forEach((s, i) => {
    console.log(`--- Score ${i} ---`);
    console.log("ID:", s.id);
    console.log("Jadwal ID:", s.jadwal_ujian_id);
    console.log("Updated At:", s.updated_at);
    console.log("Detail Quran:", JSON.stringify(s.detail_quran));
    console.log("Detail Wawancara:", JSON.stringify(s.detail_wawancara));
    console.log("Detail Cawalsan:", JSON.stringify(s.detail_cawalsan));
  });
  await prisma.$disconnect();
}

checkScores().catch(console.error);
