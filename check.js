const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ 
  datasources: { 
    db: { url: 'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam' } 
  } 
});

async function main() {
  const p = await prisma.$queryRawUnsafe(`SELECT id, email, password_hash FROM profiles WHERE email LIKE '%@pesantren-alimam.com'`);
  console.log('Found profiles:', p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
