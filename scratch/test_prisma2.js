process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/ppdb_alimam";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function testQuery() {
    console.log("Testing with localhost:5433...");
    try {
        const pendaftar = await prisma.pendaftar.findFirst();
        console.log("Connection successful! First pendaftar name:", pendaftar?.nama_lengkap);
    } catch(e) {
        console.error("Failed with localhost:", e.message);
        
        process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@[::1]:5433/ppdb_alimam";
        const prisma2 = new PrismaClient();
        console.log("\nTesting with [::1]:5433...");
        try {
            const p = await prisma2.pendaftar.findFirst();
            console.log("Connection successful! First pendaftar name:", p?.nama_lengkap);
        } catch(e2) {
            console.error("Failed with [::1]:", e2.message);
        }
    }
}

testQuery().catch(e => {
    console.error(e);
    process.exit(1);
});
