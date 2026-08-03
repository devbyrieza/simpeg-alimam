import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai update database...');

  // 1. Muhammad Iqbal
  await prisma.profile.updateMany({
    where: { nama_lengkap: { contains: 'Muhammad Iqbal' } },
    data: {
      nama_lengkap: 'Muhammad Iqbal, S.Pd.',
      jabatan: ''
    }
  });
  console.log('Updated Muhammad Iqbal');

  // 2. Maulidin Bachtiar
  await prisma.profile.updateMany({
    where: { nama_lengkap: { contains: 'Maulidin Bachtiar' } },
    data: {
      jabatan: 'Bendahara dan Kabid Keuangan'
    }
  });
  console.log('Updated Maulidin Bachtiar');

  // 3. Abdil Aziz
  await prisma.profile.updateMany({
    where: { nama_lengkap: { contains: 'Abdil Aziz' } },
    data: {
      nama_lengkap: 'Abdil Aziz, S.Pd., B.A.',
      jabatan: 'Kabid Kurikulum'
    }
  });
  console.log('Updated Abdil Aziz');

  // 4. Wahyudi Pranata
  await prisma.profile.updateMany({
    where: { nama_lengkap: { contains: 'Wahyudi Pranata' } },
    data: {
      nama_lengkap: 'Wahyudi Pranata, Lc'
    }
  });
  console.log('Updated Wahyudi Pranata');

  console.log('Selesai!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
