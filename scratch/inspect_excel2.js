const XLSX = require('xlsx');

const file1 = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data Santri Al Imam.xlsx";

const wb = XLSX.readFile(file1);
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // read as 2D array to find header row

console.log("--- Data Santri Al Imam (First 5 rows) ---");
for (let i = 0; i < 5; i++) {
    if (data[i]) {
        // filter out empty cells for printing
        console.log(`Row ${i}:`, data[i].filter(x => x !== undefined && x !== ""));
    }
}

// Find header row (usually the row with the most columns filled)
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
console.log(`\nProbable header row is ${headerRowIndex}:`, data[headerRowIndex].filter(x => x !== undefined && x !== ""));

// Print first data row
if(data[headerRowIndex+1]) {
    console.log(`\nFirst data row (${headerRowIndex+1}):`, data[headerRowIndex+1].filter(x => x !== undefined && x !== ""));
}
