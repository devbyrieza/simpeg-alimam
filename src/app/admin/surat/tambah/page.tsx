"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Building2, Calendar, FileText, Type, Users } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";

type FormValues = {
  jenis_surat: string;
  kode_divisi: string;
  judul: string;
  perihal: string;
  tanggal_surat: string;
  penerima: string;
  isi_singkat: string;
};

const JENIS_SURAT_OPTIONS = [
  { value: "UND", label: "Undangan (UND)" },
  { value: "PMB", label: "Pemberitahuan / Edaran (PMB)" },
  { value: "PENG", label: "Pengumuman (PENG)" },
  { value: "SK", label: "Surat Keputusan (SK)" },
  { value: "KET", label: "Surat Keterangan (KET)" },
  { value: "ST", label: "Surat Tugas (ST)" },
];

const DIVISI_OPTIONS = [
  { value: "TU", label: "Tata Usaha (TU)" },
  { value: "KS", label: "Kesantrian (KS)" },
  { value: "AK", label: "Akademik (AK)" },
  { value: "KU", label: "Keuangan (KU)" },
  { value: "PSB", label: "Panitia PSB (PSB)" },
];

export default function TambahSuratPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      jenis_surat: "UND",
      kode_divisi: "TU",
      judul: "",
      perihal: "",
      tanggal_surat: new Date().toISOString().split("T")[0],
      penerima: "",
      isi_singkat: "",
    },
  });

  const formValues = watch();

  // AUTOSAVE: Load Draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem("eoffice_surat_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        reset(parsed); // Load draft into form
      }
    } catch (e) {}
  }, [reset]);

  // AUTOSAVE: Save to localStorage when form changes
  useEffect(() => {
    // Only save if there's actually some content to prevent saving empty drafts
    if (formValues.judul || formValues.perihal) {
      localStorage.setItem("eoffice_surat_draft", JSON.stringify(formValues));
    }
  }, [formValues]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/surat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "PUBLISHED" }),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) throw new Error(responseData.error || "Gagal membuat surat");

      // CLEAR DRAFT ON SUCCESS
      localStorage.removeItem("eoffice_surat_draft");

      await Swal.fire({
        icon: "success",
        title: "Surat Berhasil Dibuat!",
        html: `Nomor Surat: <b>${responseData.data.nomor_surat}</b>`,
        confirmButtonColor: "#c9983a",
      });

      router.push("/admin/surat");
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
          href="/admin/surat"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Surat Baru</h1>
          <p className="text-slate-500 mt-1">Nomor surat akan di-generate otomatis saat disimpan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
        {/* Autosave Indicator */}
        <div className="absolute top-4 right-6 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Draft Autosave Aktif
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Jenis Surat
              </label>
              <select 
                {...register("jenis_surat")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-slate-50"
              >
                {JENIS_SURAT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Divisi / Unit Kerja
              </label>
              <select 
                {...register("kode_divisi")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-slate-50"
              >
                {DIVISI_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Tanggal Surat
              </label>
              <input 
                type="date"
                {...register("tanggal_surat", { required: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Ditujukan Kepada (Opsional)
              </label>
              <input 
                type="text"
                placeholder="Cth: Orang Tua Santri Kelas X"
                {...register("penerima")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" /> Judul Surat
            </label>
            <input 
              type="text"
              placeholder="Cth: Pemberitahuan Libur Idul Adha"
              {...register("judul", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Perihal
            </label>
            <input 
              type="text"
              placeholder="Cth: Libur Kegiatan Belajar Mengajar"
              {...register("perihal", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Ringkasan / Isi Singkat (Opsional)
            </label>
            <textarea 
              rows={4}
              placeholder="Tuliskan ringkasan isi surat di sini..."
              {...register("isi_singkat")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none resize-none"
            />
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-4 pt-2">
            <Link 
              href="/admin/surat"
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
                  Memproses...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Generate Nomor & Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icon hack since Users is already imported in lucide-react but I used Users twice
// Oh wait, I forgot to import Users in the top imports. Let me just add it.
