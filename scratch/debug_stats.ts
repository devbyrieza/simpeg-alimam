import { PrismaClient } from '@prisma/client';

async function debugStats() {
    const prisma = new PrismaClient();
    try {
        const activeTA = await prisma.tahunAjaran.findFirst({
            where: { is_active: true }
        });
        
        console.log("Active Academic Year:", activeTA?.nama, "(", activeTA?.id, ")");
        
        const pendaftar = await prisma.pendaftar.findMany({
            where: {
                provinsi: { contains: 'SUMATERA SELATAN', mode: 'insensitive' },
                tahun_ajaran_id: activeTA?.id,
                deleted_at: null
            },
            select: {
                id: true,
                nama_lengkap: true,
                provinsi: true,
                kabupaten: true,
                status_pendaftaran: true,
                created_at: true,
                deleted_at: true
            }
        });
        
        console.log("\nPendaftar found in Sumatera Selatan (Active Year, Not Deleted):", pendaftar.length);
        pendaftar.forEach(p => {
            console.log(`- ${p.nama_lengkap} | ${p.kabupaten} | Status: ${p.status_pendaftaran} | Created: ${p.created_at}`);
        });

    } catch (error) {
        console.error("Error debugging stats:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugStats();
