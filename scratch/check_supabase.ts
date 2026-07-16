import { PrismaClient } from '@prisma/client';

const url = "postgresql://postgres:SKBalimam26%21@db.hcknodoayqarjbrzcgrp.supabase.co:5432/postgres";

async function main() {
  console.log('Searching for duplicate records in Supabase...');
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  const p16 = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2600016' },
    include: {
      user: true,
    },
  });

  const p19 = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2600019' },
    include: {
      user: true,
    },
  });

  console.log('MTA2600016:', p16 ? `${p16.nama_lengkap} (ID: ${p16.id})` : 'NOT FOUND');
  console.log('MTA2600019:', p19 ? `${p19.nama_lengkap} (ID: ${p19.id})` : 'NOT FOUND');
  
  if (p16 && p19) {
    console.log('Both found! Ready to delete MTA2600019.');
    console.log('P16 User ID:', p16.user_id);
    console.log('P19 User ID:', p19.user_id);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
