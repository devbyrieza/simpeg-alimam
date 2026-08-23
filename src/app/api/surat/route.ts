import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const BULAN_ROMAWI: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
  7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII" };

function getTahunAjaran(date: Date): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 7) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try { return JSON.parse(sessionCookie.value); } catch { return null; }
}

const ALLOWED_ROLES = ["admin_tu", "admin_super", "admin"];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(50, parseInt(sp.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (sp.get("jenis")) where.jenis_surat = sp.get("jenis");
    if (sp.get("divisi")) where.kode_divisi = sp.get("divisi");
    if (sp.get("tahun_ajaran")) where.tahun_ajaran = sp.get("tahun_ajaran");
    if (sp.get("status")) where.status = sp.get("status");
    if (sp.get("q")) {
      where.OR = [
        { nomor_surat: { contains: sp.get("q")!, mode: "insensitive" } },
        { judul: { contains: sp.get("q")!, mode: "insensitive" } },
        { perihal: { contains: sp.get("q")!, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.suratKeluar.count({ where }),
      prisma.suratKeluar.findMany({
        where,
        orderBy: [{ tahun_ajaran: "desc" }, { nomor_urut: "desc" }],
        skip,
        take: limit,
        select: {
          id: true, nomor_urut: true, nomor_surat: true,
          jenis_surat: true, kode_divisi: true, judul: true, perihal: true,
          tanggal_surat: true, tahun_ajaran: true, status: true,
          file_path: true, file_name: true, penerima: true,
          published_at: true, created_at: true,
          pembuat: { select: { full_name: true } } } }),
    ]);

    return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("GET /api/surat:", error);
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
    const { jenis_surat, kode_divisi, judul, perihal, isi_singkat, tanggal_surat, penerima, status } = body;

    if (!jenis_surat || !kode_divisi || !judul || !perihal || !tanggal_surat) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const tgl = new Date(tanggal_surat);
    const tahunAjaran = getTahunAjaran(tgl);
    const bulanRomawi = BULAN_ROMAWI[tgl.getMonth() + 1];

    const last = await prisma.suratKeluar.findFirst({
      where: { tahun_ajaran: tahunAjaran },
      orderBy: { nomor_urut: "desc" },
      select: { nomor_urut: true } });

    const nomorUrut = (last?.nomor_urut ?? 0) + 1;
    const nomorSurat = `${String(nomorUrut).padStart(3, "0")}/${jenis_surat}/${kode_divisi}/PP-AI/${bulanRomawi}/${tgl.getFullYear()}`;

    const surat = await prisma.suratKeluar.create({
      data: {
        nomor_urut: nomorUrut, nomor_surat: nomorSurat,
        jenis_surat, kode_divisi, judul, perihal,
        isi_singkat: isi_singkat || null, tanggal_surat: tgl,
        bulan_romawi: bulanRomawi, tahun: tgl.getFullYear(), tahun_ajaran: tahunAjaran,
        status: status || "DRAFT", penerima: penerima || null,
        dibuat_oleh: session.id || null,
        published_at: status === "PUBLISHED" ? new Date() : null } });

    return NextResponse.json({ success: true, data: surat }, { status: 201 });
  } catch (error) {
    console.error("POST /api/surat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
