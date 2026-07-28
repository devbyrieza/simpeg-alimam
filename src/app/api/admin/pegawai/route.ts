import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const data = await prisma.pegawai.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, kategori_pegawai, jabatan, unit_kerja, divisi, mata_pelajaran } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID Pegawai wajib diisi." }, { status: 400 });
    }

    const updated = await prisma.pegawai.update({
      where: { id },
      data: {
        kategori_pegawai,
        jabatan,
        unit_kerja,
        divisi,
        mata_pelajaran: kategori_pegawai.includes("GURU") ? mata_pelajaran : null
      }
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating pegawai:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat mengupdate data." }, { status: 500 });
  }
}

