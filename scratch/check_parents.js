// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const REG_NUMBER = 'ILA2600006';
  
  const p = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: REG_NUMBER },
    include: { orang_tua: true }
  });

  if (p) {
    console.log(`Pendaftar: ${p.nama_lengkap}`);
    console.log(`Ibu: ${p.orang_tua?.nama_ibu}`);
    console.log(`Ayah: ${p.orang_tua?.nama_ayah}`);
  } else {
    console.log('Pendaftar not found.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
