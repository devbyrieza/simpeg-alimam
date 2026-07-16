const XLSX = require('xlsx');
const file = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/Rekap_Daftar_Ulang_2026-06-15.xlsx";
try {
    const wb = XLSX.readFile(file);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`--- ${sheetName} ---`);
    if(data.length > 0) {
        let maxCols = 0;
        let headerRowIndex = 0;
        for(let i = 0; i < 10; i++) {
            if(data[i]) {
                let cols = data[i].filter(x => x !== undefined && x !== "").length;
                if(cols > maxCols) {
                    maxCols = cols;
                    headerRowIndex = i;
                }
            }
        }
        console.log(`Probable header row is ${headerRowIndex}:`, data[headerRowIndex]);
        console.log("Row 1:", data[headerRowIndex+1]);
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}
