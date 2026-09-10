const ExcelJS = require('exceljs');

async function generate() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Header Info
  sheet.getCell('C5').value = ': 02 September 2026';
  sheet.getCell('C6').value = ': Rieza Eka Tomara';
  sheet.getCell('N6').value = ': IT';
  sheet.getCell('C7').value = ': Pembayaran Invoice ID Card (Kartu Jajan) Gelombang 2';
  sheet.getCell('N7').value = ': BNI 7000040408'; // Add Bank info to Rekening
  
  const items = [
    { no: 1, uraian: 'Registrasi User (PT Teknologi Kartu Indonesia)', qty: 14, ket: 'User', harga: 10000 },
    { no: 2, uraian: 'Cetak Kartu Digital', qty: 14, ket: 'Pcs', harga: 20000 },
    { no: 3, uraian: 'Pajak (PPN 12%)', qty: 1, ket: 'Paket', harga: 46200 }
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
  
  // Clear rows 13 to 16
  for (let i = 13; i <= 16; i++) {
    sheet.getCell('B'+i).value = null;
    sheet.getCell('C'+i).value = null;
    sheet.getCell('G'+i).value = null;
    sheet.getCell('H'+i).value = null;
    sheet.getCell('I'+i).value = null;
    sheet.getCell('J'+i).value = { formula: 'G'+i+'*I'+i, result: 0 };
  }
  
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 466200 };
  
  sheet.getCell('E21').value = 'Kepala Bidang IT';
  sheet.getCell('E26').value = 'Rieza Eka Tomara, S.Kom';
  sheet.getCell('H26').value = 'Rieza Eka Tomara, S.Kom';
  sheet.getCell('K26').value = 'Rieza Eka Tomara, S.Kom';
  
  sheet.getCell('A30').value = 'Keterangan Tambahan:\n1. Pembayaran ditujukan ke rekening Bank BNI (7000040408) a.n. PT Teknologi Kartu Indonesia.\n2. Invoice penawaran terlampir.';
  
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_IDCard_Gel2.xlsx');
  console.log('ID Card Excel generated');
}

generate().catch(console.error);
