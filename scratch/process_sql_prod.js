const fs = require('fs');
const XLSX = require('xlsx');

function parseSqlDump(filePath) {
    const lines = fs.readFileSync(filePath, 'utf16le').split('\n');
    let inPendaftar = false;
    const pendaftars = [];

    // Indices based on COPY statement
    const colId = 0;
    const colNama = 5;
    const colJk = 6;
    const colTempatLahir = 8;
    const colTanggalLahir = 9;
    const colAlamat = 10;
    const colRt = 11;
    const colRw = 12;
    const colKelurahan = 13;
    const colKecamatan = 14;
    const colKabupaten = 15;
    const colProvinsi = 16;
    const colNisn = 26;

    for (let line of lines) {
        if (line.startsWith('COPY public.pendaftar (')) {
            inPendaftar = true;
            continue;
        }
        if (inPendaftar) {
            if (line.startsWith('\\.')) {
                inPendaftar = false;
                break;
            }
            const parts = line.split('\t');
            if (parts.length > colNisn) {
                pendaftars.push({
                    id: parts[colId],
                    nama_lengkap: parts[colNama] === '\\N' ? '' : parts[colNama],
                    jenis_kelamin: parts[colJk] === '\\N' ? '' : parts[colJk],
                    tempat_lahir: parts[colTempatLahir] === '\\N' ? '' : parts[colTempatLahir],
                    tanggal_lahir: parts[colTanggalLahir] === '\\N' ? '' : parts[colTanggalLahir],
                    alamat: parts[colAlamat] === '\\N' ? '' : parts[colAlamat],
                    rt: parts[colRt] === '\\N' ? '' : parts[colRt],
                    rw: parts[colRw] === '\\N' ? '' : parts[colRw],
                    kelurahan: parts[colKelurahan] === '\\N' ? '' : parts[colKelurahan],
                    kecamatan: parts[colKecamatan] === '\\N' ? '' : parts[colKecamatan],
                    kabupaten: parts[colKabupaten] === '\\N' ? '' : parts[colKabupaten],
                    provinsi: parts[colProvinsi] === '\\N' ? '' : parts[colProvinsi],
                    nisn: parts[colNisn] === '\\N' ? '' : parts[colNisn],
                });
            }
        }
    }
    return pendaftars;
}

function processData() {
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

    const pendaftars = parseSqlDump("c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/scratch/production_dump.sql");
    console.log(`Loaded ${pendaftars.length} records from SQL dump.`);

    const headers = [
        'No', 'Nomor Identitas 1', 'Nomor Identitas 2', 'Nama', 
        'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin', 'Alamat', 
        'Kelas', 'Kelas Detail', 'Tags', 'Note'
    ];
    
    const outData = [headers];
    let matchedCount = 0;

    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const sNamaLower = s.nama.toLowerCase().replace(/[^a-z0-9 ]/g, ''); // normalize
        
        let pendaftar = pendaftars.find(p => p.nama_lengkap.toLowerCase().replace(/[^a-z0-9 ]/g, '') === sNamaLower);
        
        if (!pendaftar) {
            pendaftar = pendaftars.find(p => p.nama_lengkap.toLowerCase().replace(/[^a-z0-9 ]/g, '').includes(sNamaLower) || sNamaLower.includes(p.nama_lengkap.toLowerCase().replace(/[^a-z0-9 ]/g, '')));
        }

        let nisn = "";
        let tmpLahir = "";
        let tglLahir = "";
        let jk = "";
        let alamatLengkap = "";
        
        if (pendaftar) {
            matchedCount++;
            nisn = pendaftar.nisn;
            tmpLahir = pendaftar.tempat_lahir;
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

    const fileTarget = "c:/Users/itpua/Dev/Work/al-andalus/safina-keuangan/Data Santri Al Imam.xlsx";
    const newWb = XLSX.utils.book_new();
    const newSheet = XLSX.utils.aoa_to_sheet(outData);
    
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

processData();
