process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendaftar() {
    try {
        const count = await prisma.pendaftar.count();
        console.log(`ppdb_alimam has ${count} records.`);
        if (count > 0) {
            const all = await prisma.pendaftar.findMany({
                select: { nama_lengkap: true }
            });
            console.log(all.map(a => a.nama_lengkap).join(', '));
        }
    } catch(e) {
        console.log("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
checkPendaftar();
