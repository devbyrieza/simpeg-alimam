import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { pendaftar_id, nominal, keterangan } = await req.json();

    if (!pendaftar_id || !nominal || nominal <= 0) {
      return NextResponse.json({ success: false, message: "Data tidak valid" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Pastikan santri memiliki dompet
      let dompet = await tx.dompetSantri.findUnique({
        where: { pendaftar_id: pendaftar_id }
      });

      if (!dompet) {
        // Jika belum punya dompet, buatkan (misal karena santri baru)
        const pendaftar = await tx.pendaftar.findUnique({ where: { id: pendaftar_id }});
        if (!pendaftar) throw new Error("Santri tidak ditemukan");
        
        dompet = await tx.dompetSantri.create({
          data: {
            pendaftar_id: pendaftar.id,
            qr_code_string: pendaftar.nomor_pendaftaran,
            saldo: 0,
          }
        });
      }

      if (dompet.status !== 'AKTIF') {
        throw new Error("Kartu santri sedang diblokir");
      }

      const saldoAkhir = Number(dompet.saldo) + Number(nominal);

      if (saldoAkhir > Number(dompet.batas_maksimal_saldo)) {
        throw new Error(`Saldo melebihi batas maksimal (Rp ${Number(dompet.batas_maksimal_saldo).toLocaleString('id-ID')})`);
      }

      // Update saldo dompet
      const updatedDompet = await tx.dompetSantri.update({
        where: { id: dompet.id },
        data: { saldo: saldoAkhir }
      });

      // Catat riwayat transaksi top up
      const riwayat = await tx.transaksiDompet.create({
        data: {
          dompet_id: dompet.id,
          jenis_transaksi: 'TOPUP',
          nominal: Number(nominal),
          saldo_akhir: saldoAkhir,
          keterangan: keterangan || "Top Up via Admin",
        }
      });

      return { updatedDompet, riwayat };
    });

    return NextResponse.json({
      success: true,
      message: "Top Up berhasil",
      data: result
    });

  } catch (error: any) {
    console.error("Error top up:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan internal" }, { status: 400 });
  }
}
