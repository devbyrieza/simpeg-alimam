const XLSX = require('xlsx');

const fileRekap = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/Rekap_Daftar_Ulang_2026-06-15.xlsx";
const wbRekap = XLSX.readFile(fileRekap);
const sheetRekap = wbRekap.Sheets[wbRekap.SheetNames[0]];
const rawRekap = XLSX.utils.sheet_to_json(sheetRekap, { header: 1 });

console.log("Rekap Row 1 (Headers):");
console.log(rawRekap[1]);
console.log("\nRekap Row 2 (Data):");
console.log(rawRekap[2]);
