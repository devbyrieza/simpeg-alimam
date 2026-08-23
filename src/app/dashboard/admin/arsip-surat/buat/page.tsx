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
  
  const [formData, setFormData] = useState({
    jenis_surat: "UND",
    kode_divisi: "TU",
    tanggal_surat: new Date().toISOString().split('T')[0],
    judul: "",
    perihal: "",
    penerima: "",
    isi_singkat: "" });

  // Fetch preview nomor setiap kali jenis, divisi, atau tanggal berubah
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const params = new URLSearchParams({
          jenis: formData.jenis_surat,
          divisi: formData.kode_divisi,
          tanggal: formData.tanggal_surat });
        const res = await fetch(`/api/admin/surat-keluar/nomor?${params}`);
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

  // AUTOSAVE: Load Draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem("arsip_surat_buat_draft");
      if (draft) {
        setFormData(JSON.parse(draft));
      }
    } catch (e) {}
  }, []);

  // AUTOSAVE: Save to localStorage when form changes
  useEffect(() => {
    if (formData.judul || formData.perihal || formData.isi_singkat) {
      localStorage.setItem("arsip_surat_buat_draft", JSON.stringify(formData));
    }
  }, [formData]);

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
      const res = await fetch("/api/admin/surat-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }) });
      
      if (res.ok) {
        localStorage.removeItem("arsip_surat_buat_draft");
        await Swal.fire("Berhasil", "Surat berhasil disimpan.", "success");
        router.push("/dashboard/admin/arsip-surat");
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/arsip-surat"
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Buat Surat Baru</h1>
          <p className="text-slate-500 mt-1">Formulir penomoran surat keluar otomatis.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        {/* Preview Nomor */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Preview Nomor Surat</p>
            <p className="text-2xl md:text-3xl font-black text-primary-900 font-mono tracking-tight">
              {previewNomor || "Memuat..."}
            </p>
          </div>
          <div className="px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-200 text-sm font-medium shadow-sm">
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
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-600/20"
          >
            <Send className="w-5 h-5" />
            Publish Surat
          </button>
        </div>
      </div>
    </div>
  );
}
