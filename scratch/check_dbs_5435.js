process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/postgres";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDBs() {
    try {
        const res = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false;`;
        console.log("Databases on 5435:", res.map(r => r.datname));
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkDBs();
