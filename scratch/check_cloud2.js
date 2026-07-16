process.env.DATABASE_URL = "postgresql://postgres.hcknodoayqarjbrzcgrp:SKBalimam26%21@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
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
