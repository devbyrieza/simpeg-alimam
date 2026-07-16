const XLSX = require('xlsx');

const file = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/REKAP HASIL TES.xlsx";
try {
    const wb = XLSX.readFile(file);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`--- ${sheetName} ---`);
    for (let i = 0; i < 5; i++) {
        if (data[i]) {
            console.log(`Row ${i}:`, data[i].filter(x => x !== undefined && x !== ""));
        }
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}
