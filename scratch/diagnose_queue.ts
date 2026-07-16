import { prisma } from "../src/lib/prisma";

async function diagnose() {
    try {
        const eligible = await prisma.pendaftar.count({
            where: {
                status_pendaftaran: { in: ['paid', 'docs_verified'] },
                notif_jadwal_tersedia_terkirim: false,
                no_hp: { not: null, notIn: [""] },
                jadwal_ujian: { none: {} }
            }
        });

        console.log(`Eligible for notification: ${eligible}`);

        const logStats = await prisma.whatsappLog.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        console.log("Queue Status:", JSON.stringify(logStats, null, 2));

        const pending = await prisma.whatsappLog.findMany({
            where: { status: 'pending' },
            select: { id: true, phone: true, created_at: true },
            take: 10
        });
        console.log("Pending messages:", JSON.stringify(pending, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
