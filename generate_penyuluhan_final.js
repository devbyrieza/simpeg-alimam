const ExcelJS = require('exceljs');

async function processExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Insert 3 empty rows at row 17 to make space for 10 items (since original has 7 items from 10 to 16)
  sheet.spliceRows(17, 0, [], [], []);
  
  // Now original row 17 (Total) is at row 20
  
  // Update Header Info
  sheet.getCell('C5').value = ': 19 Agustus 2026';
  sheet.getCell('C6').value = ': Ketua Panitia';
  sheet.getCell('N6').value = ': UKS / Kesehatan';
  sheet.getCell('C7').value = ': Kebutuhan Kegiatan Penyuluhan Kesehatan';
  
  const items = [
    { no: 1, uraian: 'Cetak Banner + Sertifikat 2 + Bingkai 2', qty: 1, ket: 'Paket', harga: 370000 },
    { no: 2, uraian: 'Bensin Pengambilan Banner & Sertifikat', qty: 1, ket: 'Paket', harga: 15000 },
    { no: 3, uraian: 'Konsumsi - Risol', qty: 20, ket: 'Pcs', harga: 2000 },
    { no: 4, uraian: 'Konsumsi - Snack', qty: 60, ket: 'Pcs', harga: 3000 },
    { no: 5, uraian: 'Konsumsi - Aqua gelas 1,5 dus + botol', qty: 1, ket: 'Paket', harga: 40000 },
    { no: 6, uraian: 'Konsumsi - Bolu Amor', qty: 1, ket: 'Pcs', harga: 35000 },
    { no: 7, uraian: 'Konsumsi - Box Snack', qty: 60, ket: 'Pcs', harga: 600 },
    { no: 8, uraian: 'Konsumsi - Buah Semangka', qty: 1, ket: 'Paket', harga: 22000 },
    { no: 9, uraian: 'Konsumsi - Nasi Kotak (Pemateri & Pendamping)', qty: 1, ket: 'Paket', harga: 24000 },
    { no: 10, uraian: 'Amplop Fee Pemateri', qty: 1, ket: 'Orang', harga: 300000 }
  ];

  let startRow = 10;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const row = startRow + i;
    
    // Copy style from row 10 if we created new rows
    if (i >= 7) {
      sheet.getRow(row).height = sheet.getRow(10).height;
      ['B', 'C', 'G', 'H', 'I', 'J'].forEach(col => {
         sheet.getCell(col + row).style = sheet.getCell(col + '10').style;
      });
    }

    sheet.getCell('B'+row).value = item.no;
    sheet.getCell('C'+row).value = item.uraian;
    sheet.getCell('G'+row).value = item.qty;
    sheet.getCell('H'+row).value = item.ket;
    sheet.getCell('I'+row).value = item.harga;
    sheet.getCell('J'+row).value = { formula: 'G'+row+'*I'+row, result: item.qty * item.harga };
  }
  
  // Total row is now at row 20
  sheet.getCell('J20').value = { formula: 'SUM(J10:J19)', result: 1062000 };
  
  // Signatures have moved down by 3 rows.
  // Original Mudir was B21, now B24. Original Kabid IT was E21, now E24.
  sheet.getCell('E24').value = 'Mengetahui,';
  sheet.getCell('E29').value = 'Kepala Bidang Terkait';
  
  sheet.getCell('H29').value = 'Ketua Panitia';
  sheet.getCell('K29').value = 'Ketua Panitia';
  
  // Keterangan Tambahan at A33 (originally A30)
  sheet.getCell('A33').value = 'Keterangan Tambahan:\n1. Seluruh biaya kegiatan penyuluhan ini telah ditalangi oleh Ketua Panitia.\n2. Mohon pencairan dana dapat ditransfer ke rekening pemohon.';
  
  // Set print area
  sheet.pageSetup.printArea = 'A1:O36';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Penyuluhan_Kesehatan_Final.xlsx');
  console.log('Successfully updated Penyuluhan with ExcelJS');
}

processExcel().catch(console.error);
