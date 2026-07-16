process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function printNames() {
    const all = await prisma.pendaftar.findMany({ select: { nama_lengkap: true }, take: 20 });
    console.log(all.map(a => a.nama_lengkap));
}
printNames().finally(() => prisma.$disconnect());
