import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const c = cookieStore.get("app_session");
  if (!c) return null;
  try { return JSON.parse(c.value); } catch { return null; }
}

const ALLOWED_ROLES = ["admin_tu", "admin_super", "admin"];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const tahunAjaranId = sp.get("tahun_ajaran_id");
    
    // Get active tahun ajaran if not provided
    let targetTahunAjaranId = tahunAjaranId;
    if (!targetTahunAjaranId) {
      const activeTa = await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
        select: { id: true }
      });
      targetTahunAjaranId = activeTa?.id || undefined;
    }

    if (!targetTahunAjaranId) {
       return NextResponse.json({ data: [] });
    }

    const kalender = await prisma.kalenderAkademik.findMany({
      where: { tahun_ajaran_id: targetTahunAjaranId },
      orderBy: { tanggal_mulai: "asc" }
    });

    return NextResponse.json({ data: kalender });
  } catch (error) {
    console.error("GET /api/kalender:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama_kegiatan, tanggal_mulai, tanggal_selesai, kategori, deskripsi, is_libur, warna_label, tahun_ajaran_id } = body;

    if (!nama_kegiatan || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json({ error: "Field nama kegiatan dan tanggal wajib diisi" }, { status: 400 });
    }

    let targetTaId = tahun_ajaran_id;
    if (!targetTaId) {
      const activeTa = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
      if (!activeTa) return NextResponse.json({ error: "Tidak ada Tahun Ajaran aktif" }, { status: 400 });
      targetTaId = activeTa.id;
    }

    const agenda = await prisma.kalenderAkademik.create({
      data: {
        nama_kegiatan,
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_selesai: new Date(tanggal_selesai),
        kategori: kategori || "AKADEMIK",
        deskripsi: deskripsi || null,
        is_libur: is_libur || false,
        warna_label: warna_label || "blue",
        tahun_ajaran_id: targetTaId
      }
    });

    return NextResponse.json({ success: true, data: agenda }, { status: 201 });
  } catch (error) {
    console.error("POST /api/kalender:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
