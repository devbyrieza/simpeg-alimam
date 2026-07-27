const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Abdil Aziz
  await prisma.pegawai.updateMany({
    where: { nama_lengkap: { contains: 'Abdil Aziz' } },
    data: { nama_lengkap: 'Abdil Aziz, S.Pd, B.A' }
  });
  console.log('Updated Abdil Aziz');

  // 2. Muhammad Iqbal
  await prisma.pegawai.updateMany({
    where: { nama_lengkap: { contains: 'Muhammad Iqbal' } },
    data: { nama_lengkap: 'Muhammad Iqbal, S.Pd' }
  });
  console.log('Updated Muhammad Iqbal');

  // 3. Muhammad Thoriq Ibn Ziyad
  await prisma.pegawai.updateMany({
    where: { nama_lengkap: { contains: 'Muhammad Thoriq Ibn Ziyad' } },
    data: { nama_lengkap: 'Muhammad Thoriq Ibn Ziyad, Lc, M.Ag' }
  });
  console.log('Updated Muhammad Thoriq');

  // 4. Arifin Saefulloh/Saefullah
  await prisma.pegawai.updateMany({
    where: { nama_lengkap: { contains: 'Arifin Saefull' } },
    data: { nama_lengkap: 'Arifin Saefullah, A.Ma, Dpl, Lc, M.m, M.Pd' }
  });
  console.log('Updated Arifin Saefullah');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
