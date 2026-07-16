const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam"
    }
  }
});

async function main() {
  const count = await prisma.pendaftar.count();
  console.log("Total students in DB:", count);
  const students = await prisma.pendaftar.findMany({
    take: 10,
    select: {
      id: true,
      nama_lengkap: true,
      status_pendaftaran: true,
      tipe_pendaftaran: true,
      nomor_pendaftaran: true
    }
  });
  console.log("First 10 students:", students);
}

main().catch(console.error).finally(() => prisma.$disconnect());
