const ExcelJS = require('exceljs');

async function processExcelKekurangan() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  sheet.getCell('C5').value = ': 19 Agustus 2026';
  sheet.getCell('C6').value = ': Rieza Eka Tomara';
  sheet.getCell('N6').value = ': IT';
  sheet.getCell('C7').value = ': Kekurangan Biaya Infrastruktur Jaringan Printer & Penguat Sinyal Wi-Fi';
  
  const items = [
    { no: 1, uraian: 'Konsumsi Minum Teknisi', qty: 1, ket: 'Paket', harga: 27500 },
    { no: 2, uraian: 'Paket Hemat Wallplug + Sekrup + Mata Bor Beton', qty: 1, ket: 'Paket', harga: 51574 },
    { no: 3, uraian: 'Isolasi Nito Original', qty: 1, ket: 'Pcs', harga: 19742 },
    { no: 4, uraian: 'Kekurangan Dana Akibat Kenaikan Harga Alat (Penguat Sinyal & Printer)', qty: 1, ket: 'Paket', harga: 86180 }
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
  
  for (let i = 14; i <= 16; i++) {
    sheet.getCell('B'+i).value = null;
    sheet.getCell('C'+i).value = null;
    sheet.getCell('G'+i).value = null;
    sheet.getCell('H'+i).value = null;
    sheet.getCell('I'+i).value = null;
    sheet.getCell('J'+i).value = { formula: 'G'+i+'*I'+i, result: 0 };
  }
  
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 184996 };
  
  sheet.getCell('E21').value = 'Kepala Bidang IT';
  sheet.getCell('E26').value = 'Rieza Eka Tomara, S.Kom';
  sheet.getCell('H26').value = 'Rieza Eka Tomara, S.Kom';
  sheet.getCell('K26').value = 'Rieza Eka Tomara, S.Kom';
  
  sheet.getCell('A30').value = 'Keterangan Tambahan:\n1. Terdapat kekurangan biaya riil dari pengajuan sebelumnya (No Rek: 7341759581).';
  
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Kekurangan_Biaya_Jaringan.xlsx');
  console.log('Kekurangan Biaya Excel generated');
}

async function processExcelSpeaker() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Final-4.xlsx');
  
  const sheet = workbook.worksheets[0];
  
  sheet.getCell('C5').value = ': 19 Agustus 2026';
  sheet.getCell('C6').value = ': Imam Wahyudi';
  sheet.getCell('N6').value = ': Media / IT';
  sheet.getCell('C7').value = ': Pembelian Speaker untuk Kelas dan Ruang Rapat';
  
  const items = [
    { no: 1, uraian: 'Speaker Eggel Active 2S (Untuk mengajar & kegiatan rapat)', qty: 1, ket: 'Unit', harga: 338160 }
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
  
  for (let i = 11; i <= 16; i++) {
    sheet.getCell('B'+i).value = null;
    sheet.getCell('C'+i).value = null;
    sheet.getCell('G'+i).value = null;
    sheet.getCell('H'+i).value = null;
    sheet.getCell('I'+i).value = null;
    sheet.getCell('J'+i).value = { formula: 'G'+i+'*I'+i, result: 0 };
  }
  
  sheet.getCell('J17').value = { formula: 'SUM(J10:J16)', result: 338160 };
  
  sheet.getCell('E21').value = 'Kepala Bidang Terkait';
  sheet.getCell('E26').value = 'Teguh Hudaya, Lc, M.M';
  sheet.getCell('H26').value = 'Imam Wahyudi';
  sheet.getCell('K26').value = 'Imam Wahyudi';
  
  sheet.getCell('A30').value = 'Keterangan Tambahan:\n1. Speaker Eggel Active 2S sangat menunjang kebutuhan portabel dan suara jernih untuk kelas maupun rapat.';
  
  sheet.pageSetup.printArea = 'A1:O32';
  
  await workbook.xlsx.writeFile('C:/Users/itpua/Dev/Work/al-andalus/Pengajuan/Pengajuan_Speaker_Eggel.xlsx');
  console.log('Speaker Excel generated');
}

async function run() {
  await processExcelKekurangan();
  await processExcelSpeaker();
}

run().catch(console.error);
