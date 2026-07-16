
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@127.0.0.1:5436/db_ululalbaab_migrasi"
    }
  }
});

async function main() {
  const pembayaran = await prisma.pembayaran.findMany({
    where: {
      status_pembayaran: 'pending'
    },
    select: {
      id: true,
      bukti_transfer_path: true,
      bukti_transfer_filename: true,
      pendaftar: {
        select: {
          nama_lengkap: true
        }
      }
    },
    take: 10
  });

  console.log(JSON.stringify(pembayaran, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
