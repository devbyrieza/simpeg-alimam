import { prisma } from "../src/lib/prisma";

async function checkQueue() {
    try {
        const stats = await prisma.whatsappLog.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        console.log("=== WhatsApp Queue Stats ===");
        stats.forEach(s => {
            console.log(`${s.status}: ${s._count.id}`);
        });

        const pending = await prisma.whatsappLog.findMany({
            where: { status: 'pending' },
            take: 5,
            orderBy: { created_at: 'desc' }
        });

        if (pending.length > 0) {
            console.log("\n=== Latest Pending Messages ===");
            pending.forEach(p => {
                console.log(`- To: ${p.phone}, Type: ${p.jenis_notif}, Created: ${p.created_at}`);
            });
        }

        const failed = await prisma.whatsappLog.findMany({
            where: { status: 'failed' },
            take: 5,
            orderBy: { updated_at: 'desc' }
        });

        if (failed.length > 0) {
            console.log("\n=== Latest Failed Messages ===");
            failed.forEach(f => {
                console.log(`- To: ${f.phone}, Error: ${f.error_message}, Updated: ${f.updated_at}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkQueue();
