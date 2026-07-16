const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.join(process.cwd(), 'full_20260328.sql');
  console.log('Reading file:', filePath);
  
  // Membaca file baris demi baris lebih aman untuk file besar
  const content = fs.readFileSync(filePath, 'utf8');
  
  function countRecords(tableName) {
    // Cari baris INSERT INTO untuk tabel tersebut (format MySQL: `nama_tabel`)
    const tableRegex = new RegExp(`INSERT INTO \`${tableName}\` VALUES ([\\s\\S]*?);`, 'g');
    let total = 0;
    let match;

    while ((match = tableRegex.exec(content)) !== null) {
      const valuesSection = match[1];
      // Hitung jumlah record dengan memisahkan berdasarkan ),(
      // MySQL dump biasanya memisahkan baris dengan ),(
      const records = valuesSection.split('),(');
      total += records.length;
    }
    return total;
  }

  console.log('\n--- DATA LEGACY (SQL DUMP) ---');
  const pCount = countRecords('pendaftars');
  const bCount = countRecords('berkas_pendaftars');
  const pyCount = countRecords('pembayarans');
  
  console.log('Pendaftars:', pCount);
  console.log('Berkas/Dokumen:', bCount);
  console.log('Pembayarans:', pyCount);
  
  // Data dari terminal SSH user
  const prodAlImam = { p: 18, b: 82, py: 15 };
  const prodUlulAlbaab = { p: 180, b: 1040, py: 181 };
  
  const totalProdP = prodAlImam.p + prodUlulAlbaab.p;
  const totalProdB = prodAlImam.b + prodUlulAlbaab.b;
  const totalProdPy = prodAlImam.py + prodUlulAlbaab.py;

  console.log('\n--- COMPARISON ---');
  console.log(`Pendaftars: ${pCount} (Legacy) vs ${totalProdP} (Total Production)`);
  console.log(`Berkas:    ${bCount} (Legacy) vs ${totalProdB} (Total Production)`);
  console.log(`Payments:  ${pyCount} (Legacy) vs ${totalProdPy} (Total Production)`);
  
  if (pCount === totalProdP && bCount === totalProdB && pyCount === totalProdPy) {
    console.log('\n✅ STATUS: DATA MATCH! 100% Pindah Sempurna.');
  } else {
    console.log('\n⚠️  STATUS: DISCREPANCY DETECTED!');
    if (totalProdP > pCount) console.log(`   - Ada ${totalProdP - pCount} pendaftar baru di production.`);
    if (totalProdP < pCount) console.log(`   - Ada ${pCount - totalProdP} pendaftar hilang!`);
  }
}

main().catch(console.error);
