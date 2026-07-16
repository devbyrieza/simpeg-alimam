const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        in: ['Rumaisha Hanin Hanifa', 'Farida Kamila Zuhdi']
      }
    },
    include: {
      pembayaran: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
