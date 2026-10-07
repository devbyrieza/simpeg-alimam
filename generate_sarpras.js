const ExcelJS = require('exceljs');

async function generate() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  // Header Info
  sheet.getCell('C5').value = ': 10 September 2026';
  sheet.getCell('C6').value = ': Staf Sarpras';
  sheet.getCell('N6').value = ': Sarpras';
  sheet.getCell('C7').value = ': Pembelian Inventaris dan Perlengkapan Sarpras';
  
  const items = [
    { no: 1, uraian: 'Kipas Angin', qty: 2, ket: 'Unit', harga: 250000 },
    { no: 2, uraian: 'Lampu Bohlam LED 12 Watt', qty: 3, ket: 'Pcs', harga: 20000 },
    { no: 3, uraian: 'Kartu SIM by.U (Masa aktif permanen) + Ongkir', qty: 1, ket: 'Paket', harga: 50000 },
    { no: 4, uraian: 'Bola Sepak Size 4 + Bonus (Pompa, Jaring, Pentil)', qty: 1, ket: 'Paket', harga: 215000 },
    { no: 5, uraian: 'Terminal Colokan 5 Lubang Kabel 10 Meter', qty: 1, ket: 'Pcs', harga: 40000 },
    { no: 6, uraian: 'Colokan Listrik Steker T Arde 3 Lubang 3 Arah', qty: 1, ket: 'Pcs', harga: 30000 },
    { no: 7, uraian: 'Mesin Laminating', qty: 1, ket: 'Unit', harga: 350000 }
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
  
  // Total
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 1245000 };
  
  sheet.getCell('E21').value = 'Kepala Bidang Sarpras';
  sheet.getCell('E26').value = '......................';
  sheet.getCell('H26').value = 'Staf Sarpras';
  sheet.getCell('K26').value = 'Staf Sarpras';
  
  sheet.getCell('A30').value = 'Keterangan Tambahan:\nPengajuan ini ditujukan untuk kebutuhan inventaris rutin dan sarana pendukung kegiatan.';
  
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Sarpras.xlsx');
  console.log('Sarpras Excel generated');
}

generate().catch(console.error);
