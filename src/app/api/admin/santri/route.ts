import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Di aplikasi nyata, tambahkan proteksi autentikasi Admin di sini
    // Untuk keperluan demo/MVP ini, kita bypass dulu
    
    const pendaftarDiterima = await prisma.pendaftar.findMany({
      where: {
        status_pendaftaran: "accepted"
      },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true },
      orderBy: {
        nama_lengkap: "asc"
      }
    });

    return NextResponse.json({ success: true, data: pendaftarDiterima });
  } catch (error: any) {
    console.error("Error fetching santri:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data" }, { status: 500 });
  }
}
