const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const names = [
    "Azka Panji Kusuma",
    "M Fazril Alkais",
    "Muh Asrorin Da Silva",
    "Muhammad Rizky",
    "Fariq Malaibui",
    "Labibullah El Fatih",
    "Muhammad Rasyid Ridho"
  ];

  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: { in: names, mode: 'insensitive' }
    },
    include: {
      pembayaran: true
    }
  });

  let csv = "Nama Lengkap,Status,Jenis Beasiswa,Total Tagihan Normal,Potongan Uang Pangkal,Total Tagihan Setelah Diskon\n";
  for (const p of pendaftars) {
    let jenis = "Beasiswa Full";
    let potongan = 7500000;
    let totalTagihan = 9800000 - potongan;
    if (p.nama_lengkap.toLowerCase().includes("rasyid ridho")) {
      jenis = "Keringanan 20%";
      potongan = 1500000; // 20% * 7.5m
      totalTagihan = 9800000 - potongan;
    }
    csv += `${p.nama_lengkap},${p.status_proses},${jenis},9800000,${potongan},${totalTagihan}\n`;
  }
  
  fs.writeFileSync('Data_Beasiswa_dan_Keringanan.csv', csv);
  console.log('Exported ' + pendaftars.length + ' records');
}

main().catch(console.error).finally(() => prisma.$disconnect());
