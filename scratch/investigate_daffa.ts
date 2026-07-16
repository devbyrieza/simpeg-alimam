import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Investigating Daffa Muammar Dzaki ---");

  const pendaftar = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: "Daffa",
      },
    },
    include: {
      nilai_ujian: true,
      orang_tua: true,
    },
  });

  if (pendaftar.length === 0) {
    console.log("No pendaftar found with that name.");
  } else {
    for (const p of pendaftar) {
      console.log(`\nID: ${p.id}`);
      console.log(`Nama: ${p.nama_lengkap}`);
      console.log(`Nomor Pendaftaran: ${p.nomor_pendaftaran}`);
      console.log(`Status: ${p.status_pendaftaran}`);
      console.log(`Nilai Ujian Count: ${p.nilai_ujian.length}`);
      
      p.nilai_ujian.forEach(s => {
        console.log(`Nilai Ujian ID: ${s.id}`);
        console.log(`  Santri Score: ${s.nilai_wawancara_santri}`);
        console.log(`  Quran Score: ${s.nilai_tes_quran}`);
        console.log(`  Ortu Score: ${s.nilai_wawancara_ortu}`);
        console.log(`  Catatan Santri: ${s.catatan_santri}`);
        console.log(`  Raw Object: ${JSON.stringify(s, null, 2)}`);
      });
    }
  }

  // Also search for "Daffa" more broadly in case of typos
  const broadSearch = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: "Daffa",
      },
    },
    select: {
      id: true,
      nama_lengkap: true,
      nomor_pendaftaran: true,
    }
  });

  console.log(`\nBroad search for 'Daffa' found ${broadSearch.length} records.`);
  broadSearch.forEach(b => {
    console.log(` - ${b.nama_lengkap} (${b.nomor_pendaftaran}) [${b.id}]`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
