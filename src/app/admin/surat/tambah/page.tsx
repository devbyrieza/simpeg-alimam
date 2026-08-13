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

// ADVANCED TEMPLATE LIBRARY (No need for Pak Umar's flashdisk anymore!)
const ADVANCED_TEMPLATES = {
  "UND_RAPAT": { 
    label: "[UND] Undangan Rapat Wali Santri", 
    content: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Mengharap dengan hormat kehadiran Bapak/Ibu Wali Santri pada:</p><br/><p style="margin-left:20px;">Hari, Tanggal : [Hari, Tanggal]</p><p style="margin-left:20px;">Waktu         : [Waktu] WIB s.d Selesai</p><p style="margin-left:20px;">Tempat        : Aula Pesantren Al-Imam</p><p style="margin-left:20px;">Acara         : Rapat Sosialisasi Program Pendidikan</p><br/><p>Mengingat pentingnya acara ini, kami mohon Bapak/Ibu dapat hadir tepat pada waktunya.</p><br/><p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`
  },
  "UND_PANGGILAN": { 
    label: "[UND] Panggilan Orang Tua (Pelanggaran)", 
    content: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Sehubungan dengan adanya beberapa hal penting mengenai perkembangan akademik dan akhlak ananda <b>[Nama Santri]</b>, maka kami mengharap kedatangan Bapak/Ibu di Pesantren pada:</p><br/><p style="margin-left:20px;">Hari, Tanggal : [Hari, Tanggal]</p><p style="margin-left:20px;">Waktu         : [Waktu] WIB</p><p style="margin-left:20px;">Tempat        : Ruang Kesantrian</p><p style="margin-left:20px;">Menemui       : Ustadz [Nama Musyrif]</p><br/><p>Besar harapan kami Bapak/Ibu dapat meluangkan waktu untuk memenuhi panggilan ini guna kebaikan masa depan ananda.</p><br/><p>Atas perhatian dan kerjasamanya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`
  },
  "PMB_LIBUR": { 
    label: "[PMB] Edaran Libur Pesantren", 
    content: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Segala puji bagi Allah Rabb semesta alam. Shalawat dan salam semoga tercurah kepada Nabi Muhammad Shallallahu 'Alaihi Wasallam.</p><br/><p>Sehubungan dengan datangnya [Event/Libur, misal: Hari Raya Idul Adha 1447 H], maka kami beritahukan kepada seluruh Wali Santri bahwa:</p><ol><li>Kegiatan Belajar Mengajar (KBM) diliburkan mulai tanggal <b>[Tanggal Mulai]</b> sampai dengan <b>[Tanggal Selesai]</b>.</li><li>Santri wajib kembali ke pondok selambat-lambatnya pada tanggal <b>[Tanggal Kembali] pukul [Jam] WIB</b>.</li><li>Bagi santri yang terlambat kembali akan dikenakan sanksi sesuai tata tertib yang berlaku.</li></ol><br/><p>Demikian pemberitahuan ini kami sampaikan. Atas perhatiannya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`
  },
  "PMB_SPP": { 
    label: "[PMB] Pemberitahuan Tagihan SPP", 
    content: `<p><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p><br/><p>Semoga Bapak/Ibu senantiasa dalam lindungan Allah Subhanahu Wa Ta'ala.</p><br/><p>Bersama surat ini, kami dari Bagian Keuangan Pesantren menginformasikan bahwa tagihan SPP dan administrasi ananda <b>[Nama Santri]</b> untuk bulan <b>[Bulan & Tahun]</b> sejumlah <b>Rp [Nominal]</b> belum kami terima.</p><br/><p>Kami mohon kesediaan Bapak/Ibu untuk segera menyelesaikan pembayaran tersebut paling lambat tanggal <b>[Tanggal Jatuh Tempo]</b>. Pembayaran dapat ditransfer ke rekening resmi yayasan:</p><br/><p style="margin-left:20px;"><b>BSI (Bank Syariah Indonesia)</b></p><p style="margin-left:20px;">No. Rek: 1234567890</p><p style="margin-left:20px;">A.n: Yayasan Al Imam</p><br/><p>Bagi yang sudah melakukan pembayaran, mohon abaikan surat ini. Atas kerjasamanya kami ucapkan <i>Jazakumullahu Khairan</i>.</p><br/><p><i>Wassalamu'alaikum Warahmatullahi Wabarakatuh</i></p>`
  },
  "PMB_SP1": { 
    label: "[PMB] Surat Peringatan Pertama (SP 1)", 
    content: `<p style="text-align: center;"><b>SURAT PERINGATAN PERTAMA (SP-1)</b></p><br/><p>Diberikan kepada:</p><p style="margin-left:20px;">Nama  : [Nama Santri]</p><p style="margin-left:20px;">Kelas : [Kelas]</p><br/><p>Berdasarkan catatan Bagian Kesantrian, santri tersebut telah melakukan pelanggaran tata tertib pesantren berupa:</p><ol><li>[Pelanggaran 1]</li><li>[Pelanggaran 2]</li></ol><br/><p>Oleh karena itu, kami pihak Pesantren memberikan Surat Peringatan Pertama (SP-1). Kami harap ananda tidak mengulangi perbuatannya dan dapat memperbaiki diri.</p><p>Jika di kemudian hari ananda mengulangi pelanggaran, maka akan diberikan sanksi yang lebih tegas hingga pemulangan kepada orang tua.</p>`
  },
  "SK_GURU": { 
    label: "[SK] Pengangkatan Guru Baru", 
    content: `<p style="text-align: center;"><b>BISMILLAHIRRAHMANIRRAHIM</b></p><br/><p><b>MENIMBANG:</b></p><ol><li>Bahwa dalam rangka memperlancar Kegiatan Belajar Mengajar (KBM) di Pesantren Al-Imam, perlu mengangkat Tenaga Pendidik.</li><li>Bahwa nama di bawah ini dianggap cakap, memenuhi syarat, dan mampu melaksanakan tugas tersebut.</li></ol><br/><p><b>MENGINGAT:</b></p><ol><li>AD/ART Yayasan Al-Imam Al-Islami.</li><li>Hasil keputusan Rapat Pimpinan Pesantren pada tanggal [Tanggal Rapat].</li></ol><br/><p style="text-align: center;"><b>MEMUTUSKAN</b></p><br/><p><b>MENETAPKAN:</b></p><p><b>Pertama:</b> Mengangkat Saudara <b>[Nama Lengkap & Gelar]</b> sebagai <b>Guru Mata Pelajaran [Mata Pelajaran]</b>.</p><p><b>Kedua:</b> Surat Keputusan ini berlaku sejak tanggal ditetapkan sampai dengan berakhirnya Tahun Ajaran [Tahun Ajaran].</p><p><b>Ketiga:</b> Segala biaya yang timbul akibat keputusan ini dibebankan pada anggaran yayasan.</p><p><b>Keempat:</b> Apabila di kemudian hari terdapat kekeliruan dalam surat keputusan ini, akan diperbaiki sebagaimana mestinya.</p>`
  },
  "KET_AKTIF": { 
    label: "[KET] Surat Keterangan Aktif Belajar", 
    content: `<p>Yang bertanda tangan di bawah ini Kepala Bagian Tata Usaha Pesantren Al-Imam Al-Islami menerangkan dengan sesungguhnya bahwa:</p><br/><p style="margin-left:20px;">Nama     : <b>[Nama Santri]</b></p><p style="margin-left:20px;">NIS      : [Nomor Induk Santri]</p><p style="margin-left:20px;">TTL      : [Tempat, Tanggal Lahir]</p><p style="margin-left:20px;">Kelas    : [Kelas Saat Ini]</p><br/><p>Adalah benar tercatat sebagai santri aktif di Pesantren Al-Imam Al-Islami pada Tahun Ajaran <b>[Tahun Ajaran Berjalan]</b>.</p><br/><p>Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan <b>[Tulis Keperluan, misal: Mengurus BPJS / Tunjangan]</b>.</p><br/><p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`
  },
  "ST_TUGAS": { 
    label: "[ST] Surat Tugas Dinas / Mengajar", 
    content: `<p>Berdasarkan program kerja Pesantren Al-Imam Al-Islami, dengan ini Pimpinan Pesantren:</p><br/><p><b>MEMBERIKAN TUGAS KEPADA:</b></p><ol><li>Nama     : <b>[Nama Lengkap & Gelar]</b></li><li>Jabatan  : [Jabatan Saat Ini]</li></ol><br/><p><b>UNTUK MELAKSANAKAN:</b></p><ol><li>Tugas sebagai <b>[Deskripsi Tugas, misal: Pembimbing Lomba Tahfidz / Musyrif Kunjungan]</b>.</li><li>Waktu pelaksanaan: <b>[Tanggal & Waktu]</b>.</li><li>Tempat: <b>[Tempat Pelaksanaan Tugas]</b>.</li></ol><br/><p>Setelah selesai melaksanakan tugas, harap memberikan laporan tertulis kepada Pimpinan Pesantren.</p><br/><p>Demikian surat tugas ini dibuat agar dilaksanakan dengan penuh tanggung jawab dan ikhlas karena Allah <i>Ta'ala</i>. <i>Barakallahu fiikum.</i></p>`
  }
};

