process.env.DATABASE_URL = "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/ppdb_alimam";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function processData() {
    const fileSource = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data_NIS_Santri_Baru_2026_Terpisah.xlsx";
    const fileTarget = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data Santri Al Imam.xlsx";

    // Read source students
    const wbSource = XLSX.readFile(fileSource);
    const sheetSource = wbSource.Sheets[wbSource.SheetNames[0]];
    const rawSource = XLSX.utils.sheet_to_json(sheetSource, { header: 1 });
    
    const students = [];
    for (let i = 2; i < rawSource.length; i++) {
        const row = rawSource[i];
        if (row && row[1]) {
            students.push({
                no: row[0],
                nama: row[1],
                jenjang: row[2],
                nis: row[3]
            });
        }
    }

    console.log(`Found ${students.length} students to process.`);

    const headers = [
        'No', 'Nomor Identitas 1', 'Nomor Identitas 2', 'Nama', 
        'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin', 'Alamat', 
        'Kelas', 'Kelas Detail', 'Tags', 'Note'
    ];
    
    const outData = [headers];

    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        let pendaftar = await prisma.pendaftar.findFirst({
            where: {
                nama_lengkap: {
                    contains: s.nama.trim(),
                    mode: 'insensitive'
                }
            }
        });

        // fallback if exact name not found
        if (!pendaftar) {
            const parts = s.nama.trim().split(' ');
            if (parts.length > 1) {
                pendaftar = await prisma.pendaftar.findFirst({
                    where: {
                        nama_lengkap: {
                            contains: parts[0] + " " + parts[1],
                            mode: 'insensitive'
                        }
                    }
                });
            }
        }

        let nisn = "";
        let tmpLahir = "";
        let tglLahir = "";
        let jk = "";
        let alamatLengkap = "";
        
        if (pendaftar) {
            nisn = pendaftar.nisn || "";
            tmpLahir = pendaftar.tempat_lahir || "";
            if (pendaftar.tanggal_lahir) {
                const d = new Date(pendaftar.tanggal_lahir);
                tglLahir = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
            }
            if (pendaftar.jenis_kelamin) {
                jk = pendaftar.jenis_kelamin.toLowerCase().includes('laki') ? 'L' : 'P';
            }
            
            let parts = [];
            if (pendaftar.alamat) parts.push(pendaftar.alamat);
            if (pendaftar.rt || pendaftar.rw) parts.push(`RT.${pendaftar.rt||'-'}/RW.${pendaftar.rw||'-'}`);
            if (pendaftar.kelurahan) parts.push(`Kel. ${pendaftar.kelurahan}`);
            if (pendaftar.kecamatan) parts.push(`Kec. ${pendaftar.kecamatan}`);
            if (pendaftar.kabupaten) parts.push(pendaftar.kabupaten);
            if (pendaftar.provinsi) parts.push(pendaftar.provinsi);
            alamatLengkap = parts.join(', ');
        } else {
            console.log(`Warning: Could not find DB record for ${s.nama}`);
        }

        let kelas = "";
        if (s.jenjang) {
            const j = s.jenjang.toUpperCase();
            if (j.includes('MTS')) kelas = '7';
            else if (j.includes('IL')) kelas = 'IL';
            else if (j.includes('MA') || j.includes('SMA')) kelas = '10';
            else kelas = s.jenjang;
        }

        outData.push([
            i + 1, // No
            s.nis || "", // Nomor Identitas 1
            nisn, // Nomor Identitas 2
            s.nama, // Nama
            tmpLahir, 
            tglLahir, 
            jk, 
            alamatLengkap, 
            kelas, 
            "", // Kelas Detail
            "", // Tags
            ""  // Note
        ]);
    }

    const newWb = XLSX.utils.book_new();
    const newSheet = XLSX.utils.aoa_to_sheet(outData);
    
    // Adjust column widths
    const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 60 },
        { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 10 }
    ];
    newSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(newWb, newSheet, "Data Santri");
    
    XLSX.writeFile(newWb, fileTarget);
    console.log(`Done! Wrote to ${fileTarget}`);
}

processData().catch(e => {
    console.error(e);
}).finally(async () => {
    await prisma.$disconnect();
});
