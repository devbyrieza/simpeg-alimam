const fs = require('fs');
const path = require('path');

const sqlFilePath = '../alandalus-ululalbaab/full_20260328.sql';

const targetNames = [
  "Labibullah El Fatih",
  "Fariq Malaibui",
  "Muhammad Rizky",
  "Muh Asrorin Da Silva",
  "Azka Panji Kusuma",
  "M Fazril Alkais",
  "Haidar Ayyubi",
  "Atqanul Ummah Ahmad",
  "Muhammad Hafidz Reo Afelano",
  "Muhammad Rasyid Ridho",
  "Naufal Dzakiy Purnama"
];

async function main() {
  if (!fs.existsSync(sqlFilePath)) {
    console.log(`File not found: ${sqlFilePath}`);
    return;
  }

  console.log(`Reading SQL file: ${sqlFilePath}...`);
  const content = fs.readFileSync(sqlFilePath, 'utf8');
  const lines = content.split('\n');

  console.log(`Total lines: ${lines.length}. Searching...`);

  targetNames.forEach(name => {
    console.log(`Searching for: ${name}...`);
    const parts = name.split(' ');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(parts[0].toLowerCase())) {
        // loose match first, check details
        const matchesAll = parts.every(part => line.toLowerCase().includes(part.toLowerCase()));
        if (matchesAll) {
          console.log(`  [Match] Line ${index + 1}: ${line.substring(0, 300)}...`);
        }
      }
    });
  });
}

main();
