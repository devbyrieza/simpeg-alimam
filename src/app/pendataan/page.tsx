"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle, User, Briefcase, Phone, Camera, X, 
  GraduationCap, Heart, BookOpen, Upload, ChevronRight, LogOut
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import MapelSelector from "@/components/MapelSelector";

const KATEGORI_OPTIONS = [
  { value: "GURU", label: "Guru / Pengajar", desc: "Mengajar santri di kelas & kajian" },
  { value: "MUSYRIF", label: "Musyrif / Pengasuh", desc: "Membina & mendampingi santri di asrama" },
  { value: "STAF", label: "Staf", desc: "Keuangan, Sapras, IT, Media, dll" },
  { value: "IBU_DAPUR", label: "Ibu Dapur", desc: "Tim konsumsi & dapur pesantren" },
];

const formSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama lengkap harus diisi (minimal 3 karakter)"),
  nik: z.string().length(16, "NIK harus 16 digit").regex(/^\d+$/, "NIK harus berupa angka"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin harus dipilih"),
  tempat_lahir: z.string().min(2, "Tempat lahir harus diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir harus diisi"),
  no_hp: z.string().min(10, "No WA/HP tidak valid (minimal 10 digit)"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  alamat: z.string().optional(),
  kategori_pegawai: z.array(z.string()).min(1, "Pilih minimal 1 kategori"),
  divisi: z.string().optional(),
  divisiLainnya: z.string().optional(),
  jabatan: z.string().optional(),
  mata_pelajaran: z.string().optional(),
  pendidikan_terakhir: z.string().min(1, "Pendidikan terakhir harus dipilih"),
  status_pernikahan: z.string().min(1, "Status pernikahan harus dipilih"),
});

type FormData = z.infer<typeof formSchema>;

// Divisi diurutkan dari yang paling sentral dan berpengaruh di kepesantrenan
const DIVISI_OPTIONS = [
  "Kepengasuhan",
  "Asrama",
  "Kurikulum",
  "Kedisiplinan",
  "Sarana & Prasarana",
  "Dapur & Konsumsi",
  "IT",
  "Media & Dokumentasi",
  "Lainnya",
];

// Auto-normalizer: format nama beserta gelar akademik
// Hasil: "Rieza Eka Tomara, S.Kom" atau "Ahmad Fulan, Lc., M.A."
function normalizeName(input: string): string {
  if (!input) return input;
  let result = input.trim();
  // Pindahkan spasi sebelum koma: "Nama , Gelar" → "Nama, Gelar"
  result = result.replace(/\s+,/g, ",");
  // Pastikan tepat satu spasi setelah setiap koma: "Nama,Gelar" → "Nama, Gelar"
  result = result.replace(/,\s*/g, ", ");
  // Buang spasi di akhir
  result = result.trimEnd();
  return result;
}

// Reusable field wrapper
function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400 italic">{hint}</p>}
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs font-medium flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all outline-none text-slate-800 placeholder:text-slate-400 text-sm";
const selectClass = inputClass + " cursor-pointer";

const SECTIONS = [
  { id: "identitas", label: "Data Diri", icon: User },
  { id: "kontak", label: "Kontak", icon: Phone },
  { id: "jabatan", label: "Jabatan", icon: Briefcase },
];

