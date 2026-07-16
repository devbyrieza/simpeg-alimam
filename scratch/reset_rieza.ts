import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Resetting Rieza Tes data...");
    
    // Find Rieza Tes
    const pendaftar = await prisma.pendaftar.findFirst({
        where: { nama_lengkap: { contains: "Rieza Tes" } },
        orderBy: { created_at: "desc" }
    });

    if (!pendaftar) {
        console.error("Rieza Tes tidak ditemukan");
        return;
    }

    // 1. Update status to 'tested'
    await prisma.pendaftar.update({
        where: { id: pendaftar.id },
        data: { status_pendaftaran: "tested" }
    });

    // 2. Refresh scores
    // Upsert NilaiUjian
    const existingNilai = await prisma.nilaiUjian.findFirst({
        where: { pendaftar_id: pendaftar.id }
    });

    const nilaiData = {
        pendaftar_id: pendaftar.id,
        score_akademik: 95,
        score_quran: 90,
        score_kepribadian: 90,
        score_kesiapan: 90,
        score_wawancara: 90,
        nilai_wawancara_ortu: 90,
        nilai_wawancara_santri: 90,
        nilai_tes_quran: 90,
        total_score: 95,
        nilai_total: 95,
        status_kelulusan: "LULUS",
        detail_akademik: { skor: 95 } as any,
        detail_quran: { skor: 90 } as any,
        updated_at: new Date()
    };

    if (existingNilai) {
        await prisma.nilaiUjian.update({
            where: { id: existingNilai.id },
            data: nilaiData
        });
    } else {
        await prisma.nilaiUjian.create({ data: nilaiData });
    }

    // 3. Create HasilSeleksi
    await prisma.hasilSeleksi.upsert({
        where: { pendaftar_id: pendaftar.id },
        update: {
            status_seleksi: "DITERIMA",
            nilai_akhir: 95,
            catatan_admin: "Lulus by RESET script",
            ditentukan_pada: new Date()
        },
        create: {
            pendaftar_id: pendaftar.id,
            tahun_ajaran_id: pendaftar.tahun_ajaran_id,
            status_seleksi: "DITERIMA",
            nilai_akhir: 95,
            catatan_admin: "Lulus by RESET script",
            ditentukan_pada: new Date()
        }
    });

    // 4. Reset Pengumuman (Unpublished)
    await prisma.pengumuman.upsert({
        where: { pendaftar_id: pendaftar.id },
        update: {
            status_kelulusan: "DITERIMA",
            is_published: false,
            published_at: null
        },
        create: {
            pendaftar_id: pendaftar.id,
            tahun_ajaran_id: pendaftar.tahun_ajaran_id,
            status_kelulusan: "DITERIMA",
            is_published: false,
            published_at: null
        }
    });

    console.log("Rieza Tes has been reset to 'tested' status and unpublished. Ready for announcement testing!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
