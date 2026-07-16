const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log("🚀 Starting migration...");

  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { is_active: true },
  });

  if (!tahunAjaran) {
    throw new Error("No active academic year found");
  }

  const [rows] = await conn.execute("SELECT * FROM pendaftars");
  console.log(`Found ${rows.length} records in MySQL.`);

  let successCount = 0;
  for (const row of rows) {
    try {
      const reg = row.nomor_registrasi || `MIGRATE-${row.id}`;
      const nik = row.nomor_identitas || "0000000000000000";
      const gender = row.jenis_kelamin === "Laki-laki" ? "L" : "P";

      await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: reg },
        update: {},
        create: {
          id: crypto.randomUUID(),
          nomor_pendaftaran: reg,
          nik: nik,
          nama_lengkap: row.nama || "Tanpa Nama",
          jenis_kelamin: gender,
          jenjang: row.jenjang || "MTS",
          tahun_ajaran_id: tahunAjaran.id,
          status_pendaftaran: "submitted",
          created_at: row.created_at || new Date(),
          updated_at: row.updated_at || new Date(),
        },
      });
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to migrate ${row.nama}:`, err.message);
    }
  }

  console.log(`✅ Successfully migrated ${successCount} out of ${rows.length} records.`);
  await conn.end();
  await prisma.$disconnect();
}

main().catch(console.error);
