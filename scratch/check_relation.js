// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ids = ['ILA2600006', 'MTA2600016'];
  
  const pendaftars = await prisma.pendaftar.findMany({
    where: { nomor_pendaftaran: { in: ids } },
    include: { orang_tua: true }
  });

  pendaftars.forEach(p => {
    console.log(`Pendaftar: ${p.nama_lengkap} (${p.nomor_pendaftaran})`);
    console.log(`  Ayah: ${p.orang_tua?.nama_ayah}, Ibu: ${p.orang_tua?.nama_ibu}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
