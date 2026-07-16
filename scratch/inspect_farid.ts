
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: 'ILI2600003' },
    include: {
      jadwal_ujian: {
        include: {
           exam_session: true
        }
      },
      nilai_ujian: true
    }
  });

  if (!pendaftar) {
    console.log('Pendaftar not found');
    return;
  }

  console.log('=== PENDAFTAR ===');
  console.log('ID:', pendaftar.id);
  console.log('Nama:', pendaftar.nama_lengkap);
  console.log('Nomor Pendaftaran:', pendaftar.nomor_pendaftaran);

  console.log('\n=== JADWAL UJIAN ===');
  pendaftar.jadwal_ujian.forEach(j => {
    console.log(`- ID: ${j.id}, Session: ${j.exam_session?.title}, Tanggal: ${j.tanggal_ujian}, SessionID: ${j.exam_session_id}`);
    console.log(`  Penguji Santri: ${j.penguji_santri_id}`);
    console.log(`  Penguji Quran: ${j.penguji_quran_id}`);
    console.log(`  Penguji Ortu: ${j.penguji_ortu_id}`);
  });

  console.log('\n=== NILAI UJIAN ===');
  pendaftar.nilai_ujian.forEach(n => {
    console.log(`- ID: ${n.id}`);
    console.log(`  Jadwal ID: ${n.jadwal_ujian_id}`);
    console.log(`  Wawancara Santri (nilai): ${n.nilai_wawancara_santri}`);
    console.log(`  Quran (nilai): ${n.nilai_tes_quran}`);
    console.log(`  Wawancara Ortu (nilai): ${n.nilai_wawancara_ortu}`);
    console.log(`  Detail Orang Tua (exists): ${!!n.detail_cawalsan}`);
    if (n.detail_cawalsan) {
        console.log(`  Detail Orang Tua (rekomendasi): ${(n.detail_cawalsan as any).rekomendasi}`);
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
