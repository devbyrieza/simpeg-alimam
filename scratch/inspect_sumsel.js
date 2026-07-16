const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function inspectData() {
    const prisma = new PrismaClient();
    try {
        const activeTA = await prisma.tahunAjaran.findFirst({
            where: { is_active: true }
        });
        
        console.log("=== DIAGNOSTIC REPORT ===");
        console.log("Active Academic Year:", activeTA?.nama);
        
        // Find ALL pendaftar in Sumatera Selatan, including deleted ones for comparison
        const pendaftar = await prisma.pendaftar.findMany({
            where: {
                provinsi: { contains: 'SUMATERA SELATAN', mode: 'insensitive' }
            },
            select: {
                id: true,
                nama_lengkap: true,
                provinsi: true,
                kabupaten: true,
                status_pendaftaran: true,
                created_at: true,
                deleted_at: true,
                tahun_ajaran_id: true
            }
        });
        
        console.log("\nAll Pendaftar in Sumatera Selatan:");
        pendaftar.forEach(p => {
            const isMatchTA = p.tahun_ajaran_id === activeTA?.id;
            const isDeleted = p.deleted_at !== null;
            console.log(`[${isDeleted ? 'DELETED' : 'ACTIVE'}] [${isMatchTA ? 'CURRENT_YEAR' : 'OTHER_YEAR'}] Name: ${p.nama_lengkap} | Kab: ${p.kabupaten} | Status: ${p.status_pendaftaran}`);
        });

    } catch (error) {
        console.error("Diagnostic error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectData();
