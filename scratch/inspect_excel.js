const XLSX = require('xlsx');

const file1 = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data Santri Al Imam.xlsx";
const file2 = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data_NIS_Santri_Baru_2026_Terpisah.xlsx";

function printFile(filePath, name) {
    console.log(`\n--- ${name} ---`);
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
        console.log(data.slice(0, 3));
    } else {
        console.log("Empty sheet");
    }
}

printFile(file1, "Data Santri Al Imam");
printFile(file2, "Data_NIS_Santri_Baru_2026_Terpisah");
