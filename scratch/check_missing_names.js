const fs = require('fs');

function parseSqlDump(filePath) {
    const lines = fs.readFileSync(filePath, 'utf16le').split('\n');
    let inPendaftar = false;
    const pendaftars = [];

    const colId = 0;
    const colNama = 5;
    const colJk = 6;
    const colAlamat = 10;

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
            if (parts.length > 26) {
                pendaftars.push({
                    nama_lengkap: parts[colNama] === '\\N' ? '' : parts[colNama],
                    jenis_kelamin: parts[colJk] === '\\N' ? '' : parts[colJk],
                    alamat: parts[colAlamat] === '\\N' ? '' : parts[colAlamat],
                });
            }
        }
    }
    return pendaftars;
}

const pendaftars = parseSqlDump("c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/scratch/production_dump.sql");
const queries = ['haidar', 'yahya', 'favian', 'ken alfarezha', 'ken '];

console.log("Searching for missing students:");
for (let p of pendaftars) {
    const nameLower = p.nama_lengkap.toLowerCase();
    for (let q of queries) {
        if (nameLower.includes(q)) {
            console.log(`Found: ${p.nama_lengkap} | JK: ${p.jenis_kelamin} | Alamat: ${p.alamat}`);
            break;
        }
    }
}
console.log("\nAll names in DB:");
console.log(pendaftars.map(p => p.nama_lengkap).join(", "));
