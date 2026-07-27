import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Mulai update database...');

    // 1. Muhammad Iqbal
    await prisma.profile.updateMany({
      where: { nama_lengkap: { contains: 'Muhammad Iqbal' } },
      data: {
        nama_lengkap: 'Muhammad Iqbal, S.Pd.',
        jabatan: ''
      }
    });

    // 2. Maulidin Bachtiar
    await prisma.profile.updateMany({
      where: { nama_lengkap: { contains: 'Maulidin Bachtiar' } },
      data: {
        jabatan: 'Bendahara dan Kasi Keuangan'
      }
    });

    // 3. Abdil Aziz
    await prisma.profile.updateMany({
      where: { nama_lengkap: { contains: 'Abdil Aziz' } },
      data: {
        nama_lengkap: 'Abdil Aziz, S.Pd., B.A.',
        jabatan: 'Kasi Kurikulum'
      }
    });

    // 4. Wahyudi Pranata
    await prisma.profile.updateMany({
      where: { nama_lengkap: { contains: 'Wahyudi Pranata' } },
      data: {
        nama_lengkap: 'Wahyudi Pranata, Lc'
      }
    });

    return NextResponse.json({ success: true, message: "Database berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
