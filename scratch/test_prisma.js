const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function testQuery() {
    const file2 = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data_NIS_Santri_Baru_2026_Terpisah.xlsx";
    const wb = XLSX.readFile(file2);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    const students = [];
    for (let i = 2; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row[1]) {
            students.push({
                no: row[0],
                nama: row[1],
                jenjang: row[2],
                nis: row[3]
            });
        }
    }
    console.log(`Found ${students.length} students in Excel.`);
    console.log("First 3:", students.slice(0, 3));

    // Try finding one student
    const testName = students[0].nama;
    console.log(`\nSearching for ${testName} in DB...`);
    const pendaftar = await prisma.pendaftar.findFirst({
        where: {
            nama_lengkap: {
                contains: testName.trim(),
                mode: 'insensitive'
            }
        }
    });
    console.log(pendaftar ? `Found: ${pendaftar.nama_lengkap}, NISN: ${pendaftar.nisn}, TL: ${pendaftar.tempat_lahir}, TGL: ${pendaftar.tanggal_lahir}` : "Not found");

    const pendaftar2 = await prisma.pendaftar.findFirst({
        where: {
            nama_lengkap: {
                contains: students[1].nama.trim(),
                mode: 'insensitive'
            }
        }
    });
    console.log(pendaftar2 ? `Found: ${pendaftar2.nama_lengkap}, NISN: ${pendaftar2.nisn}` : "Not found " + students[1].nama);
    
    await prisma.$disconnect();
}

testQuery().catch(e => {
    console.error(e);
    process.exit(1);
});
