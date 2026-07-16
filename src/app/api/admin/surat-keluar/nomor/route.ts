import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BULAN_ROMAWI: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
  7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII",
};

function getTahunAjaran(date: Date): string {
  const month = date.getMonth() + 1; // 1-indexed
  const year = date.getFullYear();
  if (month >= 7) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

const ADMIN_ROLES = ["admin", "admin_super"];

// ─── GET: Preview Nomor Surat ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const jenis = sp.get("jenis") || "UND";
    const divisi = sp.get("divisi") || "TU";
    const tgl = sp.get("tanggal") ? new Date(sp.get("tanggal")!) : new Date();

    const tahunAjaran = getTahunAjaran(tgl);
    const bulanRomawi = BULAN_ROMAWI[tgl.getMonth() + 1];
    const tahun = tgl.getFullYear();

    const last = await prisma.suratKeluar.findFirst({
      where: { tahun_ajaran: tahunAjaran },
      orderBy: { nomor_urut: "desc" },
      select: { nomor_urut: true },
    });

    const nomorUrut = (last?.nomor_urut ?? 0) + 1;
    const nomorUrut3Digit = String(nomorUrut).padStart(3, "0");
    const nomorSurat = `${nomorUrut3Digit}/${jenis}/${divisi}/PP-AI/${bulanRomawi}/${tahun}`;

    return NextResponse.json({ data: { nomorUrut, nomorSurat } });
  } catch (error) {
    console.error("GET /api/admin/surat-keluar/nomor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
