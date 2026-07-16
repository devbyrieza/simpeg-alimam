const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.profile.findMany({
    where: {
      OR: [
        { role: { contains: 'penguji', mode: 'insensitive' } },
        { role: { contains: 'pewawancara', mode: 'insensitive' } },
        {
          secondary_roles: {
            hasSome: [
              'penguji_calsan',
              'pewawancara_calsan',
              'pewawancara_cawalsan',
              'penguji_umum',
            ],
          },
        },
      ],
    },
    select: {
      id: true,
      full_name: true,
      role: true,
      secondary_roles: true,
      phone: true,
    },
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
