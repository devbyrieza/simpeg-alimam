const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
  '../alandalus-ululalbaab/3. KANGGE SK Penerimaan santri baru 2026/2027 2.xlsx',
  '../alandalus-ululalbaab/Data_Santri_Putri_UlulAlbaab_2026/2027.xlsx',
  '../alandalus-ululalbaab/MASTER_PPDB_UlulAlbaab_2026/2027.xlsx',
  '../alandalus-ululalbaab/Update DATA UP 2026/2027.xlsx'
];

const targetKeywords = [
  "Azka",
  "Fazril",
  "Asrorin",
  "Fariq",
  "Haidar",
  "Labibullah",
  "Atqanul",
  "Hafidz",
  "Rasyid Ridho"
];

const results = {};

function searchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`Searching file: ${filePath}...`);
  const workbook = xlsx.readFile(filePath);
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    data.forEach((row, index) => {
      const rowStr = JSON.stringify(row).toLowerCase();
      targetKeywords.forEach(kw => {
        if (rowStr.includes(kw.toLowerCase())) {
          if (!results[kw]) {
            results[kw] = [];
          }
          results[kw].push({
            file: path.basename(filePath),
            sheet: sheetName,
            rowNumber: index + 2,
            data: row
          });
        }
      });
    });
  });
}

files.forEach(searchFile);

fs.writeFileSync('../scratch/ulul-loose-excel-results.json', JSON.stringify(results, null, 2));
console.log('Saved ulul search results to scratch/ulul-loose-excel-results.json');
