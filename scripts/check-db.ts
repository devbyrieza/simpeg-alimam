import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: 'ILA2600001' }
  });
  if (p) {
    console.log("OK - Found NIK:", p.nik);
  } else {
    console.log("FAIL - Not found");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
