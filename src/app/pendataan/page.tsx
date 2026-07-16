"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, User, Briefcase, Building, FileText, Phone, Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";

// Schema validasi dengan Zod
const formSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama lengkap harus diisi"),
  nik: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  no_hp: z.string().min(10, "No WA/HP tidak valid"),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
  alamat: z.string().optional(),
  kategori_pegawai: z.string().default("PEGAWAI_UMUM"),
  unit_kerja: z.string().optional(),
  jabatan: z.string().optional(),
  pendidikan_terakhir: z.string().optional(),
  status_pernikahan: z.string().optional(),
});

export default function PendataanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori_pegawai: "PEGAWAI_UMUM",
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pendataan/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Data berhasil disimpan!");
        reset();
      } else {
        toast.error(result.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-lg w-full text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Alhamdulillah!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Data antum telah berhasil disimpan di database kepegawaian E-Office Al-Andalus.
            Jazakumullahu khairan atas partisipasinya.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Isi Data Lainnya
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Pendataan Asatidz & Pegawai</h1>
          <p className="text-slate-600 text-lg">Silakan isi formulir di bawah ini dengan lengkap dan benar.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100"
        >
          {/* Header Banners */}
          <div className="bg-primary-900 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-800 rounded-full opacity-50 blur-3xl" />
            <h2 className="text-2xl font-bold text-white relative z-10 tracking-tight">Formulir Data Diri</h2>
            <p className="text-white/80 mt-1.5 relative z-10 text-sm font-medium">Digunakan untuk database Absensi dan SIAKAD.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            
            {/* 1. Informasi Utama */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <User className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">Informasi Utama</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2 italic">Tuliskan beserta gelar akademik jika ada (contoh: Fulan, Lc., M.A.)</p>
                  <input
                    {...register("nama_lengkap")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.nama_lengkap && <p className="text-red-500 text-sm mt-1">{errors.nama_lengkap.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NIK (No. KTP)</label>
                  <input
                    {...register("nik")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                  <select
                    {...register("jenis_kelamin")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tempat Lahir</label>
                  <input
                    {...register("tempat_lahir")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="Kota kelahiran"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    {...register("tanggal_lahir")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>
            </section>

            {/* 2. Kontak & Alamat */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Phone className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">Kontak & Alamat</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    No WhatsApp/HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("no_hp")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="0812xxxxxx"
                  />
                  {errors.no_hp && <p className="text-red-500 text-sm mt-1">{errors.no_hp.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Opsional)</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="nama@email.com"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Domisili</label>
                  <textarea
                    {...register("alamat")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none resize-none"
                    placeholder="Alamat tempat tinggal saat ini"
                  />
                </div>
              </div>
            </section>

            {/* 3. Pekerjaan & Jabatan */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">Jabatan & Penempatan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Pegawai</label>
                  <select
                    {...register("kategori_pegawai")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="PEGAWAI_UMUM">Pegawai Umum / Staf</option>
                    <option value="ASATIDZ">Asatidz / Guru</option>
                    <option value="MUSYRIF">Musyrif / Pembina Asrama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Kerja</label>
                  <select
                    {...register("unit_kerja")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="">Pilih Unit Kerja</option>
                    <option value="SD">SDIT</option>
                    <option value="SMP">SMPIT</option>
                    <option value="SMA">SMAIT</option>
                    <option value="PONDOK_PUTRA">Pondok Putra</option>
                    <option value="PONDOK_PUTRI">Pondok Putri</option>
                    <option value="YAYASAN">Yayasan Pusat</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Posisi / Jabatan</label>
                  <input
                    {...register("jabatan")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="Contoh: Guru Matematika, Staf Keuangan, Wali Kelas, dll."
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-900/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Kirim Data
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
