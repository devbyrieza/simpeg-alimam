import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const recap = await prisma.profile.findMany({
    where: {
      OR: [
        {
          role: {
            in: [
              "penguji_calsan",
              "pewawancara_calsan",
              "pewawancara_cawalsan",
            ],
          },
        },
        {
          secondary_roles: {
            hasSome: [
              "penguji_calsan",
              "pewawancara_calsan",
              "pewawancara_cawalsan",
            ],
          },
        },
      ],
    },
    select: {
      id: true,
      full_name: true,
      role: true,
      _count: {
        select: {
          jadwal_penguji_quran: true,
          jadwal_penguji_santri: true,
          jadwal_penguji_ortu: true,
        },
      },
    },
  });

  console.log(JSON.stringify(recap, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
