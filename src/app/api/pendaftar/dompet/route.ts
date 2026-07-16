import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json({ success: false, error: "Akses tidak diizinkan" }, { status: 403 });
    }

    const dompet = await prisma.dompetSantri.findUnique({
      where: { pendaftar_id: session.id },
    });

    if (!dompet) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Dompet belum dibuat",
      });
    }

    const transaksi = await prisma.transaksiDompet.findMany({
      where: { dompet_id: dompet.id },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        dompet,
        transaksi,
      },
    });
  } catch (error: any) {
    console.error("Error GET /api/pendaftar/dompet:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
