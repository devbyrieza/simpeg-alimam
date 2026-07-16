const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function main() {
  const prisma = new PrismaClient();
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await conn.execute("SELECT * FROM akun_admins");
  console.log("Found " + rows.length + " admins in MySQL.");

  for (const row of rows) {
    try {
      const email = row.email || row.username + "@ululalbaab.com";
      let role = "admin_berkas";
      if (row.role === "super") role = "admin_super";
      if (row.role === "pewawancara") role = "pewawancara_calsan";

      await prisma.profile.upsert({
        where: { id: crypto.randomUUID() },
        update: {},
        create: {
          id: crypto.randomUUID(),
          full_name: row.username,
          email: email,
          role: role,
          phone: "0",
          password_hash: row.password,
          created_at: row.created_at || new Date(),
          updated_at: row.updated_at || new Date(),
        },
      });
    } catch (err) {
      console.error("Failed to migrate admin " + row.username + ":", err.message);
    }
  }
  console.log("Admin migration complete.");
  await conn.end();
  await prisma.$disconnect();
}
main().catch(console.error);
