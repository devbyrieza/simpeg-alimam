const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.profile.findMany({
    where: {
      OR: [
        { full_name: { contains: "Ustadz Penguji", mode: "insensitive" } },
        { role: "penguji" }
      ]
    },
    select: { id: true, email: true, role: true, secondary_roles: true, full_name: true }
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

checkUser().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
