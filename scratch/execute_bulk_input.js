const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const START_DATE = new Date('2026-04-12');
const END_DATE = new Date('2026-05-30');

const AGUS_SCHEDULE = [
    { day: 1, slots: [{ s: '08:00', e: '09:00' }, { s: '16:00', e: '17:00' }, { s: '20:00', e: '21:00' }] }, 
    { day: 2, slots: [{ s: '08:00', e: '09:20' }, { s: '16:00', e: '17:00' }, { s: '20:00', e: '21:00' }] }, 
    { day: 3, slots: [{ s: '08:00', e: '09:00' }, { s: '16:00', e: '17:00' }, { s: '20:00', e: '21:00' }] }, 
    { day: 4, slots: [{ s: '08:00', e: '10:30' }, { s: '18:20', e: '20:30' }] }, 
    { day: 6, slots: [{ s: '08:00', e: '10:00' }] }, 
    { day: 0, slots: [{ s: '08:00', e: '10:00' }, { s: '16:00', e: '17:30' }, { s: '19:30', e: '20:30' }] }, 
];

const SYAUQI_SCHEDULE = [
    { day: 2, slots: [{ s: '19:30', e: '20:20' }] }, 
    { day: 3, slots: [{ s: '19:30', e: '20:20' }] }, 
    { day: 4, slots: [{ s: '19:30', e: '20:20' }] }, 
    { day: 5, slots: [{ s: '19:30', e: '20:20' }] }, 
    { day: 6, slots: [{ s: '13:00', e: '14:30' }, { s: '18:20', e: '19:10' }, { s: '19:30', e: '20:30' }] }, 
    { day: 0, slots: [{ s: '10:30', e: '11:30' }, { s: '13:00', e: '14:00' }] }, 
];

async function runForExaminer(prisma, examinerName, schedule, titlePrefix) {
    console.log(`\n🔎 Mencari profile: ${examinerName}...`);
    const profile = await prisma.profile.findFirst({
        where: { full_name: { contains: examinerName, mode: 'insensitive' } }
    });

    if (!profile) {
        console.error(`❌ Profile ${examinerName} tidak ditemukan!`);
        return;
    }

    console.log(`✅ Ditemukan: ${profile.full_name} (${profile.id})`);

    const sessions = [];
    let current = new Date(START_DATE);

    while (current <= END_DATE) {
        const dayOfWeek = current.getDay();
        const config = schedule.find(s => s.day === dayOfWeek);

        if (config) {
            const dateStr = current.toISOString().split('T')[0];
            for (const slot of config.slots) {
                const start = new Date(`${dateStr}T${slot.s}:00`);
                const end = new Date(`${dateStr}T${slot.e}:00`);

                sessions.push({
                    title: `${titlePrefix}`,
                    start_time: start,
                    end_time: end,
                    quota: 1,
                    location: 'Pesantren/Online',
                    notes: `Jadwal massal oleh Admin`,
                    created_by: profile.id,
                    is_active: true
                });
            }
        }
        current.setDate(current.getDate() + 1);
    }

    console.log(`🚀 Menyiapkan ${sessions.length} sesi untuk ${examinerName}...`);
    
    // Batch create sessions
    for (const sessionData of sessions) {
        await prisma.examSession.create({ data: sessionData });
    }

    console.log(`🎉 Berhasil membuat ${sessions.length} sesi untuk ${examinerName}.`);
}

async function tryConnection(url) {
    console.log(`🔌 Mencoba koneksi ke: ${url.split('@')[1] || url}...`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.profile.findFirst({ take: 1 });
        console.log('✅ KONEKSI BERHASIL!');
        return prisma;
    } catch (e) {
        console.log(`❌ Gagal: ${e.message.split('\n')[0]}`);
        await prisma.$disconnect();
        return null;
    }
}

async function main() {
    const urls = [
        process.env.DATABASE_URL,
        'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam',
        'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/ppdb_alimam',
        'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@coolify-db:5432/ppdb_alimam',
        'postgresql://admin_ulul:password123@localhost:5436/db_ululalbaab_prod'
    ].filter(Boolean);

    let prisma = null;
    for (const url of urls) {
        prisma = await tryConnection(url);
        if (prisma) break;
    }

    if (!prisma) {
        console.error('\n❌ SEMUA KONEKSI GAGAL. Silakan cek apakah database server aktif.');
        process.exit(1);
    }

    try {
        await runForExaminer(prisma, 'Agus Cahyono', AGUS_SCHEDULE, "Tes Al-Qur'an");
        await runForExaminer(prisma, 'Syauqi', SYAUQI_SCHEDULE, "Wawancara Santri");
    } catch (e) {
        console.error('❌ FATAL ERROR SALAMA PROSES:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
