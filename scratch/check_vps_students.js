const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5436/db_ululalbaab_prod"
    }
  }
});

async function main() {
  console.log("Connecting to Ulul Albaab DB on port 5436...");
  const count = await prisma.pendaftar.count();
  console.log("Connected! Total students in Ulul Albaab DB:", count);
}

main()
  .catch(err => console.error("Error:", err.message))
  .finally(() => prisma.$disconnect());
