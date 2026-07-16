const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";
const prisma = new PrismaClient();

async function generateTestLinks() {
    try {
        console.log("Connecting to database...");
        const pendaftars = await prisma.pendaftar.findMany({
            take: 3,
            select: {
                nomor_pendaftaran: true,
                nama_lengkap: true,
                status_pendaftaran: true
            }
        });

        if (pendaftars.length === 0) {
            console.log("❌ Tidak ada pendaftar di database.");
            return;
        }

        console.log("\n=== LINK UJI COBA LOKAL (WELCOME DAY) ===");
        console.log("Gunakan link di bawah ini untuk tes login otomatis di browser lokal (gunakan localhost:3000, jangan 0.0.0.0):");
        
        for (const p of pendaftars) {
            const hash = crypto.createHmac("sha256", MAGIC_LINK_SECRET)
                .update(p.nomor_pendaftaran)
                .digest("hex")
                .slice(0, 8);
            
            const code = `${p.nomor_pendaftaran}-${hash}`;
            console.log(`\n👤 Nama: ${p.nama_lengkap} (${p.nomor_pendaftaran})`);
            console.log(`🔗 Link: http://localhost:3000/s/${code}?t=welcome`);
        }
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

generateTestLinks();
