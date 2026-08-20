const ExcelJS = require('exceljs');

async function updateSpeakerPrice() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Speaker_Eggel.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Update price in I10 (Harga Satuan) and J10 (Total Harga)
  sheet.getCell('I10').value = 338660;
  sheet.getCell('J10').value = { formula: 'G10*I10', result: 338660 };
  
  // Update Total Pengajuan in J17
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 338660 };
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Speaker_Eggel.xlsx');
  console.log('Speaker price updated successfully');
}

updateSpeakerPrice().catch(console.error);
