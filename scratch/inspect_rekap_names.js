const XLSX = require('xlsx');

const fileRekap = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/Rekap_Daftar_Ulang_2026-06-15.xlsx";
const wbRekap = XLSX.readFile(fileRekap);
const sheetRekap = wbRekap.Sheets[wbRekap.SheetNames[0]];
const rawRekap = XLSX.utils.sheet_to_json(sheetRekap, { header: 1 });

for (let i = 2; i < Math.min(rawRekap.length, 15); i++) {
    const row = rawRekap[i];
    console.log(`Rekap row ${i}: Nama Santri: ${row[2]}, NoPendaftaran: ${row[3]}`);
}
