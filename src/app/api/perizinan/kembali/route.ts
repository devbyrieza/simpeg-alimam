import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_code_string } = body;

    if (!qr_code_string) {
      return NextResponse.json({ error: "QR Code diperlukan" }, { status: 400 });
    }

    // 1. Cari dompet/kartu
    const dompet = await prisma.dompetSantri.findUnique({
      where: { qr_code_string },
      include: { pendaftar: true } });

    if (!dompet) {
      return NextResponse.json({ error: "Kartu tidak terdaftar" }, { status: 404 });
    }

    // 2. Cari izin aktif
    const existingIzin = await prisma.perizinanSantri.findFirst({
      where: {
        pendaftar_id: dompet.pendaftar_id,
        status: "DI_LUAR"
      },
      orderBy: {
        waktu_keluar: 'desc'
      }
    });

    if (!existingIzin) {
      return NextResponse.json({ error: "Tidak ada data izin keluar yang aktif untuk santri ini" }, { status: 400 });
    }

    // 3. Tentukan status (Tepat Waktu atau Terlambat)
    let statusKembali = "SUDAH_KEMBALI";
    const waktuSekarang = new Date();
    
    if (existingIzin.batas_kembali && waktuSekarang > existingIzin.batas_kembali) {
      statusKembali = "TERLAMBAT";
    }

    // 4. Update status izin
    const izinDiupdate = await prisma.perizinanSantri.update({
      where: { id: existingIzin.id },
      data: {
        waktu_kembali: waktuSekarang,
        status: statusKembali
      }
    });

    return NextResponse.json({
      success: true,
      message: `Santri tercatat kembali. Status: ${statusKembali.replace("_", " ")}`,
      data: {
        nama: dompet.pendaftar.nama_lengkap,
        waktu_kembali: izinDiupdate.waktu_kembali,
        keterlambatan: statusKembali === "TERLAMBAT"
      } });

  } catch (error: any) {
    console.error("Izin Kembali Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
