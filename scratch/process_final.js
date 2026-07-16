process.env.DATABASE_URL = "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function processData() {
    // 1. Read Data_NIS_Santri
    const fileSource = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data_NIS_Santri_Baru_2026_Terpisah.xlsx";
    const wbSource = XLSX.readFile(fileSource);
    const sheetSource = wbSource.Sheets[wbSource.SheetNames[0]];
    const rawSource = XLSX.utils.sheet_to_json(sheetSource, { header: 1 });
    
    const students = [];
    for (let i = 2; i < rawSource.length; i++) {
        const row = rawSource[i];
        if (row && row[1]) {
            students.push({
                no: row[0],
                nama: String(row[1]).trim(),
                jenjang: row[2],
                nis: row[3]
            });
        }
    }

    // 2. Read Rekap Daftar Ulang to map Name to Nomor Pendaftaran
    const fileRekap = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/Rekap_Daftar_Ulang_2026-06-15.xlsx";
    const wbRekap = XLSX.readFile(fileRekap);
    const sheetRekap = wbRekap.Sheets[wbRekap.SheetNames[0]];
    const rawRekap = XLSX.utils.sheet_to_json(sheetRekap, { header: 1 });
    
    const rekapMap = {}; // name (lower) -> nomor pendaftaran
    for (let i = 2; i < rawRekap.length; i++) {
        const row = rawRekap[i];
        if (row && row[2] && row[3]) { // Index 2: Nama Santri, Index 3: Nomor Pendaftaran
            const nama = String(row[2]).trim().toLowerCase();
            const nopendaftar = String(row[3]).trim();
            rekapMap[nama] = nopendaftar;
        }
    }

    console.log(`Loaded ${students.length} students from NIS file.`);
    console.log(`Loaded ${Object.keys(rekapMap).length} records from Rekap Daftar Ulang.`);

    const headers = [
        'No', 'Nomor Identitas 1', 'Nomor Identitas 2', 'Nama', 
        'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin', 'Alamat', 
        'Kelas', 'Kelas Detail', 'Tags', 'Note'
    ];
    
    const outData = [headers];
    let matchedCount = 0;

    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const sNamaLower = s.nama.toLowerCase();
        
        let noPendaftaran = rekapMap[sNamaLower];
        // try partial match if not exact
        if (!noPendaftaran) {
            const possibleNames = Object.keys(rekapMap).filter(k => k.includes(sNamaLower) || sNamaLower.includes(k));
            if (possibleNames.length > 0) {
                noPendaftaran = rekapMap[possibleNames[0]];
                console.log(`Fuzzy matched ${s.nama} to ${possibleNames[0]}`);
            }
        }

        let pendaftar = null;
        if (noPendaftaran) {
            pendaftar = await prisma.pendaftar.findFirst({
                where: { nomor_pendaftaran: noPendaftaran }
            });
        }

        if (!pendaftar && !noPendaftaran) {
            // as a last resort, try searching db by name directly
            pendaftar = await prisma.pendaftar.findFirst({
                where: { nama_lengkap: { contains: s.nama, mode: 'insensitive' } }
            });
        }

        let nisn = "";
        let tmpLahir = "";
        let tglLahir = "";
        let jk = "";
        let alamatLengkap = "";
        
        if (pendaftar) {
            matchedCount++;
            nisn = pendaftar.nisn || "";
            tmpLahir = pendaftar.tempat_lahir || "";
            if (pendaftar.tanggal_lahir) {
                const d = new Date(pendaftar.tanggal_lahir);
                tglLahir = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
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
            console.log(`Warning: Could not find DB record for ${s.nama} (NoPendaftaran: ${noPendaftaran || 'None'})`);
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
            s.nis || "", // Nomor Identitas 1 (NIS)
            nisn, // Nomor Identitas 2 (NISN)
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

    const fileTarget = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data Santri Al Imam.xlsx";
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
    console.log(`Done! Wrote to ${fileTarget}. Matched ${matchedCount} out of ${students.length} students.`);
}

processData().catch(e => {
    console.error(e);
}).finally(async () => {
    await prisma.$disconnect();
});
