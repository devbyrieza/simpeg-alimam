"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Calendar as CalendarIcon, AlignLeft, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";

type FormValues = {
  nama_kegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kategori: string;
  is_libur: boolean;
  deskripsi: string;
};

const KATEGORI_OPTIONS = [
  { value: "AKADEMIK", label: "Akademik (PTS, PAS, KBM)" },
  { value: "LIBUR", label: "Libur (Idul Adha, Semester)" },
  { value: "PSB", label: "Penerimaan Santri Baru" },
  { value: "ASRAMA", label: "Asrama & Kesantrian" },
  { value: "KEUANGAN", label: "Keuangan (Batas Pembayaran)" },
  { value: "LAINNYA", label: "Lainnya (Raker, Seminar)" },
];

export default function TambahAgendaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      nama_kegiatan: "",
      tanggal_mulai: new Date().toISOString().split("T")[0],
      tanggal_selesai: new Date().toISOString().split("T")[0],
      kategori: "AKADEMIK",
      is_libur: false,
      deskripsi: "",
    },
  });

  const tanggalMulai = watch("tanggal_mulai");

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      // Validasi tanggal
      if (new Date(data.tanggal_selesai) < new Date(data.tanggal_mulai)) {
        throw new Error("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      }

      // If category is LIBUR, force is_libur to true
      const isLibur = data.kategori === "LIBUR" || data.is_libur;
      const warnaLabel = isLibur ? "red" : "blue";

      const res = await fetch("/api/kalender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, is_libur: isLibur, warna_label: warnaLabel }),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) throw new Error(responseData.error || "Gagal menyimpan agenda");

      await Swal.fire({
        icon: "success",
        title: "Agenda Tersimpan!",
        text: `Agenda ${data.nama_kegiatan} berhasil ditambahkan ke kalender.`,
        confirmButtonColor: "#c9983a",
        timer: 2000,
      });

      router.push("/admin/kalender");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#c9983a",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/kalender"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tambah Agenda Baru</h1>
          <p className="text-slate-500 mt-1">Masukkan kegiatan ke dalam Kalender Akademik Pesantren.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Nama Kegiatan / Agenda
            </label>
            <input 
              type="text"
              placeholder="Cth: Penilaian Tengah Semester (PTS)"
              {...register("nama_kegiatan", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none font-bold text-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" /> Tanggal Mulai
              </label>
              <input 
                type="date"
                {...register("tanggal_mulai", { required: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" /> Tanggal Selesai
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="date"
                  {...register("tanggal_selesai", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setValue("tanggal_selesai", tanggalMulai)}
                  className="px-3 py-3 whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors border border-slate-200"
                  title="Samakan dengan tanggal mulai"
                >
                  1 Hari Saja
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" /> Kategori Kegiatan
              </label>
              <select 
                {...register("kategori")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-slate-50"
              >
                {KATEGORI_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 flex flex-col justify-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  {...register("is_libur")}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-800 text-sm">Tandai sebagai Hari Libur</div>
                  <div className="text-xs text-slate-500 mt-0.5">Akan ditandai warna merah di kalender</div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Catatan Tambahan (Opsional)
            </label>
            <textarea 
              rows={3}
              placeholder="Tambahkan detail, tempat, atau keterangan tambahan..."
              {...register("deskripsi")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none resize-none"
            />
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-4 pt-2">
            <Link 
              href="/admin/kalender"
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-white bg-gold-600 hover:bg-gold-700 shadow-lg shadow-gold-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Agenda
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
