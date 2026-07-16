const { PrismaClient } = require("@prisma/client");

// Explicitly set DATABASE_URL for standalone execution
process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@coolify-db:5432/ppdb_alimam";

const prisma = new PrismaClient();

async function runFix() {
    try {
        console.log("Starting timezone fix (-7 hours shift)...");

        // 1. Shift ExamSession records
        const sessions = await prisma.$executeRaw`
            UPDATE exam_sessions 
            SET 
                start_time = start_time - INTERVAL '7 hours',
                end_time = end_time - INTERVAL '7 hours'
        `;
        console.log(`Updated ExamSessions.`);

        // 2. Shift JadwalUjian records
        await prisma.$executeRaw`
            UPDATE jadwal_ujian 
            SET 
                waktu_mulai_santri = waktu_mulai_santri - INTERVAL '7 hours',
                waktu_selesai_santri = waktu_selesai_santri - INTERVAL '7 hours',
                waktu_mulai_ortu = waktu_mulai_ortu - INTERVAL '7 hours',
                waktu_selesai_ortu = waktu_selesai_ortu - INTERVAL '7 hours'
        `;
        console.log(`Updated JadwalUjian.`);

        console.log("Timezone fix completed successfully.");
    } catch (error) {
        console.error("Error during fix:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runFix();
