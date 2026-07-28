const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam"
        }
    }
});

async function main() {
    try {
        console.log("Starting DB update...");
        
        // 1. Abdil Aziz
        const u1 = await prisma.pegawai.updateMany({
            where: { nama_lengkap: { contains: 'Abdil Aziz' } },
            data: { nama_lengkap: 'Abdil Aziz, S.Pd, B.A' }
        });
        console.log('Abdil Aziz:', u1.count);

        // 2. Muhammad Iqbal
        const u2 = await prisma.pegawai.updateMany({
            where: { nama_lengkap: { contains: 'Muhammad Iqbal' } },
            data: { nama_lengkap: 'Muhammad Iqbal, S.Pd' }
        });
        console.log('Muhammad Iqbal:', u2.count);

        // 3. Muhammad Thoriq Ibn Ziyad
        const u3 = await prisma.pegawai.updateMany({
            where: { nama_lengkap: { contains: 'Muhammad Thoriq Ibn Ziyad' } },
            data: { nama_lengkap: 'Muhammad Thoriq Ibn Ziyad, Lc, M.Ag' }
        });
        console.log('Muhammad Thoriq:', u3.count);

        // 4. Arifin Saefulloh/Saefullah
        const u4 = await prisma.pegawai.updateMany({
            where: { nama_lengkap: { contains: 'Arifin Saefull' } },
            data: { nama_lengkap: 'Arifin Saefullah, A.Ma, Dpl, Lc, M.m, M.Pd' }
        });
        console.log('Arifin:', u4.count);

        console.log("DB update completed successfully!");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
