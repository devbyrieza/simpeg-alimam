import { prisma } from "../src/lib/prisma";

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
}

checkUser().catch(console.error);