export default function PendataanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ } finally {
      window.location.href = "/login";
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { kategori_pegawai: [] },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("eoffice_pendataan_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        reset(parsed);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [reset]);

  // Save to localStorage when form values change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("eoffice_pendataan_draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const selectedKategori: string[] = watch("kategori_pegawai") || [];
  const isGuru = selectedKategori.includes("GURU");
  const selectedDivisi = watch("divisi") || "";

  const toggleKategori = (value: string) => {
    const current = getValues("kategori_pegawai") || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setValue("kategori_pegawai", updated, { shouldValidate: true });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran foto maksimal 5MB"); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = SECTIONS.findIndex(s => s.id === entry.target.id);
            if (index !== -1) setActiveSection(index);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" } // trigger when section crosses the upper half of viewport
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string, idx: number) => {
    setActiveSection(idx);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: FormData) => {
    // Validasi Wajib Foto Khusus Laki-laki
    if (data.jenis_kelamin === "LAKI_LAKI" && !fotoFile) {
      toast.error("Wajib: Foto/Pas Foto harus diunggah bagi pendaftar Laki-laki.");
      const el = document.getElementById("identitas");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      let foto_url: string | null = null;
      if (fotoFile) {
        const fd = new FormData();
        fd.append("foto", fotoFile);
        const uploadRes = await fetch("/api/pendataan/upload-foto", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          foto_url = uploadData.url;
        } else {
          const errorText = await uploadRes.text().catch(() => "Unknown error");
          throw new Error(`Gagal mengunggah foto (${uploadRes.status}): ${errorText.substring(0, 50)}`);
        }
      }

      // Combine "Lainnya" input with divisi if applicable
      let finalDivisi = data.divisi;
      if (data.divisi === "Lainnya") {
        if (data.divisiLainnya && data.divisiLainnya.trim() !== "") {
          finalDivisi = data.divisiLainnya.trim();
        } else {
          finalDivisi = "Lainnya";
        }
      }

      // Convert array to comma-separated string for storage
      const submitData = {
        ...data,
        divisi: finalDivisi,
        kategori_pegawai: Array.isArray(data.kategori_pegawai)
          ? data.kategori_pegawai.join(",")
          : data.kategori_pegawai,
        foto_url,
      };

      // Delete temporary field so backend Zod schema doesn't reject it
      delete (submitData as any).divisiLainnya;

      const response = await fetch("/api/pendataan/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        localStorage.removeItem("eoffice_pendataan_draft");
        setIsSuccess(true);
      } else {
        const result = await response.json().catch(() => ({ message: "Gagal menyimpan data ke database (Internal Server Error)" }));
        toast.error(result.message || `Gagal menyimpan data (${response.status})`);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err?.message || "Terjadi kesalahan jaringan saat mengirim data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    toast.error("Masih ada data wajib yang belum diisi (bertanda bintang merah). Cek kembali form antum.");
  };

  // SUCCESS STATE
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-white rounded-3xl p-10 shadow-2xl shadow-primary-900/10 max-w-md w-full text-center border border-primary-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Alhamdulillah!</h2>
          <p className="text-slate-500 mb-2 leading-relaxed">
            Data antum telah berhasil disimpan di database kepegawaian.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Jazakumullahu khairan atas partisipasinya 🤍
          </p>
          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 mb-6">
            <p className="text-sm text-primary-700 font-semibold">
              Data antum akan digunakan untuk sistem Absensi & Sistem Informasi Akademik dan Pengasuhan (SIKAP) Pesantren Al-Imam.
            </p>
          </div>
          <button
            onClick={() => { setIsSuccess(false); reset(); setFotoPreview(null); setFotoFile(null); setActiveSection(0); }}
            className="w-full py-3 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-900/20"
          >
            Isi Data Lainnya
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-100/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 relative">
          {/* Tombol Logout di kanan atas */}
          <div className="absolute top-0 right-0">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all text-xs font-bold shadow-sm cursor-pointer"
            >
              {isLoggingOut
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <LogOut className="w-3.5 h-3.5" />
              }
              {isLoggingOut ? "Keluar..." : "Logout"}
            </button>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">SIMPEG · Pesantren Al-Imam Al-Islami</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Pendataan Civitas Pesantren
          </h1>
          <p className="text-slate-500 text-base font-medium">
            Formulir resmi untuk segenap Asatidz dan seluruh Civitas Pesantren Al-Imam Al-Islami.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/8 overflow-hidden border border-white"
        >
          {/* Card Header */}
          <div className="px-5 sm:px-8 py-6 sm:py-7 relative overflow-hidden" style={{ backgroundColor: "#3b0a0a" }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/20" />
            <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10">Formulir Data Diri</h2>
            <p className="text-white/80 mt-1.5 text-xs sm:text-sm relative z-10 leading-relaxed">
              Digunakan untuk database Absensi & Sistem Informasi Akademik dan Pengasuhan (SIKAP) · Semua data dijaga kerahasiaannya
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-8 pt-6 pb-2 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max sm:min-w-0">
              {SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                const isActive = idx === activeSection;
                const isDone = idx < activeSection;
                return (
                  <div key={section.id} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id, idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold flex-1 justify-center
                      ${isActive ? "bg-primary-900 text-white shadow-md shadow-primary-900/20" : 
                        isDone ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{section.label}</span>
                    </button>
                    {idx < SECTIONS.length - 1 && (
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isDone ? "text-green-400" : "text-slate-300"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="p-4 sm:p-8 space-y-10">

            {/* ── SECTION 1: Identitas ── */}
            <section id="identitas">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Informasi Pribadi</h3>
                  <p className="text-xs text-slate-400">Identitas diri sesuai KTP</p>
                </div>
              </div>

              {/* Foto Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Foto / Pas Foto <span className="text-red-500 font-normal text-xs ml-1">(Wajib bagi Laki-laki, Opsional bagi Perempuan)</span>
                </label>
                <div className="flex items-start gap-6">
                  <div
                    onClick={() => fotoInputRef.current?.click()}
                    className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-primary-50 flex flex-col items-center justify-center cursor-pointer transition-all group shrink-0 overflow-hidden relative"
                  >
                    {fotoPreview ? (
                      <>
                        <Image src={fotoPreview} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFotoPreview(null); setFotoFile(null); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md z-10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-7 h-7 text-slate-300 group-hover:text-primary-500 transition-colors mb-1" />
                        <span className="text-xs text-slate-400 group-hover:text-primary-500 transition-colors font-medium">Upload Foto</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      Unggah foto formal (pas foto) yang jelas terlihat wajahnya untuk referensi sistem absensi. <b>Khusus bagi pegawai Perempuan, bagian ini boleh dikosongkan.</b>
                    </p>
                    <button
                      type="button"
                      onClick={() => fotoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-primary-50 hover:border-primary-300 transition-all text-xs font-semibold text-slate-600 hover:text-primary-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {fotoPreview ? "Ganti Foto" : "Pilih Foto"}
                    </button>
                    <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                    <p className="text-xs text-slate-400 mt-2">Format: JPG, PNG · Maks 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <Field label="Nama Lengkap" required error={errors.nama_lengkap?.message}>
                    <div className="mb-2 flex items-start gap-2.5 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <GraduationCap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Bagi yang memiliki gelar akademik</span>, mohon sertakan bersama nama lengkap.{" "}
                        <span className="text-amber-600 font-medium">Contoh: Ahmad Fulan, Lc., M.A.</span>
                        <br />
                        <span className="text-amber-600/80 font-normal">Bagi yang belum memiliki gelar, cukup tuliskan nama lengkap saja.</span>
                      </p>
                    </div>
                    <input {...register("nama_lengkap")} className={inputClass} placeholder="Masukkan nama lengkap (beserta gelar jika ada)" />
                  </Field>
                </div>

                <Field label="NIK (No. KTP)" required error={errors.nik?.message}>
                  <input {...register("nik")} className={inputClass} placeholder="16 digit NIK" maxLength={16} inputMode="numeric" />
                </Field>

                <Field label="Jenis Kelamin" required error={errors.jenis_kelamin?.message}>
                  <select {...register("jenis_kelamin")} className={selectClass}>
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </Field>

                <Field label="Tempat Lahir" required hint="Tulis persis sesuai yang tertera di KTP" error={errors.tempat_lahir?.message}>
                  <input {...register("tempat_lahir")} className={inputClass} placeholder="Contoh: Jakarta, Bandung, Surabaya, dll." />
                </Field>

                <Field label="Tanggal Lahir" required error={errors.tanggal_lahir?.message}>
                  <input type="date" {...register("tanggal_lahir")} className={inputClass} />
                </Field>

                <Field label="Status Pernikahan" required error={errors.status_pernikahan?.message}>
                  <select {...register("status_pernikahan")} className={selectClass}>
                    <option value="">Pilih Status</option>
                    <option value="BELUM_MENIKAH">Belum Menikah</option>
                    <option value="MENIKAH">Menikah</option>
                    <option value="JANDA_DUDA">Janda / Duda</option>
                  </select>
                </Field>

                <Field label="Pendidikan Terakhir" required error={errors.pendidikan_terakhir?.message}>
                  <select {...register("pendidikan_terakhir")} className={selectClass}>
                    <option value="">Pilih Pendidikan</option>
                    <option value="SMA_SMK">SMA / SMK / Sederajat</option>
                    <option value="D3">D3 (Diploma)</option>
                    <option value="S1">S1 (Sarjana)</option>
                    <option value="S2">S2 (Magister)</option>
                    <option value="S3">S3 (Doktor)</option>
                    <option value="PESANTREN">Pesantren / Ma'had</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* ── SECTION 2: Kontak ── */}
            <section id="kontak">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Informasi Kontak</h3>
                  <p className="text-xs text-slate-400">Nomor yang aktif dan dapat dihubungi</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="No WhatsApp / HP" required error={errors.no_hp?.message}>
                  <input {...register("no_hp")} className={inputClass} placeholder="0812xxxxxxxxxx" />
                </Field>
                <Field label="Email" required hint="Email ini akan digunakan untuk login aplikasi SIKAP" error={errors.email?.message}>
                  <input type="email" {...register("email")} className={inputClass} placeholder="nama@email.com" />
                </Field>
                <div className="col-span-1 md:col-span-2">
                  <Field label="Alamat Asal / Domisili" hint="Opsional — kosongkan jika tinggal di asrama/rumah dinas pesantren" error={errors.alamat?.message}>
                    <textarea {...register("alamat")} rows={2} className={inputClass + " resize-none"} placeholder="Isi jika tidak tinggal di lingkungan pesantren..." />
                  </Field>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: Jabatan ── */}
            <section id="jabatan">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Kategori & Jabatan</h3>
                  <p className="text-xs text-slate-400">Posisi dan peran di Pesantren Al-Imam</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <Field label="Kategori Pegawai (Bisa pilih lebih dari satu)" required error={errors.kategori_pegawai?.message}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {KATEGORI_OPTIONS.map((cat) => {
                        const isSelected = selectedKategori.includes(cat.value);
                        return (
                          <div
                            key={cat.value}
                            onClick={() => toggleKategori(cat.value)}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-primary-50 border-primary-500 shadow-sm shadow-primary-500/20"
                                : "bg-white border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isSelected ? "bg-primary-600 text-white" : "bg-slate-100 border border-slate-300"
                            }`}>
                              {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isSelected ? "text-primary-900" : "text-slate-700"}`}>
                                {cat.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                <Field label="Bidang Kerja" hint="Pilih jika tergabung dalam bidang tertentu" error={errors.divisi?.message}>
                  <select {...register("divisi")} className={selectClass}>
                    <option value="">Tidak Ada / Belum Ditentukan</option>
                    {DIVISI_OPTIONS.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </Field>

                <AnimatePresence>
                  {selectedDivisi === "Lainnya" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <Field label="Nama Bidang Lainnya" hint="Tulis nama bidang Anda jika tidak ada di pilihan di atas (tidak wajib)" error={errors.divisiLainnya?.message}>
                        <input
                          type="text"
                          {...register("divisiLainnya")}
                          className={inputClass}
                          placeholder="Contoh: Kesehatan, Kebersihan, Keamanan, dll."
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field label="Amanah / Jabatan" hint="Opsional — isi jika mendapat amanah memimpin bidang tertentu" error={errors.jabatan?.message}>
                  <input {...register("jabatan")} className={inputClass} placeholder="Contoh: Kabid Pengasuhan, Kabid Asrama, Kabid Kurikulum, Bendahara..." />
                </Field>

                {isGuru && (
                  <div className="col-span-1 md:col-span-2">
                    <Field label="Mata Pelajaran / Bidang Mengajar" hint="Khusus Guru / Pengajar (Bisa tambah lebih dari 1)" error={errors.mata_pelajaran?.message}>
                      <MapelSelector 
                        value={watch("mata_pelajaran") || ""} 
                        onChange={(val) => setValue("mata_pelajaran", val, { shouldValidate: true })} 
                      />
                    </Field>
                  </div>
                )}
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
                  <span className="text-slate-400">🔒</span>
                  Data antum aman dan terlindungi oleh sistem SIMPEG
                </p>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#3b0a0a" }}
                  className="w-full sm:w-auto px-8 py-4 text-white rounded-2xl font-bold text-base transition-all shadow-xl flex items-center justify-center gap-2.5 disabled:opacity-60 hover:opacity-90"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan Data...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Simpan Data Diri</>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 Pesantren Al Imam Al Islami · Sistem SIMPEG v1.0
        </p>
      </div>
    </div>
  );
}
