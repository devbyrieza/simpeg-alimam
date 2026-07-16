import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_code_string, nominal, kasir_id, keterangan } = body;

    if (!qr_code_string || !nominal || nominal <= 0 || !kasir_id) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
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

    if (Number(dompet.saldo) < Number(nominal)) {
      return NextResponse.json({ 
        error: "Saldo tidak mencukupi", 
        saldo_saat_ini: dompet.saldo 
      }, { status: 400 });
    }

    // 2. Lakukan transaksi pemotongan saldo dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      // Potong saldo
      const updatedDompet = await tx.dompetSantri.update({
        where: { id: dompet.id },
        data: {
          saldo: {
            decrement: nominal,
          },
        },
      });

      // Catat transaksi
      const transaksi = await tx.transaksiDompet.create({
        data: {
          dompet_id: dompet.id,
          jenis_transaksi: "JAJAN_KOPERASI",
          nominal: nominal,
          saldo_akhir: updatedDompet.saldo,
          keterangan: keterangan || "Belanja Koperasi",
          kasir_id: kasir_id,
        },
      });

      return { updatedDompet, transaksi };
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil",
      data: {
        nama: dompet.pendaftar.nama_lengkap,
        nominal_belanja: nominal,
        sisa_saldo: result.updatedDompet.saldo,
      },
    });

  } catch (error: any) {
    console.error("Jajan Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
