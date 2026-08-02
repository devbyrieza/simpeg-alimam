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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nama_lengkap,
      nik,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      no_hp,
      email,
      alamat,
      kategori_pegawai,
      unit_kerja,
      divisi,
      jabatan,
      mata_pelajaran,
      pendidikan_terakhir,
      status_pernikahan,
      foto_url,
    } = body;

    if (!nama_lengkap || !nama_lengkap.trim()) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi." }, { status: 400 });
    }

    const newPegawai = await prisma.pegawai.create({
      data: {
        nama_lengkap: nama_lengkap.trim(),
        nik: nik?.trim() || null,
        jenis_kelamin: jenis_kelamin || null,
        tempat_lahir: tempat_lahir?.trim() || null,
        tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
        no_hp: no_hp?.trim() || null,
        email: email?.trim() || null,
        alamat: alamat?.trim() || null,
        kategori_pegawai: kategori_pegawai || "PEGAWAI_UMUM",
        unit_kerja: unit_kerja || null,
        divisi: divisi || null,
        jabatan: jabatan || null,
        mata_pelajaran: (kategori_pegawai || "").toUpperCase().includes("GURU") ? (mata_pelajaran?.trim() || null) : null,
        pendidikan_terakhir: pendidikan_terakhir || null,
        status_pernikahan: status_pernikahan || null,
        foto_url: foto_url || null,
      },
    });

    return NextResponse.json({ success: true, data: newPegawai }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating pegawai:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan saat menambahkan pegawai." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      nama_lengkap,
      nik,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      no_hp,
      email,
      alamat,
      kategori_pegawai,
      unit_kerja,
      divisi,
      jabatan,
      mata_pelajaran,
      pendidikan_terakhir,
      status_pernikahan,
      foto_url,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID Pegawai wajib diisi." }, { status: 400 });
    }

    const updateData: any = {
      kategori_pegawai: kategori_pegawai || "PEGAWAI_UMUM",
      jabatan: jabatan ?? null,
      unit_kerja: unit_kerja ?? null,
      divisi: divisi ?? null,
      mata_pelajaran: (kategori_pegawai || "").toUpperCase().includes("GURU") ? (mata_pelajaran ?? null) : null,
    };

    if (nama_lengkap !== undefined) updateData.nama_lengkap = nama_lengkap;
    if (nik !== undefined) updateData.nik = nik || null;
    if (jenis_kelamin !== undefined) updateData.jenis_kelamin = jenis_kelamin || null;
    if (tempat_lahir !== undefined) updateData.tempat_lahir = tempat_lahir || null;
    if (tanggal_lahir !== undefined) {
      if (tanggal_lahir) {
        updateData.tanggal_lahir = new Date(tanggal_lahir);
      } else {
        updateData.tanggal_lahir = null;
      }
    }
    if (no_hp !== undefined) updateData.no_hp = no_hp || null;
    if (email !== undefined) updateData.email = email || null;
    if (alamat !== undefined) updateData.alamat = alamat || null;
    if (pendidikan_terakhir !== undefined) updateData.pendidikan_terakhir = pendidikan_terakhir || null;
    if (status_pernikahan !== undefined) updateData.status_pernikahan = status_pernikahan || null;
    if (foto_url !== undefined) updateData.foto_url = foto_url || null;

    const updated = await prisma.pegawai.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating pegawai:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan saat mengupdate data." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID Pegawai wajib disertakan." }, { status: 400 });
    }

    await prisma.pegawai.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Data civitas berhasil dihapus." }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting pegawai:", error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan saat menghapus data." }, { status: 500 });
  }
}
