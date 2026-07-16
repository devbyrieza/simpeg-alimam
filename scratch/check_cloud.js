process.env.DATABASE_URL = "postgresql://postgres:SKBalimam26%21@db.hcknodoayqarjbrzcgrp.supabase.co:5432/postgres";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCloud() {
    try {
        const count = await prisma.pendaftar.count();
        console.log(`Cloud DB has ${count} records.`);
        const first = await prisma.pendaftar.findFirst();
        console.log("First:", first?.nama_lengkap);
    } catch(e) {
        console.log("Error connecting to cloud DB:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
checkCloud();
