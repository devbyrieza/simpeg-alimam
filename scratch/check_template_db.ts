import { PrismaClient } from '@prisma/client';

const url = "postgresql://postgres.dxaywhgdczmdynziqkmc:BCQiZ0YNkHLgu5YM@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  console.log('Searching in Template Demo Supabase...');
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    const pendaftars = await prisma.pendaftar.findMany({
      where: {
        nama_lengkap: { contains: 'Yahya Ayyash', mode: 'insensitive' }
      }
    });

    console.log('Found:', pendaftars.length);
    pendaftars.forEach(p => {
      console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id}) Status: ${p.status_pendaftaran}`);
    });
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
