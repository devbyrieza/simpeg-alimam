import { PrismaClient } from '@prisma/client';

const credentials = [
  { user: 'postgres', pass: 'nhzYTBmfqk8RUhOoYHmvkbzoN2OhN', db: 'ppdb_alimam' },
  { user: 'postgres', pass: 'password123', db: 'ppdb_alimam' },
  { user: 'admin_ulul', pass: 'password123', db: 'db_ululalbaab_migrasi' },
  { user: 'postgres', pass: 'password123', db: 'postgres' },
];

async function tryConnect() {
  for (const cred of credentials) {
    const url = `postgresql://${cred.user}:${cred.pass}@127.0.0.1:5432/${cred.db}`;
    console.log(`Trying ${url}...`);
    const prisma = new PrismaClient({
      datasources: { db: { url } },
    });
    try {
      await prisma.$connect();
      console.log(`✅ SUCCESS with ${url}`);
      const p16 = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: 'MTA2600016' } });
      const p19 = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: 'MTA2600019' } });
      if (p16 || p19) {
        console.log('FOUND RECORDS!');
        console.log('MTA2600016:', p16?.nama_lengkap);
        console.log('MTA2600019:', p19?.nama_lengkap);
        await prisma.$disconnect();
        return;
      }
      console.log('No records found in this DB.');
      await prisma.$disconnect();
    } catch (e: any) {
      console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
    }
  }
}

tryConnect();
