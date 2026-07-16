import { PrismaClient } from '@prisma/client';

// Force database URL to port 5432
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5432/ppdb_alimam"
    }
  }
});

async function main() {
  const phone = '6285111524441';
  console.log(`Checking database records on port 5432 for phone: ${phone}`);

  // 1. Search for any OTP record
  const otps = await prisma.otpVerification.findMany({
    where: {
      phone: {
        contains: phone.replace(/[^0-9]/g, '')
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  console.log('OTP Records found:', JSON.stringify(otps, null, 2));

  // 2. Search for any pendaftar with this phone number
  const pendaftar = await prisma.pendaftar.findMany({
    where: {
      no_hp: {
        contains: phone.replace(/[^0-9]/g, '')
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  console.log('Pendaftar Records found:', JSON.stringify(pendaftar, null, 2));

  // 3. Search for any profile with this phone number
  const profiles = await prisma.profile.findMany({
    where: {
      phone: {
        contains: phone.replace(/[^0-9]/g, '')
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  console.log('Profile Records found:', JSON.stringify(profiles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
