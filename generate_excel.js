const ExcelJS = require('exceljs');
const path = require('path');

const data = [
  { no: 1, nama: 'Abdul Aziz Ali', jenjang: 'MTs', nis: '2601070001' },
  { no: 2, nama: 'Abdul Hakim', jenjang: 'MTs', nis: '2601070002' },
  { no: 3, nama: 'Ahmad Farros Al Barqy', jenjang: 'MTs', nis: '2601070003' },
  { no: 4, nama: 'Atqanul Ummah Ahmad', jenjang: 'MTs', nis: '2601070004' },
  { no: 5, nama: 'Azka Panji Kusuma', jenjang: 'MTs', nis: '2601070005' },
  { no: 6, nama: 'Fariq Malaibui', jenjang: 'MTs', nis: '2601070006' },
  { no: 7, nama: 'Geysa Raipan', jenjang: 'MTs', nis: '2601070007' },
  { no: 8, nama: 'Haidar Ayyubi', jenjang: 'MTs', nis: '2601070008' },
  { no: 9, nama: 'Labibullah El Fatih', jenjang: 'MTs', nis: '2601070009' },
  { no: 10, nama: 'M Fazril Alkais', jenjang: 'MTs', nis: '2601070010' },
  { no: 11, nama: 'Muh Asrorin Da Silva', jenjang: 'MTs', nis: '2601070011' },
  { no: 12, nama: 'Muhammad Azzam Al Hafiz', jenjang: 'MTs', nis: '2601070012' },
  { no: 13, nama: 'Muhammad Hafidz Reo Afelano', jenjang: 'MTs', nis: '2601070013' },
  { no: 14, nama: 'Muhammad Rifqi Hamid', jenjang: 'MTs', nis: '2601070014' },
  { no: 15, nama: 'Muhammad Yahya Ayyash', jenjang: 'MTs', nis: '2601070015' },
  { no: 16, nama: 'Naufal Dzakiy Purnama', jenjang: 'MTs', nis: '2601070016' },
  { no: 17, nama: 'Daffa Muammar Dzaki', jenjang: 'IL', nis: '2602070001' },
  { no: 18, nama: 'Fanni Hariri Hamonangan', jenjang: 'IL', nis: '2602070002' },
  { no: 19, nama: 'Farid', jenjang: 'IL', nis: '2602070003' },
  { no: 20, nama: 'Favian Radi', jenjang: 'IL', nis: '2602070004' },
  { no: 21, nama: 'Hibban Hibaturrahman', jenjang: 'IL', nis: '2602070005' },
  { no: 22, nama: 'Ken Alfarezha Haryadi', jenjang: 'IL', nis: '2602070006' },
  { no: 23, nama: 'Khubaib Abdul Aziz', jenjang: 'IL', nis: '2602070007' },
  { no: 24, nama: 'Lalu Muhamad Rizky Ananda', jenjang: 'IL', nis: '2602070008' },
  { no: 25, nama: 'Miizan Alghifary Dizlilar', jenjang: 'IL', nis: '2602070009' },
  { no: 26, nama: 'Muhammad Rasyid Ridho', jenjang: 'IL', nis: '2602070010' },
  { no: 27, nama: 'Muhammad Rizky', jenjang: 'IL', nis: '2602070011' },
  { no: 28, nama: 'Raylan Akbar', jenjang: 'IL', nis: '2602070012' }
];

async function generate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data NIS Santri');

  // Title Rows
  sheet.mergeCells('A1:D1');
  const titleRow1 = sheet.getCell('A1');
  titleRow1.value = 'DATA NOMOR INDUK SANTRI (NIS) BARU - TAHUN 2026';
  titleRow1.font = { name: 'Arial', size: 14, bold: true };
  titleRow1.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A2:D2');
  const titleRow2 = sheet.getCell('A2');
  titleRow2.value = 'Pondok Pesantren Al Andalus Al Imam';
  titleRow2.font = { name: 'Arial', size: 12, bold: true };
  titleRow2.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add empty row for spacing
  sheet.addRow([]);

  // Headers manually on row 4
  const headerRow = sheet.getRow(4);
  headerRow.values = ['No', 'Nama Santri', 'Jenjang', 'NIS'];
  
  // Apply style only to columns 1 to 4 to prevent over-extension
  for (let i = 1; i <= 4; i++) {
    const cell = headerRow.getCell(i);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800000' } }; // Maroon color
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // Adjust column widths
  sheet.getColumn(1).width = 5;
  sheet.getColumn(2).width = 35;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 20;

  // Add data starting from row 5
  data.forEach((item, index) => {
    const row = sheet.getRow(5 + index);
    row.values = [item.no, item.nama, item.jenjang, item.nis];
  });

  // Borders and center alignment for table rows (row 4 to end)
  const totalRows = data.length + 4;
  for (let r = 4; r <= totalRows; r++) {
    const row = sheet.getRow(r);
    for (let colNumber = 1; colNumber <= 4; colNumber++) {
      const cell = row.getCell(colNumber);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (colNumber === 1 || colNumber === 3 || colNumber === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }
  }

  const filePath = path.join(__dirname, '..', 'Data_NIS_Santri_Baru_2026_Final_v4.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('Excel file generated at', filePath);
}

generate().catch(console.error);
