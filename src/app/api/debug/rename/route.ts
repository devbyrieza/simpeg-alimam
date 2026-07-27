import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 1. Abdil Aziz
    const u1 = await prisma.pegawai.updateMany({
      where: { nama_lengkap: { contains: 'Abdil Aziz' } },
      data: { nama_lengkap: 'Abdil Aziz, S.Pd, B.A' }
    });

    // 2. Muhammad Iqbal
    const u2 = await prisma.pegawai.updateMany({
      where: { nama_lengkap: { contains: 'Muhammad Iqbal' } },
      data: { nama_lengkap: 'Muhammad Iqbal, S.Pd' }
    });

    // 3. Muhammad Thoriq Ibn Ziyad
    const u3 = await prisma.pegawai.updateMany({
      where: { nama_lengkap: { contains: 'Muhammad Thoriq Ibn Ziyad' } },
      data: { nama_lengkap: 'Muhammad Thoriq Ibn Ziyad, Lc, M.Ag' }
    });

    // 4. Arifin Saefulloh/Saefullah
    const u4 = await prisma.pegawai.updateMany({
      where: { nama_lengkap: { contains: 'Arifin Saefull' } },
      data: { nama_lengkap: 'Arifin Saefullah, A.Ma, Dpl, Lc, M.m, M.Pd' }
    });

    return NextResponse.json({
      success: true,
      message: 'Names updated successfully!',
      updates: {
        abdil_aziz: u1.count,
        muhammad_iqbal: u2.count,
        thoriq: u3.count,
        arifin: u4.count,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
