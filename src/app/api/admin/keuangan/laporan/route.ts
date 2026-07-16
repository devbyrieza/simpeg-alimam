import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    
    let targetDate = new Date();
    if (dateStr) {
      targetDate = new Date(dateStr);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all transactions for the day
    const transactions = await prisma.transaksiDompet.findMany({
      where: {
        jenis_transaksi: 'JAJAN_KANTIN',
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        dompet: {
          include: {
            pendaftar: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const totalNominal = transactions.reduce((sum, tx) => sum + Number(tx.nominal), 0);

    // Map to a simpler structure for the frontend
    const riwayat = transactions.map(tx => ({
      id: tx.id,
      waktu: new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      santri: tx.dompet.pendaftar.nama_lengkap,
      keterangan: tx.keterangan || 'Jajan Kantin',
      nominal: Number(tx.nominal)
    }));

    return NextResponse.json({
      success: true,
      data: {
        ringkasan: {
          totalTransaksi: transactions.length,
          totalNominal: totalNominal,
          pemasukanSPP: 0, // Should be calculated from tagihan table in real implementation
        },
        riwayat
      }
    });

  } catch (error: any) {
    console.error("Laporan API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
