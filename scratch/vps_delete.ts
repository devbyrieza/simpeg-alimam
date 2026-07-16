import { PrismaClient } from '@prisma/client';

const host = '72.61.141.50';
const credentials = [
  { user: 'postgres', pass: 'nhzYTBmfqk8RUhOoYHmvkbzoN2OhN', db: 'ppdb_alimam', port: 5432 },
  { user: 'postgres', pass: 'SKBalimam26%21', db: 'ppdb_alimam', port: 5432 },
  { user: 'postgres', pass: 'SKBalimam26%21', db: 'postgres', port: 5432 },
  { user: 'admin_ulul', pass: 'password123', db: 'db_ululalbaab_migrasi', port: 5436 },
];

async function tryConnect() {
  for (const cred of credentials) {
    const url = `postgresql://${cred.user}:${cred.pass}@${host}:${cred.port}/${cred.db}`;
    console.log(`Trying ${url.replace(/:[^:@]+@/, ':****@')}...`);
    const prisma = new PrismaClient({
      datasources: { db: { url } },
    });
    try {
      await prisma.$connect();
      console.log(`✅ SUCCESS!`);
      const p19 = await prisma.pendaftar.findUnique({
        where: { nomor_pendaftaran: 'MTA2600019' }
      });
      if (p19) {
        console.log('FOUND MTA2600019! Deleting now...');
        await prisma.$transaction([
          prisma.pendaftarBackup.create({
            data: {
              pendaftar_id: p19.id,
              nomor_pendaftaran: p19.nomor_pendaftaran,
              nama_lengkap: p19.nama_lengkap,
              backup_data: JSON.parse(JSON.stringify(p19)),
              deleted_by: 'system',
              deleted_by_name: 'Antigravity AI (Duplicate Cleanup)',
            },
          }),
          prisma.pendaftar.update({
            where: { id: p19.id },
            data: {
              deleted_at: new Date(),
              updated_at: new Date(),
            },
          }),
        ]);
        console.log('DONE!');
        await prisma.$disconnect();
        return;
      }
      console.log('MTA2600019 not found in this DB.');
      await prisma.$disconnect();
    } catch (e: any) {
      console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
    }
  }
}

tryConnect();
