// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const PARENT_NAME = 'LALU USMAN ALI';
  
  const parents = await prisma.orangTua.findMany({
    where: {
      OR: [
        { nama_ayah: { contains: PARENT_NAME, mode: 'insensitive' } },
        { nama_ibu: { contains: 'RIANAH', mode: 'insensitive' } }
      ]
    },
    include: { pendaftar: true }
  });

  console.log(`Found ${parents.length} parents.`);
  parents.forEach(p => {
    console.log(`Pendaftar: ${p.pendaftar?.nama_lengkap} (${p.pendaftar?.nomor_pendaftaran})`);
    console.log(`  Ayah: ${p.nama_ayah}, Ibu: ${p.nama_ibu}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
