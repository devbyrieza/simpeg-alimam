const fs = require('fs');

const file = "c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam/migration/backup/supabase_full.sql";
const lines = fs.readFileSync(file, 'utf8').split('\n');

let inPendaftar = false;
const pendaftarLines = [];

for (let line of lines) {
    if (line.startsWith('COPY public.pendaftar ')) {
        inPendaftar = true;
        continue;
    }
    if (inPendaftar) {
        if (line.startsWith('\\.')) {
            inPendaftar = false;
            break;
        }
        pendaftarLines.push(line);
    }
}

console.log(`Found ${pendaftarLines.length} pendaftar records in backup.`);
if (pendaftarLines.length > 0) {
    console.log(pendaftarLines[0].split('\t').slice(0, 10).join(' | '));
}
