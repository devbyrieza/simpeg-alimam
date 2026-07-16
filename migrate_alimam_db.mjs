import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndMigrate() {
  console.log("Checking alimam database...");
  try {
    const test = await prisma.pendaftar.findFirst();
    // Try to access the column
    await prisma.$queryRaw`SELECT ukuran_seragam_baju FROM pendaftar LIMIT 1`;
    console.log("✅ Column ukuran_seragam_baju exists in alimam DB!");
  } catch (error) {
    if (error.message.includes('column "ukuran_seragam_baju" does not exist') || error.message.includes('column pendaftar.ukuran_seragam_baju does not exist')) {
      console.log("⚠️ Column missing in alimam DB, applying migration...");
      await prisma.$executeRawUnsafe(`ALTER TABLE pendaftar ADD COLUMN ukuran_seragam_baju text;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pendaftar ADD COLUMN ukuran_seragam_celana text;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE pendaftar ADD COLUMN ukuran_seragam_almamater text;`);
      console.log("✅ Columns added successfully to alimam DB!");
    } else {
      console.error("❌ Unexpected error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndMigrate();
