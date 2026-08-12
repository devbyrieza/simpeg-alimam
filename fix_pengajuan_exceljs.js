const ExcelJS = require('exceljs');

async function processExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Update Header Info
  sheet.getCell('C5').value = ': 12 Agustus 2026';
  sheet.getCell('C6').value = ': Imam Wahyudi';
  sheet.getCell('N6').value = ': Media / PSB';
  sheet.getCell('C7').value = ': Pencairan Fee Penguji & Pewawancara PSB';
  
  // Item 1
  sheet.getCell('B10').value = 1;
  sheet.getCell('C10').value = 'Fee Penguji & Pewawancara PSB Al Imam Al Islami';
  sheet.getCell('G10').value = 1;
  sheet.getCell('H10').value = 'Laporan';
  sheet.getCell('I10').value = 650000;
  sheet.getCell('J10').value = { formula: 'G10*I10', result: 650000 };
  
  // Item 2
  sheet.getCell('B11').value = 2;
  sheet.getCell('C11').value = 'Fee Penguji & Pewawancara PSB Al Andalus Ulul Albaab';
  sheet.getCell('G11').value = 1;
  sheet.getCell('H11').value = 'Laporan';
  sheet.getCell('I11').value = 160000;
  sheet.getCell('J11').value = { formula: 'G11*I11', result: 160000 };
  
  // Clear Item 3 to 7 (rows 12 to 16)
  for (let i = 12; i <= 16; i++) {
    sheet.getCell('B'+i).value = null;
    sheet.getCell('C'+i).value = null;
    sheet.getCell('G'+i).value = null;
    sheet.getCell('H'+i).value = null;
    sheet.getCell('I'+i).value = null;
    sheet.getCell('J'+i).value = { formula: 'G'+i+'*I'+i, result: 0 };
  }
  
  // Update Total
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 810000 };
  
  // Signers
  sheet.getCell('E21').value = 'Kabid Media';
  sheet.getCell('E26').value = 'Teguh Hudaya, Lc, M.M';
  
  sheet.getCell('H26').value = 'Imam Wahyudi';
  sheet.getCell('K26').value = 'Imam Wahyudi';
  
  // Keterangan Tambahan
  sheet.getCell('A30').value = 'Keterangan Tambahan:\n1. Rincian detail fee per penguji/pewawancara terlampir di file FEE_PENGUJI_FIX_2026.xlsx\n2. Fee dihitung berdasarkan jumlah sesi (Rp 10.000 / sesi).';
  
  // Set page setup
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Fee_Penguji_V2.xlsx');
  console.log('Successfully updated with ExcelJS');
}

processExcel().catch(console.error);
