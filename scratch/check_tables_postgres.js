process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/postgres";
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
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
