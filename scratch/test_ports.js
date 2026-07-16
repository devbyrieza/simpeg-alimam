const { PrismaClient } = require('@prisma/client');

async function testPort(port) {
    const url = `postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:${port}/ppdb_alimam`;
    process.env.DATABASE_URL = url;
    const prisma = new PrismaClient();
    try {
        const count = await prisma.pendaftar.count();
        console.log(`Port ${port} has ${count} records in ppdb_alimam.`);
    } catch(e) {
        console.log(`Port ${port} failed:`, e.message.split('\n')[0]);
    } finally {
        await prisma.$disconnect();
    }
}

async function testAll() {
    await testPort(5432);
    await testPort(5433);
    await testPort(5435);
}

testAll().catch(console.error);
