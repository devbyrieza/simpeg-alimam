const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const agus = await prisma.profile.findMany({
            where: { full_name: { contains: 'Agus', mode: 'insensitive' } }
        });
        console.log('--- AGUS ---');
        console.log(JSON.stringify(agus, null, 2));

        const syauqi = await prisma.profile.findMany({
            where: { full_name: { contains: 'Syauqi', mode: 'insensitive' } }
        });
        console.log('--- SYAUQI ---');
        console.log(JSON.stringify(syauqi, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
