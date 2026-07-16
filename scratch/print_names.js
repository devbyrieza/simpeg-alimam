const fs = require('fs');

function parseSqlDump(filePath) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let inPendaftar = false;
    const pendaftars = [];

    const colNama = 5;

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
            pendaftars.push({
                nama_lengkap: parts[colNama] === '\\N' ? '' : parts[colNama]
            });
        }
    }
    return pendaftars;
}

const pendaftars = parseSqlDump("c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/migration/backup/supabase_full.sql");
console.log(pendaftars.map(p => p.nama_lengkap));
