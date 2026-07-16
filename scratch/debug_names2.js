process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNames() {
    const all = await prisma.pendaftar.findMany({ select: { nama_lengkap: true }});
    const dbNames = all.map(a => a.nama_lengkap.toLowerCase());
    console.log(`DB has ${dbNames.length} records.`);
    
    const targetNames = [
        "Abdul Hakim", "Ahmad Farros Al Barqy", "Atqanul Ummah Ahmad", 
        "Azka Panji Kusuma", "Fariq Malaibui"
    ];

    for(const t of targetNames) {
        const lower = t.toLowerCase();
        const matches = dbNames.filter(n => n.includes(lower));
        if(matches.length > 0) {
            console.log(`Found exact match for ${t}:`, matches);
        } else {
            // try partial
            const parts = lower.split(' ');
            const pMatch = dbNames.filter(n => n.includes(parts[0]) && n.includes(parts[1]));
            console.log(`Found partial match for ${t}:`, pMatch);
        }
    }
}
checkNames().finally(() => prisma.$disconnect());
