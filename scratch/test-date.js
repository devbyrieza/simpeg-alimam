
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);

const hari = tomorrow.toLocaleDateString("id-ID", { weekday: "long" }).replace("Minggu", "Ahad");
const tanggalStr = tomorrow.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

console.log("Hari:", hari);
console.log("TanggalStr:", tanggalStr);
console.log("Combined:", `${hari}, ${tanggalStr}`);

const timeObj = new Date();
const jam = timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
console.log("Jam:", jam);
console.log("Jam with WIB:", `${jam} WIB`);
