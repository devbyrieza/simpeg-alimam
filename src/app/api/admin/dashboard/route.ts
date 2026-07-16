import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Total Saldo ZAD Keseluruhan
    const totalSaldoZAD = await prisma.dompetSantri.aggregate({
      _sum: { saldo: true }
    });

    // 2. Jajan Kantin (ZAD) Hari Ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const transaksiHariIni = await prisma.transaksiDompet.aggregate({
      where: {
        jenis_transaksi: 'JAJAN_KANTIN',
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      _sum: { nominal: true }
    });

    // 3. Santri Aktif (Diterima)
    const santriAktif = await prisma.pendaftar.count({
      where: { status_pendaftaran: 'diterima' }
    });

    // 4. Pemasukan SPP & Tagihan Bulan Ini (Untuk Demo)
    // Asumsi: Semua transaksi berjenis 'PEMBAYARAN_TAGIHAN' bulan ini
    const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
    
    // 5. Tren 7 Hari Terakhir (Jajan Kantin)
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const jajan = await prisma.transaksiDompet.aggregate({
        where: {
          jenis_transaksi: 'JAJAN_KANTIN',
          created_at: { gte: start, lte: end }
        },
        _sum: { nominal: true }
      });
      
      const hari = d.toLocaleDateString('id-ID', { weekday: 'short' });
      revenueData.push({
        name: hari,
        jajan: Number(jajan._sum.nominal || 0),
        // Dummy SPP for visual purposes since we don't have a robust SPP payment history yet
        spp: Math.floor(Math.random() * 5000000) + 1000000
      });
    }

    // 6. Status SPP (Dummy distribution for now, real implementation requires Tagihan model query)
    const sppStatusData = [
      { name: 'Lunas', value: Math.floor(santriAktif * 0.8), color: '#10b981' },
      { name: 'Mencicil', value: Math.floor(santriAktif * 0.1), color: '#f59e0b' },
      { name: 'Belum Bayar', value: santriAktif - Math.floor(santriAktif * 0.9), color: '#ef4444' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalSaldoZAD: Number(totalSaldoZAD._sum.saldo || 0),
          jajanHariIni: Number(transaksiHariIni._sum.nominal || 0),
          pemasukanSPP: 15500000, // Dummy
          santriAktif: santriAktif
        },
        charts: {
          revenueData,
          sppStatusData
        }
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
