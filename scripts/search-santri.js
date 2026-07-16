const { PrismaClient } = require('@prisma/client');

const url = "postgresql://postgres.hcknodoayqarjbrzcgrp:SKBalimam26%21@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
const prisma = new PrismaClient({ datasources: { db: { url } } });

const names = [
  "Labibullah",
  "Fariq",
  "Rizky",
  "Asrorin",
  "Azka",
  "Fazril",
  "Haidar",
  "Atqanul",
  "Hafidz",
  "Rasyid Ridho"
];

async function main() {
  console.log("Checking Supabase Production Al-Imam...");
  try {
    const results = [];
    for (const search of names) {
      const pendaftars = await prisma.pendaftar.findMany({
        where: {
          nama_lengkap: { contains: search, mode: 'insensitive' }
        },
        select: {
          id: true,
          nomor_pendaftaran: true,
          nama_lengkap: true,
          jenjang: true,
          status_pendaftaran: true,
          no_hp: true
        }
      });
      if (pendaftars.length > 0) {
        results.push(...pendaftars);
      }
    }
    console.log(`Found ${results.length} records:`);
    results.forEach(p => console.log(` - ${p.nama_lengkap} (${p.nomor_pendaftaran}) - ${p.jenjang} - ${p.status_pendaftaran}`));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
