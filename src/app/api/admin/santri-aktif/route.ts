import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ambil daftar pendaftar yang sudah DITERIMA (atau semua draft untuk testing)
    // Dalam real scenario, hanya ambil yang status_pendaftaran = "diterima"
    const santriList = await prisma.pendaftar.findMany({
      orderBy: { nama_lengkap: 'asc' },
      include: {
        DompetSantri: true
      }
    });

    return NextResponse.json({
      success: true,
      data: santriList
    });

  } catch (error: any) {
    console.error("Error fetching santri aktif:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
