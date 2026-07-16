// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const NAME_PART = 'Rizky';
  
  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: { contains: NAME_PART, mode: 'insensitive' }
    }
  });

  console.log(`Found ${pendaftars.length} pendaftars matching "${NAME_PART}".`);
  pendaftars.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.nama_lengkap}, No: ${p.nomor_pendaftaran}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
