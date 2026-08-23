"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Send, Building2, FileText, 
  CalendarDays, Tag, Users
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function BuatSuratPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewNomor, setPreviewNomor] = useState("");
  const [isRestored, setIsRestored] = useState(false);
  
  const [formData, setFormData] = useState({
    jenis_surat: "UND",
    kode_divisi: "TU",
    tanggal_surat: new Date().toISOString().split('T')[0],
    judul: "",
    perihal: "",
    penerima: "",
    isi_singkat: "" });

  // Autosave load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("alimam_surat_buat_draft");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error("Error parsing draft data:", error);
        }
      }
      setIsRestored(true);
    }
  }, []);

  // Autosave save
  useEffect(() => {
    if (isRestored && typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("alimam_surat_buat_draft", JSON.stringify(formData));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, isRestored]);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const params = new URLSearchParams({
          jenis: formData.jenis_surat,
          divisi: formData.kode_divisi,
          tanggal: formData.tanggal_surat });
        const res = await fetch(`/api/surat/nomor?${params}`);
        const json = await res.json();
        if (json.data) {
          setPreviewNomor(json.data.nomorSurat);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPreview();
  }, [formData.jenis_surat, formData.kode_divisi, formData.tanggal_surat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!formData.judul || !formData.perihal) {
      Swal.fire("Peringatan", "Judul dan Perihal wajib diisi!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/surat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }) });
      
      if (res.ok) {
        localStorage.removeItem("alimam_surat_buat_draft");
        await Swal.fire("Berhasil", "Surat berhasil disimpan.", "success");
        router.push("/dashboard/surat");
      } else {
        const err = await res.json();
        Swal.fire("Gagal", err.error || "Gagal menyimpan surat", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/surat"
          className="p-3 bg-white text-slate-500 hover:text-primary-600 rounded-2xl shadow-xl shadow-slate-200/40 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Surat Baru</h1>
          <p className="text-slate-500 mt-1 font-medium">Formulir penomoran surat keluar otomatis.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/40 relative">
        {/* Preview Nomor */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Preview Nomor Surat</p>
            <p className="text-2xl md:text-3xl font-black text-primary-900 font-mono tracking-tight">
              {previewNomor || "Memuat..."}
            </p>
          </div>
          <div className="px-5 py-2 bg-white text-primary-700 rounded-xl border border-primary-100 text-sm font-black uppercase tracking-widest shadow-sm">
            Auto-Generated
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jenis Surat */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-600" /> Jenis Surat
            </label>
            <select
              name="jenis_surat"
              value={formData.jenis_surat}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="UND">UND - Undangan</option>
              <option value="PMB">PMB - Pemberitahuan / Edaran</option>
              <option value="PENG">PENG - Pengumuman</option>
              <option value="SK">SK - Surat Keputusan</option>
              <option value="KET">KET - Surat Keterangan</option>
              <option value="ST">ST - Surat Tugas</option>
            </select>
          </div>

          {/* Divisi */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" /> Divisi Penerbit
            </label>
            <select
              name="kode_divisi"
              value={formData.kode_divisi}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="TU">TU - Tata Usaha</option>
              <option value="KS">KS - Kesantrian</option>
              <option value="AK">AK - Akademik / Kurikulum</option>
              <option value="KU">KU - Keuangan</option>
              <option value="PSB">PSB - Panitia Penerimaan Santri Baru</option>
            </select>
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary-600" /> Tanggal Surat
            </label>
            <input
              type="date"
              name="tanggal_surat"
              value={formData.tanggal_surat}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Penerima */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" /> Ditujukan Kepada (Opsional)
            </label>
            <input
              type="text"
              name="penerima"
              value={formData.penerima}
              onChange={handleChange}
              placeholder="Contoh: Seluruh Wali Santri Baru"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Judul */}
          <div className="col-span-1 md:col-span-2 space-y-2 mt-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" /> Judul Surat / Nama File <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Contoh: Surat Pemberitahuan Kedatangan Santri Baru"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Perihal */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" /> Perihal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="perihal"
              value={formData.perihal}
              onChange={handleChange}
              placeholder="Contoh: Kedatangan Santri Baru"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          {/* Isi Singkat */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Ringkasan Isi (Opsional)
            </label>
            <textarea
              name="isi_singkat"
              value={formData.isi_singkat}
              onChange={handleChange}
              rows={3}
              placeholder="Tuliskan ringkasan singkat tentang surat ini..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSubmitting}
            className="px-8 py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isSubmitting}
            className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all hover:-translate-y-1 flex items-center gap-2 shadow-xl shadow-primary-600/30"
          >
            <Send className="w-5 h-5" />
            Publish Surat
          </button>
        </div>
      </div>
    </div>
  );
}
