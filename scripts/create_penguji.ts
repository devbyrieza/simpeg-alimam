import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const usersToCreate = [
    { full_name: 'Agus Cahyono', email: 'agus@alimam.com', role: 'penguji' },
    { full_name: 'Jusman', email: 'jusman@alimam.com', role: 'penguji' },
    { full_name: 'Fuad Khomsatun', email: 'fuad@alimam.com', role: 'penguji' }
  ];

  const defaultPassword = 'alimam2025!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  console.log('Creating Penguji accounts...');

  for (const user of usersToCreate) {
    const existingUser = await prisma.profile.findFirst({
      where: { email: user.email }
    });

    if (existingUser) {
      console.log(`User ${user.email} already exists. Skipping.`);
      continue;
    }

    const newUser = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        password_hash: passwordHash,
        phone: '-',
        secondary_roles: []
      }
    });

    console.log(`Created user: ${newUser.full_name} (${newUser.email})`);
  }

  console.log('Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
