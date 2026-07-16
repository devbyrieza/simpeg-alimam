import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Try to load .env.production first, then .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  const targetNomor = 'MTA2600019';
  const keepNomor = 'MTA2600016';

  console.log(`🚀 Starting deletion process for duplicate record: ${targetNomor}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL?.split('@')[1] || 'Unknown'}`);

  try {
    // 1. Find the target record
    const target = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: targetNomor },
      include: {
        user: true,
      }
    });

    if (!target) {
      console.log(`❌ Record ${targetNomor} not found in database.`);
      return;
    }

    if (target.deleted_at) {
      console.log(`⚠️ Record ${targetNomor} is already soft-deleted.`);
      return;
    }

    console.log(`✅ Found record: ${target.nama_lengkap} (ID: ${target.id})`);
    console.log(`📝 Status: ${target.status_pendaftaran}`);

    // 2. Perform Soft Delete (Same logic as API)
    console.log(`🗑️ Performing soft-delete...`);
    
    await prisma.$transaction([
      // Save backup snapshot
      prisma.pendaftarBackup.create({
        data: {
          pendaftar_id: target.id,
          nomor_pendaftaran: target.nomor_pendaftaran,
          nama_lengkap: target.nama_lengkap,
          backup_data: JSON.parse(JSON.stringify(target)),
          deleted_by: 'system',
          deleted_by_name: 'Antigravity AI (Duplicate Cleanup)',
        },
      }),
      // Mark as deleted
      prisma.pendaftar.update({
        where: { id: target.id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
          // We don't have a session ID here, so we'll leave it or set a dummy
        },
      }),
    ]);

    console.log(`✨ Successfully soft-deleted ${targetNomor}.`);
    console.log(`ℹ️ Data backup has been saved to 'pendaftar_backup' table.`);
    
  } catch (error: any) {
    console.error(`❌ Error during deletion:`, error.message);
    if (error.message.includes('Environment variable not found')) {
      console.log('💡 Tip: Make sure to set DATABASE_URL environment variable.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