export default function TambahSuratPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof typeof ADVANCED_TEMPLATES>("UND_RAPAT");

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
    const templateContent = ADVANCED_TEMPLATES[selectedTemplateKey].content;
    if (formValues.isi_singkat && formValues.isi_singkat.length > 20) {
      Swal.fire({
        title: "Timpa Isi Surat?",
        text: "Ketikan surat Anda yang ada saat ini akan dihapus dan diganti dengan template. Lanjutkan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c9983a",
      }).then((res) => {
        if (res.isConfirmed) setValue("isi_singkat", templateContent);
      });
    } else {
      setValue("isi_singkat", templateContent);
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-slate-50"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-slate-50"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-lg"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
            />
          </div>

          <div className="space-y-2 pt-6 pb-2 border-t border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-3 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-1">
                  Redaksi Isi Surat (Smart Editor)
                </label>
                <p className="text-xs text-slate-500">Ketik manual atau pilih template dari pustaka otomatis di samping kanan.</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-xl border border-blue-100">
                <select 
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {Object.entries(ADVANCED_TEMPLATES).map(([key, tpl]) => (
                    <option key={key} value={key}>{tpl.label}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={loadTemplate}
                  className="text-xs flex items-center gap-1.5 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  Gunakan Template
                </button>
              </div>
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
              className="px-8 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
