process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRow() {
    const row = await prisma.pendaftar.findFirst();
    console.log(row);
}
checkRow().finally(() => prisma.$disconnect());
