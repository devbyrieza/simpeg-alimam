import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── GET: Detail Surat Keluar ─────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surat = await prisma.suratKeluar.findUnique({
      where: { id: params.id },
      include: { pembuat: { select: { full_name: true } } } });

    if (!surat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: surat });
  } catch (error) {
    console.error("GET /api/admin/surat-keluar/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH: Edit Surat Keluar ─────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, file_path, file_name, judul, perihal, isi_singkat, penerima } = body;

    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id: params.id } });

    if (!existingSurat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

    // Hanya bisa update jika masih DRAFT, atau update file & penerima jika PUBLISHED.
    // Publish action akan mengubah status dan set published_at
    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && existingSurat.status === "DRAFT") {
        updateData.published_at = new Date();
      }
    }
    
    if (file_path !== undefined) updateData.file_path = file_path;
    if (file_name !== undefined) updateData.file_name = file_name;
    if (judul !== undefined) updateData.judul = judul;
    if (perihal !== undefined) updateData.perihal = perihal;
    if (isi_singkat !== undefined) updateData.isi_singkat = isi_singkat;
    if (penerima !== undefined) updateData.penerima = penerima;

    const surat = await prisma.suratKeluar.update({
      where: { id: params.id },
      data: updateData });

    return NextResponse.json({ success: true, data: surat });
  } catch (error) {
    console.error("PATCH /api/admin/surat-keluar/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Hapus Surat Keluar ───────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id: params.id } });

    if (!existingSurat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

    if (existingSurat.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Surat yang sudah di-publish tidak dapat dihapus, harap dibatalkan/revisi terlebih dahulu (belum diimplementasi)" }, 
        { status: 400 }
      );
    }

    await prisma.suratKeluar.delete({
      where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Surat berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/surat-keluar/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
