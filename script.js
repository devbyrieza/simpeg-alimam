const ExcelJS = require('exceljs');

async function processExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Update Header Info
  sheet.getCell('C5').value = ': 19 Agustus 2026';
  sheet.getCell('C6').value = ': Ketua Panitia';
  sheet.getCell('N6').value = ': UKS / Kesehatan';
  sheet.getCell('C7').value = ': Kebutuhan Kegiatan Penyuluhan Kesehatan (Reimburse)';
  
  // Items
  const items = [
    { no: 1, uraian: 'Cetak Banner + Sertifikat 2 + Bingkai Sertifikat 2', qty: 1, ket: 'Paket', harga: 370000 },
    { no: 2, uraian: 'Bensin pengambilan Banner & Sertifikat', qty: 1, ket: 'Paket', harga: 15000 },
    { no: 3, uraian: 'Konsumsi - Risol', qty: 20, ket: 'Pcs', harga: 2000 },
    { no: 4, uraian: 'Konsumsi - Snack', qty: 60, ket: 'Pcs', harga: 3000 },
    { no: 5, uraian: 'Aqua gelas 1,5 dus + botol', qty: 1, ket: 'Paket', harga: 40000 },
    { no: 6, uraian: 'Bolu Amor', qty: 1, ket: 'Pcs', harga: 35000 },
    { no: 7, uraian: 'Box Snack', qty: 60, ket: 'Pcs', harga: 600 },
    { no: 8, uraian: 'Buah Semangka', qty: 1, ket: 'Paket', harga: 22000 },
    { no: 9, uraian: 'Nasi Kotak (Pemateri & Pendamping)', qty: 1, ket: 'Paket', harga: 24000 },
    { no: 10, uraian: 'Amplop Fee Pemateri', qty: 1, ket: 'Orang', harga: 300000 }
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
  
  // Update Total in the next row
  const totalRow = startRow + items.length;
  sheet.getCell('J'+totalRow).value = { formula: 'SUM(J10:J'+(totalRow-1)+')', result: 1062000 };
  sheet.getCell('B'+totalRow).value = 'Total Pengajuan';
  
  // Clear any extra rows from original template if needed (though there are exactly 10 rows? No, original had 7 rows, we just overwrote and extended).
  // Actually, wait. original total was on row 17. Our total is on row 20.
  // We need to shift everything down? ExcelJS doesn't shift automatically like that easily without insertRow.
  // Let's use sheet.spliceRows to insert rows so we don't overwrite the signatures!
  
  // Better approach:
