const ExcelJS = require('exceljs');

async function processExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Update Header Info
  sheet.getCell('C5').value = ': 12 Agustus 2026';
  sheet.getCell('C6').value = ': Imam Wahyudi';
  sheet.getCell('N6').value = ': Media / PPDB';
  sheet.getCell('C7').value = ': Pembelian Printer Kantor PPDB-Guru-Media';
  
  // Item 1
  sheet.getCell('B10').value = 1;
  sheet.getCell('C10').value = 'Printer untuk Kantor PPDB-Guru-Media';
  sheet.getCell('G10').value = 1;
  sheet.getCell('H10').value = 'Unit';
  sheet.getCell('I10').value = 1250000;
  sheet.getCell('J10').value = { formula: 'G10*I10', result: 1250000 };
  
  // Clear Item 2 to 7 (rows 11 to 16)
  for (let i = 11; i <= 16; i++) {
    sheet.getCell('B'+i).value = null;
    sheet.getCell('C'+i).value = null;
    sheet.getCell('G'+i).value = null;
    sheet.getCell('H'+i).value = null;
    sheet.getCell('I'+i).value = null;
    sheet.getCell('J'+i).value = { formula: 'G'+i+'*I'+i, result: 0 };
  }
  
  // Update Total
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 1250000 };
  
  // Signers
  sheet.getCell('E21').value = 'Kabid Media';
  sheet.getCell('E26').value = 'Teguh Hudaya, Lc, M.M';
  
  sheet.getCell('H26').value = 'Imam Wahyudi';
  sheet.getCell('K26').value = 'Imam Wahyudi';
  
  // Keterangan Tambahan
  sheet.getCell('A30').value = 'Keterangan Tambahan:\nPrinter ini ditujukan untuk kebutuhan cetak dokumen administrasi harian di kantor bersama (PPDB, Guru, dan Media).';
  
  // Set page setup
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Printer.xlsx');
  console.log('Successfully updated with ExcelJS');
}

processExcel().catch(console.error);
