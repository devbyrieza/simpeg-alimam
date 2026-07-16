import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const pegawaiSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama lengkap harus diisi"),
  nik: z.string().optional().nullable(),
  jenis_kelamin: z.string().optional().nullable(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  no_hp: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")).nullable(),
  alamat: z.string().optional().nullable(),
  kategori_pegawai: z.string().default("PEGAWAI_UMUM"),
  unit_kerja: z.string().optional().nullable(),
  jabatan: z.string().optional().nullable(),
  mata_pelajaran: z.string().optional().nullable(),
  pendidikan_terakhir: z.string().optional().nullable(),
  status_pernikahan: z.string().optional().nullable(),
  foto_url: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = pegawaiSchema.parse(body);

    const newPegawai = await prisma.pegawai.create({
      data: {
        nama_lengkap: validatedData.nama_lengkap,
        nik: validatedData.nik || null,
        jenis_kelamin: validatedData.jenis_kelamin || null,
        tempat_lahir: validatedData.tempat_lahir || null,
        tanggal_lahir: validatedData.tanggal_lahir ? new Date(validatedData.tanggal_lahir) : null,
        no_hp: validatedData.no_hp || null,
        email: validatedData.email || null,
        alamat: validatedData.alamat || null,
        kategori_pegawai: validatedData.kategori_pegawai,
        unit_kerja: validatedData.unit_kerja || null,
        jabatan: validatedData.jabatan || null,
        mata_pelajaran: validatedData.mata_pelajaran || null,
        pendidikan_terakhir: validatedData.pendidikan_terakhir || null,
        status_pernikahan: validatedData.status_pernikahan || null,
        foto_url: validatedData.foto_url || null,
      },
    });

    return NextResponse.json({ success: true, data: newPegawai }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting pendataan:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    // Handle unique NIK error if needed
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "NIK atau No HP sudah terdaftar." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
