process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');

async function checkTables() {
    const prisma = new PrismaClient();
    try {
        const res = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;
        for (let row of res) {
            const countRes = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM "${row.tablename}";`);
            console.log(`Table ${row.tablename}: ${Number(countRes[0].count)} records`);
        }
    } catch (e) {
        console.log("Failed to connect:", e.message.split('\n')[0]);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
