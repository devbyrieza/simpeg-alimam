require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manually imported builder functions for the scratch script
function buildMessageReminderH1Santri(nama, hari, tanggal, jam, lokasi, jenisUjian) {
    return `*PENGINGAT UJIAN SELEKSI (H-1)*

Assalamu'alaikum Wr. Wb.
Halo Ananda *${nama}*,

Ini adalah pengingat bahwa Anda dijadwalkan mengikuti *${jenisUjian}* pada:

📅 *Hari/Tanggal:* ${hari}, ${tanggal}
⏰ *Waktu:* ${jam} WIB
📍 *Lokasi/Link:* ${lokasi}

Mohon persiapkan diri dengan baik dan pastikan koneksi internet stabil jika ujian online. Sampai jumpa besok!

---
*Panitia PPDB Al-Andalus Al-Imam*`;
}

function buildMessageReminderH1Penguji(namaPenguji, namaSantri, hari, tanggal, jam, lokasi, jenisUjian) {
    return `*REMINDER JADWAL MENGUJI (H-1)*

Assalamu'alaikum Ust/Ustadzah *${namaPenguji}*,

Mengingatkan kembali jadwal menguji Anda untuk besok:

📝 *Mata Pelajaran:* ${jenisUjian}
👤 *Nama Santri:* ${namaSantri}
📅 *Hari/Tanggal:* ${hari}, ${tanggal}
⏰ *Waktu:* ${jam} WIB
📍 *Link Meet:* ${lokasi}

Mohon kehadirannya tepat waktu. Syukron.

---
*Sistem PPDB Al-Andalus Al-Imam*`;
}

async function main() {
    const tomorrowStart = new Date('2026-04-12T00:00:00+07:00');
    const tomorrowEnd = new Date('2026-04-12T23:59:59+07:00');

    // Scheduled for Today at 20:00 WIB
    const scheduledAt = new Date('2026-04-11T20:00:00+07:00');

    console.log(`🚀 Manual Trigger: Finding schedules for Ahad, 12 April 2026...`);

    const jadwalTomorrow = await prisma.jadwalUjian.findMany({
        where: {
            tanggal_ujian: {
                gte: tomorrowStart,
                lte: tomorrowEnd,
            },
        },
        include: {
            pendaftar: true,
            exam_session: true,
            penguji_santri: true,
            penguji_quran: true,
            penguji_ortu: true,
            notif_reminders: true,
        },
    });

    console.log(`Found ${jadwalTomorrow.length} schedules.`);

    let enqueuedSantri = 0;
    let enqueuedPenguji = 0;

    for (const jadwal of jadwalTomorrow) {
        const dateObj = new Date(jadwal.tanggal_ujian);
        const hari = "Ahad";
        const tanggalStr = "12 April 2026";
        
        const timeObj = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
        const jam = timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

        const jenisUjian = jadwal.exam_session?.title || "Seleksi Santri Baru";

        // Determine Meeting Link
        const googleMeetLink = 
            jadwal.penguji_santri?.google_meet_link || 
            jadwal.penguji_quran?.google_meet_link || 
            jadwal.penguji_ortu?.google_meet_link || 
            jadwal.google_meet_link;

        const lokasi = googleMeetLink 
            ? `${jadwal.exam_session?.location || "Online"} (Link: ${googleMeetLink})` 
            : (jadwal.exam_session?.location || "Pesantren Al-Andalus Al-Imam");

        // 1. Enqueue for Santri
        if (jadwal.pendaftar.no_hp) {
            const msgSantri = buildMessageReminderH1Santri(
                jadwal.pendaftar.nama_lengkap,
                hari,
                tanggalStr,
                jam,
                lokasi,
                jenisUjian
            );

            await prisma.whatsappLog.create({
                data: {
                    pendaftar_id: jadwal.pendaftar_id,
                    phone: jadwal.pendaftar.no_hp,
                    jenis_notif: "reminder_h1",
                    status: "pending",
                    message_content: msgSantri,
                    scheduled_at: scheduledAt,
                },
            });

            // Track in JadwalNotifReminder
            await prisma.jadwalNotifReminder.upsert({
                where: {
                    jadwal_ujian_id_pendaftar_id: {
                        jadwal_ujian_id: jadwal.id,
                        pendaftar_id: jadwal.pendaftar_id,
                    },
                },
                update: {},
                create: {
                    jadwal_ujian_id: jadwal.id,
                    pendaftar_id: jadwal.pendaftar_id,
                    reminder_sent: false,
                },
            });
            enqueuedSantri++;
            console.log(`✅ Enqueued reminder for Santri: ${jadwal.pendaftar.nama_lengkap}`);
        }

        // 2. Enqueue for Examiners
        const examiners = [
            { profile: jadwal.penguji_santri, type: "Wawancara Santri/Calsan" },
            { profile: jadwal.penguji_quran, type: "Tes Al-Qur'an" },
            { profile: jadwal.penguji_ortu, type: "Wawancara Cawalsan/Ortu" },
        ].filter(e => e.profile && e.profile.phone);

        for (const ex of examiners) {
            const msgPenguji = buildMessageReminderH1Penguji(
                ex.profile.full_name,
                jadwal.pendaftar.nama_lengkap,
                hari,
                tanggalStr,
                jam,
                ex.profile.google_meet_link || "Menyesuaikan",
                ex.type
            );

            await prisma.whatsappLog.create({
                data: {
                    pendaftar_id: jadwal.pendaftar_id,
                    phone: ex.profile.phone,
                    jenis_notif: "reminder_h1_penguji",
                    status: "pending",
                    message_content: msgPenguji,
                    scheduled_at: scheduledAt,
                },
            });
            enqueuedPenguji++;
            console.log(`✅ Enqueued reminder for Penguji: ${ex.profile.full_name} (${ex.type})`);
        }
    }

    console.log(`\n🎉 DONE!`);
    console.log(`Enqueued Santri: ${enqueuedSantri}`);
    console.log(`Enqueued Penguji: ${enqueuedPenguji}`);
    console.log(`All scheduled for: ${scheduledAt.toISOString()}`);

}

main().catch(console.error).finally(() => prisma.$disconnect());
