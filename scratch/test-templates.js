
function buildMessageReminderH1Santri(
    nama,
    hari,
    tanggal,
    jam,
    lokasi,
    jenisUjian
) {
    // Logic from the file
    const finalHari = tanggal.toLowerCase().includes(hari.toLowerCase()) ? "" : `${hari}, `;
    const finalJam = jam.toLowerCase().includes("wib") ? jam : `${jam} WIB`;

    return `*PENGINGAT UJIAN SELEKSI*

Assalamu'alaikum Warahmatullahi Wabarakatuh.
Halo Ananda *${nama}*,

Mengingatkan kembali jadwal *${jenisUjian}* Anda:

📅 *Hari/Tanggal:* ${finalHari}${tanggal}
⏰ *Waktu:* ${finalJam}
📍 *Lokasi/Link:* ${lokasi}

Mohon kehadiran tepat waktu dan persiapkan diri dengan baik. Syukron.

---
*Sistem PPDB Al-Andalus Al-Imam*`;
}

console.log("--- TEST 1: No duplicates ---");
console.log(buildMessageReminderH1Santri("Labib", "Rabu", "15 April 2026", "08.00", "Link", "Tes Al-Qur'an"));

console.log("\n--- TEST 2: With duplicates ---");
console.log(buildMessageReminderH1Santri("Labib", "Rabu", "Rabu, 15 April 2026", "08.00 WIB", "Link", "Tes Al-Qur'an"));
