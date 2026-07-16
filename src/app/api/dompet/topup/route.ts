import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_code_string, nominal, kasir_id } = body;

    if (!qr_code_string || !nominal || !kasir_id) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Cari dompet berdasarkan QR Code
    const dompet = await prisma.dompetSantri.findUnique({
      where: { qr_code_string },
      include: { pendaftar: true },
    });

    if (!dompet) {
      return NextResponse.json({ error: "Kartu tidak terdaftar" }, { status: 404 });
    }

    if (dompet.status !== "AKTIF") {
      return NextResponse.json({ error: `Kartu berstatus: ${dompet.status}` }, { status: 400 });
    }

    // 2. Lakukan transaksi dalam transaction agar konsisten
    const result = await prisma.$transaction(async (tx) => {
      // Update saldo
      const updatedDompet = await tx.dompetSantri.update({
        where: { id: dompet.id },
        data: {
          saldo: {
            increment: nominal,
          },
        },
      });

      // Catat transaksi
      const transaksi = await tx.transaksiDompet.create({
        data: {
          dompet_id: dompet.id,
          jenis_transaksi: "TOPUP",
          nominal: nominal,
          saldo_akhir: updatedDompet.saldo,
          keterangan: "Top-up Saldo",
          kasir_id: kasir_id,
        },
      });

      return { updatedDompet, transaksi };
    });

    return NextResponse.json({
      success: true,
      message: "Top-up berhasil",
      data: {
        nama: dompet.pendaftar.nama_lengkap,
        saldo_baru: result.updatedDompet.saldo,
      },
    });

  } catch (error: any) {
    console.error("Topup Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
