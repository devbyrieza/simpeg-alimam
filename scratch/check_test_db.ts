import { PrismaClient } from '@prisma/client';

const url = "postgresql://ppdb_user:ppdb_password123@localhost:5432/ppdb_alimam_test";

async function main() {
  console.log('Trying local test DB...');
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    await prisma.$connect();
    console.log('✅ SUCCESS');
    const p19 = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: 'MTA2600019' } });
    console.log('MTA2600019:', p19?.nama_lengkap);
  } catch (e: any) {
    console.log('❌ FAILED:', e.message.split('\n')[0]);
  } finally {
    await prisma.$disconnect();
  }
}

main();
