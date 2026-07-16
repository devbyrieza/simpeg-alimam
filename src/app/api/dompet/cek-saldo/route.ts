import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qr_code = searchParams.get("qr_code");

    if (!qr_code) {
      return NextResponse.json({ error: "QR Code diperlukan" }, { status: 400 });
    }

    const dompet = await prisma.dompetSantri.findUnique({
      where: { qr_code_string: qr_code },
      include: { 
        pendaftar: {
          select: {
            nama_lengkap: true,
            nomor_pendaftaran: true,
            kelas_masuk: true,
          }
        }
      },
    });

    if (!dompet) {
      return NextResponse.json({ error: "Kartu tidak terdaftar" }, { status: 404 });
    }

    if (dompet.status !== "AKTIF") {
      return NextResponse.json({ error: `Kartu berstatus: ${dompet.status}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        nama: dompet.pendaftar.nama_lengkap,
        nis: dompet.pendaftar.nomor_pendaftaran,
        kelas: dompet.pendaftar.kelas_masuk,
        saldo: dompet.saldo,
      },
    });

  } catch (error: any) {
    console.error("Cek Saldo Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
