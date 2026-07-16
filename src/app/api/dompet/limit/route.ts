import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
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

    const { limit } = await request.json();
    if (limit === undefined || typeof limit !== "number" || limit < 5000) {
      return NextResponse.json({ success: false, error: "Limit jajan minimal Rp 5.000" }, { status: 400 });
    }

    const dompet = await prisma.dompetSantri.findUnique({
      where: { pendaftar_id: session.id },
    });

    if (!dompet) {
      return NextResponse.json({ success: false, error: "Dompet Santri belum aktif" }, { status: 404 });
    }

    await prisma.dompetSantri.update({
      where: { id: dompet.id },
      data: { batas_jajan_harian: limit.toString() }
    });

    return NextResponse.json({
      success: true,
      message: "Limit jajan harian berhasil diperbarui",
      data: { batas_jajan_harian: limit }
    });
  } catch (error: any) {
    console.error("Error updating limit:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
