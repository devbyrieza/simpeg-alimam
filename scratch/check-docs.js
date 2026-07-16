require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Rieza Tes' } },
    include: { dokumen: true }
  });
  
  if (!pendaftar) {
    console.log('Pendaftar not found');
    return;
  }
  
  console.log(`Pendaftar: ${pendaftar.nama_lengkap} (ID: ${pendaftar.id})`);
  console.log(`Status: ${pendaftar.status_pendaftaran}`);
  console.log(`Dokumen (${pendaftar.dokumen.length}):`);
  pendaftar.dokumen.forEach(d => {
    console.log(`- ${d.jenis_dokumen}: is_verified=${d.is_verified}, catatan=${d.catatan ? `'${d.catatan}'` : 'null'}`);
  });
  
  const REQUIRED_DOC_TYPES = [
    'kartu_keluarga',
    'akta_kelahiran',
    'rapor_sem1',
    'rapor_sem2',
    'nisn',
    'foto_setengah_badan',
    'surat_kesehatan',
    'pakta_integritas',
    'pernyataan_bebas_negatif'
  ];
  
  const verifiedTypes = new Set(pendaftar.dokumen.filter(d => d.is_verified).map(d => d.jenis_dokumen));
  const missing = REQUIRED_DOC_TYPES.filter(t => !verifiedTypes.has(t));
  
  console.log('\nMissing requirement check:');
  console.log(missing);
  
  // also check whatsapp logs
  const logs = await prisma.whatsappLog.findMany({
    where: { pendaftar_id: pendaftar.id },
    orderBy: { created_at: 'desc' },
    take: 5
  });
  
  console.log('\nRecent WhatsApp Logs:');
  logs.forEach(l => {
    console.log(`- [${l.created_at.toISOString()}] ${l.jenis_notif}: ${l.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
