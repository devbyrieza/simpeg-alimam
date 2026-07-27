"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Building2, Calendar, FileText, Type, Users, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";
import RichTextEditor from "@/components/ui/RichTextEditor";

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

const TEMPLATES: Record<string, string> = {
  UND: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Mengharap dengan hormat kehadiran Bapak/Ibu/Sdr pada:</p><br/><p style="margin-left:20px;">Hari, Tanggal : [Hari, Tanggal]</p><p style="margin-left:20px;">Waktu         : [Waktu] WIB s.d Selesai</p><p style="margin-left:20px;">Tempat        : [Tempat]</p><p style="margin-left:20px;">Acara         : [Nama Acara]</p><br/><p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`,
  PMB: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Segala puji bagi Allah Rabb semesta alam. Shalawat dan salam semoga tercurah kepada Nabi Muhammad Shallallahu 'Alaihi Wasallam.</p><p>Sehubungan dengan [Topik Pemberitahuan], maka melalui surat ini kami beritahukan kepada Bapak/Ibu Wali Santri bahwa:</p><ol><li>[Poin 1]</li><li>[Poin 2]</li></ol><br/><p>Demikian pemberitahuan ini kami sampaikan agar menjadi maklum adanya. Atas perhatian dan kerjasamanya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`,
  SK: `<p style="text-align: center;"><b>BISMILLAHIRRAHMANIRRAHIM</b></p><br/><p><b>MENIMBANG:</b></p><ol><li>Bahwa dalam rangka meningkatkan [Tujuan], perlu menetapkan [Subjek Keputusan].</li><li>Bahwa nama-nama yang tercantum dianggap cakap dan mampu untuk melaksanakan tugas tersebut.</li></ol><br/><p><b>MENGINGAT:</b></p><ol><li>AD/ART Yayasan Al-Imam.</li><li>Program Kerja Pesantren Al-Imam Al-Islami.</li></ol><br/><p style="text-align: center;"><b>MEMUTUSKAN</b></p><br/><p><b>MENETAPKAN:</b></p><p><b>Pertama:</b> Mengangkat Saudara [Nama] sebagai [Jabatan].</p><p><b>Kedua:</b> Surat Keputusan ini berlaku sejak tanggal ditetapkan sampai dengan [Tanggal Berakhir].</p><p><b>Ketiga:</b> Apabila terdapat kekeliruan dalam keputusan ini, akan diperbaiki sebagaimana mestinya.</p>`,
  KET: `<p>Yang bertanda tangan di bawah ini:</p><br/><p style="margin-left:20px;">Nama     : [Nama Penandatangan]</p><p style="margin-left:20px;">Jabatan  : [Jabatan Penandatangan]</p><br/><p>Dengan ini menerangkan bahwa:</p><br/><p style="margin-left:20px;">Nama     : [Nama Subjek]</p><p style="margin-left:20px;">Nomor Induk : [NIS/NIK]</p><br/><p>Adalah benar merupakan [Status: misal Santri/Pegawai Aktif] di Pesantren Al-Imam Al-Islami pada tahun ajaran berjalan. Surat keterangan ini dibuat untuk keperluan [Keperluan].</p><br/><p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`,
  ST: `<p><b>MEMBERIKAN TUGAS KEPADA:</b></p><br/><ol><li>Nama: [Nama Lengkap]<br>Jabatan: [Jabatan]</li></ol><br/><p><b>UNTUK:</b></p><br/><ol><li>Melaksanakan tugas [Deskripsi Tugas] pada tanggal [Tanggal Pelaksanaan] bertempat di [Tempat Pelaksanaan].</li><li>Melaporkan hasil pelaksanaan tugas kepada Pimpinan Pesantren.</li></ol><br/><p>Demikian surat tugas ini dibuat agar dilaksanakan dengan penuh tanggung jawab dan rasa amanah. <i>Barakallahu fiikum.</i></p>`
};

export default function TambahSuratPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, reset, control, setValue } = useForm<FormValues>({
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
    if (formValues.judul || formValues.perihal || formValues.isi_singkat) {
      localStorage.setItem("eoffice_surat_draft", JSON.stringify(formValues));
    }
  }, [formValues]);

  const loadTemplate = () => {
    const template = TEMPLATES[formValues.jenis_surat];
    if (template) {
      if (formValues.isi_singkat && formValues.isi_singkat.length > 20) {
        Swal.fire({
          title: "Timpa Isi Surat?",
          text: "Isi surat yang sudah ada akan dihapus dan diganti dengan template. Lanjutkan?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#c9983a",
        }).then((res) => {
          if (res.isConfirmed) setValue("isi_singkat", template);
        });
      } else {
        setValue("isi_singkat", template);
      }
    } else {
      Swal.fire({ icon: "info", title: "Template Belum Tersedia", text: "Silakan ketik manual." });
    }
  };

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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/surat"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Surat Baru</h1>
          <p className="text-slate-500 mt-1">Smart Letter Generator - Desain dan print surat dengan elegan.</p>
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
                placeholder="Cth: Wali Santri Kelas X"
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
              placeholder="Cth: Pemberitahuan Libur Kegiatan Belajar"
              {...register("judul", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Perihal
            </label>
            <input 
              type="text"
              placeholder="Cth: Pemberitahuan"
              {...register("perihal", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
            />
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Redaksi Isi Surat (Smart Editor)
              </label>
              <button 
                type="button" 
                onClick={loadTemplate}
                className="text-xs flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                Gunakan Template {formValues.jenis_surat}
              </button>
            </div>
            
            <Controller
              name="isi_singkat"
              control={control}
              render={({ field }) => (
                <RichTextEditor 
                  value={field.value} 
                  onChange={field.onChange} 
                  placeholder="Ketik isi surat di sini atau klik 'Gunakan Template' di atas..."
                />
              )}
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
                  Generate & Simpan Surat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
