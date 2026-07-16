const XLSX = require('xlsx');

const file = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/REKAP HASIL TES.xlsx";
try {
    const wb = XLSX.readFile(file);
    console.log("Sheets:", wb.SheetNames);
    
    // Check if there is a sheet with full biodata
    wb.SheetNames.forEach(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if(data.length > 0) {
            console.log(`\n--- ${sheetName} (first 2 rows) ---`);
            console.log(data[0]);
            console.log(data[1]);
        }
    });
} catch (e) {
    console.error("Error reading file:", e.message);
}
