const XLSX = require('xlsx');

const fileSource = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data_NIS_Santri_Baru_2026_Terpisah.xlsx";
const wbSource = XLSX.readFile(fileSource);
console.log("Sheet names:");
console.log(wbSource.SheetNames);

for (let name of wbSource.SheetNames) {
    const sheet = wbSource.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\nSheet: ${name}, rows: ${data.length}`);
    console.log(data.slice(0, 5));
}
