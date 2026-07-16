import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  try {
    const p16 = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: 'MTA2600016' }
    });
    const p19 = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: 'MTA2600019' }
    });
    console.log('MTA2600016:', p16?.nama_lengkap);
    console.log('MTA2600019:', p19?.nama_lengkap);
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
