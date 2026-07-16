const XLSX = require('xlsx');
const path = require('path');

function searchExcel(filename, query) {
  console.log(`Searching for "${query}" in ${filename}...`);
  const workbook = XLSX.readFile(filename);
  let found = false;

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && cell.toString().toLowerCase().includes(query.toLowerCase())) {
          console.log(`FOUND in sheet "${sheetName}", row ${rowIndex + 1}, col ${colIndex + 1}: ${cell}`);
          console.log('Full Row:', row);
          found = true;
        }
      });
    });
  });

  if (!found) console.log('No matches found in Excel.');
}

searchExcel('REKAP HASIL TES.xlsx', 'Fakhira');
