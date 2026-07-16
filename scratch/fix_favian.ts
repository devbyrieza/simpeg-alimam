import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  const nomor = 'ILI2600010';
  const pendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: nomor },
    include: { pembayaran: true }
  });

  if (!pendaftar) {
    console.log('Pendaftar not found');
    return;
  }

  console.log(`Current Status for ${pendaftar.nama_lengkap}: ${pendaftar.status_pendaftaran}`);
  
  const verifiedPayment = pendaftar.pembayaran.find(p => p.status_pembayaran === 'verified' && p.jenis_pembayaran === 'PENDAFTARAN');
  
  if (verifiedPayment && pendaftar.status_pendaftaran === 'payment_verification') {
    console.log('Detected STUCK status. Fixing...');
    await prisma.pendaftar.update({
      where: { id: pendaftar.id },
      data: { status_pendaftaran: 'verified' }
    });
    console.log('Status updated to "verified"');
  } else {
    console.log('No stuck status detected or payment not verified.');
    console.log('Payment Statuses:', pendaftar.pembayaran.map(p => p.status_pembayaran));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
