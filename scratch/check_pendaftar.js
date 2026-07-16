process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendaftar() {
    const p = await prisma.pendaftar.findFirst({
        where: { nomor_pendaftaran: 'MTA2600001' }
    });
    console.log(p);
}
checkPendaftar().finally(() => prisma.$disconnect());
