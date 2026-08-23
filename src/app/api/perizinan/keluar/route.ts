import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_code_string, pemberi_izin_id, jenis_izin, alasan, batas_kembali } = body;

    if (!qr_code_string || !pemberi_izin_id) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Cari dompet berdasarkan QR Code untuk mendapatkan pendaftar_id (sebagai identitas kartu)
    const dompet = await prisma.dompetSantri.findUnique({
      where: { qr_code_string },
      include: { pendaftar: true } });

    if (!dompet) {
      return NextResponse.json({ error: "Kartu tidak terdaftar" }, { status: 404 });
    }

    // 2. Cek apakah ada izin yang masih berstatus "DI_LUAR"
    const existingIzin = await prisma.perizinanSantri.findFirst({
      where: {
        pendaftar_id: dompet.pendaftar_id,
        status: "DI_LUAR"
      }
    });

    if (existingIzin) {
      return NextResponse.json({ error: "Santri masih memiliki izin aktif (belum kembali)" }, { status: 400 });
    }

    // 3. Catat izin keluar
    const izinBaru = await prisma.perizinanSantri.create({
      data: {
        pendaftar_id: dompet.pendaftar_id,
        jenis_izin: jenis_izin || "KELUAR_PONDOK",
        alasan: alasan || "Keperluan Pribadi",
        waktu_keluar: new Date(),
        batas_kembali: batas_kembali ? new Date(batas_kembali) : null,
        status: "DI_LUAR",
        pemberi_izin_id: pemberi_izin_id }
    });

    return NextResponse.json({
      success: true,
      message: "Izin keluar berhasil dicatat",
      data: {
        nama: dompet.pendaftar.nama_lengkap,
        waktu_keluar: izinBaru.waktu_keluar } });

  } catch (error: any) {
    console.error("Izin Keluar Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
