import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'ILI2600010' },
    select: { id: true, status_pendaftaran: true, nama_lengkap: true }
  });
  console.log('Favian Status:', JSON.stringify(pendaftar, null, 2));

  // Check payment status too
  if (pendaftar) {
      const pembayaran = await prisma.pembayaran.findMany({
          where: { pendaftar_id: pendaftar.id }
      });
      console.log('Payments:', JSON.stringify(pembayaran, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
