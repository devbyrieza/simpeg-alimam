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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    const surat = await prisma.suratKeluar.findUnique({
      where: { id: resolvedParams.id },
      include: { pembuat: { select: { full_name: true } } },
    });

    if (!surat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: surat });
  } catch (error) {
    console.error("GET /api/surat/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { status, file_path, file_name, judul, perihal, isi_singkat, penerima } = body;

    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingSurat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

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
      where: { id: resolvedParams.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: surat });
  } catch (error) {
    console.error("PATCH /api/surat/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    const existingSurat = await prisma.suratKeluar.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingSurat) {
      return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
    }

    if (existingSurat.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Surat yang sudah di-publish tidak dapat dihapus." }, 
        { status: 400 }
      );
    }

    await prisma.suratKeluar.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true, message: "Surat berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/surat/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
