const XLSX = require('xlsx');

const file = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/Rekap_Daftar_Ulang_2026-06-15.xlsx";
const wb = XLSX.readFile(file);
const sheetName = wb.SheetNames[0];
const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });

console.log("Headers in Rekap Daftar Ulang:");
console.log(data[0]);
