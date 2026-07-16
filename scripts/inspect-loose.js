const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../scratch/all-xlsx-results.json', 'utf8'));

Object.entries(data).forEach(([kw, matches]) => {
  console.log(`Keyword: ${kw} (${matches.length} matches)`);
  const uniqueNames = new Set();
  matches.forEach(m => {
    const row = m.data;
    const nameVal = row.Nama || row["Nama Lengkap"] || row["__EMPTY_1"] || row["Nama Calon Santri/Wati"] || row["__EMPTY"] || "";
    if (typeof nameVal === 'string') {
      uniqueNames.add(`${nameVal.trim()} (Sheet: ${m.sheet}, Row: ${m.rowNumber}, File: ${m.file})`);
    }
  });
  uniqueNames.forEach(n => console.log(`  - ${n}`));
});
