import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";
import { enqueueWhatsapp, buildMessageRegistrationSuccess } from "@/lib/whatsapp-queue";
import { normalizePhoneNumber, formatNamaLengkap } from "@/lib/validations/registration";
import crypto from "crypto";

/**
 * ─── REGISTER API: VERIFY OTP ───
 * Langkah terakhir pendaftaran: Memvalidasi kode OTP 
 * dan membuat akun santri secara resmi di database.
 */

const hashOTP = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const { no_hp, otp_code } = await request.json();
    const hashedOTP = hashOTP(otp_code);
    const normalizedPhone = normalizePhoneNumber(no_hp);

    // 1. Validasi Kode OTP & Masa Berlaku
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: { gt: new Date() },
      },
    });

    if (!otpRecord) return NextResponse.json({ success: false, error: "Kode OTP salah atau sudah kadaluarsa" }, { status: 400 });

    const regData = (otpRecord.registration_data as any) || {};

    // 2. Ambil Tahun Ajaran Aktif (Fallback Logic)
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } }) 
                  || await prisma.tahunAjaran.findFirst({ orderBy: { created_at: "desc" } });

    if (!activeTA) return NextResponse.json({ success: false, error: "Sistem belum siap: Tahun Ajaran tidak ditemukan" }, { status: 500 });

    const parseSafeDate = (val: any) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const parseSafeInt = (val: any) => {
      if (val === undefined || val === null || val === "") return undefined;
      const parsed = parseInt(val.toString());
      return isNaN(parsed) ? undefined : parsed;
    };

    // 2.5 Cek duplikat NIK sebelum membuat akun (abaikan yang sudah dihapus/soft-delete)
    const existingPendaftar = await prisma.pendaftar.findFirst({
      where: { 
        nik: regData.nik,
        deleted_at: null 
      },
    });
    if (existingPendaftar) {
      // Hapus OTP agar tidak bisa coba lagi dengan data yang sama
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return NextResponse.json({ 
        success: false, 
        error: "NIK ini sudah terdaftar. Gunakan NIK lain atau hubungi panitia jika ini adalah kesalahan." 
      }, { status: 409 });
    }

    // 3. Generate Nomor Pendaftaran Unik
    const nomorPendaftaran = await generateNomorPendaftaran(regData.jenjang, regData.jenis_kelamin);

    // 4. PEMBUATAN AKUN (Profile & Pendaftar)
    const profileId = crypto.randomUUID();
    const pendaftarId = crypto.randomUUID();
    
    // Gunakan Transaction agar jika salah satu gagal, semua dibatalkan (Data Integrity)
    await prisma.$transaction([
      // A. Buat Profile untuk Login
      prisma.profile.create({
        data: { id: profileId, full_name: formatNamaLengkap(regData.nama_lengkap), phone: no_hp, role: "pendaftar" },
      }),
      // B. Buat Data Pendaftaran Santri
      prisma.pendaftar.create({
        data: {
          id: pendaftarId,
          nik: regData.nik,
          nama_lengkap: formatNamaLengkap(regData.nama_lengkap),
          tempat_lahir: regData.tempat_lahir || undefined,
          tanggal_lahir: parseSafeDate(regData.tanggal_lahir),
          jenis_kelamin: regData.jenis_kelamin,
          jenjang: regData.jenjang,
          no_hp: no_hp,
          email: regData.email || "",
          status_pendaftaran: "draft",
          user_id: profileId,
          tahun_ajaran_id: activeTA.id,
          nomor_pendaftaran: nomorPendaftaran,
          tipe_pendaftaran: regData.tipe_pendaftaran || "BARU",
          kelas_masuk: parseSafeInt(regData.kelas_masuk),
          asal_institusi: regData.asal_institusi || undefined,
          nomor_induk_lama: regData.nomor_induk_lama || undefined,
          catatan_pindahan: regData.catatan_pindahan || undefined,
        },
      }),
      // C. Hapus OTP agar tidak bisa digunakan lagi
      prisma.otpVerification.delete({ where: { id: otpRecord.id } }),
    ]);

    // 5. Kirim Notifikasi Sukses via WhatsApp Queue
    await enqueueWhatsapp({
      pendaftarId: pendaftarId,
      phone: no_hp,
      jenisNotif: "registration_success",
      messageContent: buildMessageRegistrationSuccess(regData.nama_lengkap, nomorPendaftaran, regData.jenjang),
    }).catch(e => console.error("WA Queue Error:", e.message));

    return NextResponse.json({
      success: true,
      message: "Pendaftaran Berhasil!",
      data: {
        nomor_pendaftaran: nomorPendaftaran,
        nama_lengkap: regData.nama_lengkap,
        nik: regData.nik,
        jenjang: regData.jenjang,
      }
    });

  } catch (error: any) {
    console.error("❌ VERIFY_OTP_ERROR:", error.message);
    return NextResponse.json({ success: false, error: "Gagal memverifikasi pendaftaran" }, { status: 500 });
  }
}
