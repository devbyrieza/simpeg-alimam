const ExcelJS = require('exceljs');

async function processExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Update Header Info
  sheet.getCell('C5').value = ': 17 Agustus 2026';
  sheet.getCell('C6').value = ': Panitia Penyuluhan';
  sheet.getCell('N6').value = ': UKS / Kesehatan';
  sheet.getCell('C7').value = ': Kebutuhan Kegiatan Penyuluhan Kesehatan';
  
  // Items
  const items = [
    { no: 1, uraian: 'Konsumsi snack santri dan panitia', qty: 60, ket: 'Orang', harga: 5000 },
    { no: 2, uraian: 'Hidangan di meja depan tempat pemateri', qty: 1, ket: 'Paket', harga: 50000 },
    { no: 3, uraian: 'Cetak Banner Kegiatan', qty: 1, ket: 'Pcs', harga: 320000 },
    { no: 4, uraian: 'Cetak Sertifikat dan Bingkai Sertifikat', qty: 1, ket: 'Paket', harga: 0 },
    { no: 5, uraian: 'Amplop Fee Pemateri', qty: 1, ket: 'Orang', harga: 300000 },
    { no: 6, uraian: 'Amplop Fee Tim Puskesmas Pendamping', qty: 1, ket: 'Orang', harga: 100000 }
  ];

  let startRow = 10;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const row = startRow + i;
    sheet.getCell('B'+row).value = item.no;
    sheet.getCell('C'+row).value = item.uraian;
    sheet.getCell('G'+row).value = item.qty;
    sheet.getCell('H'+row).value = item.ket;
    sheet.getCell('I'+row).value = item.harga;
    sheet.getCell('J'+row).value = { formula: 'G'+row+'*I'+row, result: item.qty * item.harga };
  }
  
  // Clear Item 7 (row 16)
  sheet.getCell('B16').value = null;
  sheet.getCell('C16').value = null;
  sheet.getCell('G16').value = null;
  sheet.getCell('H16').value = null;
  sheet.getCell('I16').value = null;
  sheet.getCell('J16').value = { formula: 'G16*I16', result: 0 };
  
  // Update Total
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 1070000 };
  
  // Signers
  sheet.getCell('E21').value = 'Kabid Terkait';
  sheet.getCell('E26').value = '......................';
  
  sheet.getCell('H26').value = 'Panitia Penyuluhan';
  sheet.getCell('K26').value = 'Panitia Penyuluhan';
  
  // Keterangan Tambahan
  sheet.getCell('A30').value = 'Keterangan Tambahan:\n* Untuk biaya cetak sertifikat & bingkai menyusul (akan diisi manual setelah fix).';
  
  // Set page setup
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Penyuluhan_Kesehatan.xlsx');
  console.log('Successfully updated with ExcelJS');
}

processExcel().catch(console.error);
