const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
  'REKAP HASIL TES.xlsx',
  'Rekap_Daftar_Ulang_2026-06-15.xlsx',
  'requirements/REKAP HASIL TES.xlsx',
  '../alandalus-ululalbaab/3. KANGGE SK Penerimaan santri baru 2026-2027 2.xlsx',
  '../alandalus-ululalbaab/Data_Santri_Putri_UlulAlbaab_2026-2027.xlsx',
  '../alandalus-ululalbaab/MASTER_PPDB_UlulAlbaab_2026-2027.xlsx',
  '../alandalus-ululalbaab/REKAP HASIL TES.xlsx',
  '../alandalus-ululalbaab/Update DATA UP 2026-2027.xlsx',
  '../alandalus-ululalbaab/requirements/REKAP HASIL TES.xlsx',
  '../template-demo/REKAP HASIL TES.xlsx',
  '../template-demo/requirements/REKAP HASIL TES.xlsx'
];

const targetNames = [
  "Labibullah El Fatih",
  "Fariq Malaibui",
  "Muhammad Rizky",
  "Muh Asrorin Da Silva",
  "Azka Panji Kusuma",
  "M Fazril Alkais",
  "Haidar Ayyubi",
  "Atqanul Ummah Ahmad",
  "Muhammad Hafidz Reo Afelano",
  "Muhammad Rasyid Ridho",
  "Naufal Dzakiy Purnama"
];

const results = {};

function searchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`Searching file: ${filePath}...`);
  try {
    const workbook = xlsx.readFile(filePath);
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      
      data.forEach((row, index) => {
        const rowStr = JSON.stringify(row).toLowerCase();
        targetNames.forEach(name => {
          const parts = name.split(' ');
          const match = parts.every(part => rowStr.includes(part.toLowerCase()));
          if (match) {
            if (!results[name]) {
              results[name] = [];
            }
            results[name].push({
              file: filePath,
              sheet: sheetName,
              rowNumber: index + 2,
              data: row
            });
          }
        });
      });
    });
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

files.forEach(searchFile);

fs.writeFileSync('../scratch/all-xlsx-results.json', JSON.stringify(results, null, 2));
console.log('Saved all Excel search results to scratch/all-xlsx-results.json');
