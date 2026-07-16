// No dotenv needed, env vars are in container
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const NAME_TARGET = 'Lalu Muhamad Rizky Ananda';
  const REG_NUMBER = 'ILA2600006';

  console.log(`Starting recovery for: ${NAME_TARGET} (${REG_NUMBER})`);

  // 1. Find the target Pendaftar (the active one)
  const targetPendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: REG_NUMBER }
  });

  if (!targetPendaftar) {
    console.error(`Target pendaftar ${REG_NUMBER} not found!`);
    return;
  }

  // 2. Find ALL Pendaftars with similar name (including deleted ones)
  const allRelatedPendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: { contains: 'Rizky Ananda', mode: 'insensitive' }
    }
  });

  // 3. Find ALL Backups with similar name
  const allBackups = await prisma.pendaftarBackup.findMany({
    where: {
      nama_lengkap: { contains: 'Rizky Ananda', mode: 'insensitive' }
    }
  });

  console.log(`Found ${allRelatedPendaftars.length} related pendaftar records and ${allBackups.length} backups.`);

  const aggregatedData = {};
  const UNIVERSAL_FIELDS = [
    "nilai_tes_quran", "score_quran", "detail_quran", "catatan_quran", "input_at_quran", "input_by_quran",
    "nilai_wawancara_santri", "detail_wawancara", "catatan_santri", "input_at_santri", "input_by_santri",
    "nilai_wawancara_ortu", "detail_cawalsan", "catatan_ortu", "input_at_ortu", "input_by_ortu",
    "score_wawancara", "nilai_tes_tertulis", "nilai_tes_tertulis_total", "detail_akademik"
  ];

  const isEffectivelyEmpty = (v) => {
    if (v == null || v === "") return true;
    if (typeof v === 'object') {
      const keys = Object.keys(v);
      if (keys.length === 0) return true;
      return keys.every(k => v[k] == null || v[k] === "");
    }
    return false;
  };

  const mergeIntoAggregated = (record) => {
    Object.entries(record).forEach(([k, v]) => {
      if (UNIVERSAL_FIELDS.includes(k) && !isEffectivelyEmpty(v)) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          // Deep merge for JSON objects
          if (!aggregatedData[k]) aggregatedData[k] = {};
          Object.entries(v).forEach(([subK, subV]) => {
            if (subV != null && subV !== "" && (aggregatedData[k][subK] == null || aggregatedData[k][subK] === "")) {
              aggregatedData[k][subK] = subV;
            }
          });
        } else if (aggregatedData[k] == null || aggregatedData[k] === "") {
          aggregatedData[k] = v;
        }
      }
    });
  };

  // Process scores from active pendaftars
  for (const p of allRelatedPendaftars) {
    const nilais = await prisma.nilaiUjian.findMany({ where: { pendaftar_id: p.id } });
    nilais.forEach(mergeIntoAggregated);
  }

  // Process scores from backups
  allBackups.forEach(b => {
    if (b.backup_data && b.backup_data.nilai_ujian) {
      b.backup_data.nilai_ujian.forEach(mergeIntoAggregated);
    }
  });

  if (Object.keys(aggregatedData).length === 0) {
    console.log("No data found to recover.");
    return;
  }

  console.log("Aggregated Data for Recovery:", JSON.stringify(aggregatedData, null, 2));

  // 4. Update the active NilaiUjian record
  let targetNilai = await prisma.nilaiUjian.findFirst({
    where: { pendaftar_id: targetPendaftar.id },
    orderBy: { created_at: 'desc' }
  });

  if (!targetNilai) {
    console.log("Target NilaiUjian record not found, creating new one...");
    targetNilai = await prisma.nilaiUjian.create({
      data: {
        pendaftar_id: targetPendaftar.id,
        ...aggregatedData
      }
    });
  } else {
    console.log(`Updating existing NilaiUjian record: ${targetNilai.id}`);
    await prisma.nilaiUjian.update({
      where: { id: targetNilai.id },
      data: aggregatedData
    });
  }

  console.log("RECOVERY COMPLETED SUCCESSFULLY.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
