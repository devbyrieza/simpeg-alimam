import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const targetNames = ['Abdil Aziz', 'Muhammad Maulana Rizki', 'Ust. Presentasi (Resmi), Lc.', 'Ust. Presensi (Resmi), Lc.', 'Ramdan'];
  const results = [];

  try {
    const simpegPegawai = await prisma.pegawai.findMany({
      where: {
        OR: targetNames.map(name => ({ nama_lengkap: { contains: name, mode: 'insensitive' } }))
      }
    });

    for (const p of simpegPegawai) {
      await prisma.pegawai.delete({ where: { id: p.id } });
      results.push('Dihapus Permanen dari SIMPEG: ' + p.nama_lengkap);

      if (p.user_id) {
        await prisma.user.delete({ where: { id: p.user_id } }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, results: results.length ? results : ['Tidak ada yang ditemukan (mungkin sudah terhapus).'] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
