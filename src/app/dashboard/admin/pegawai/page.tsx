"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, Search, Users, ShieldAlert, X, Calendar, Phone, Mail, MapPin, 
  Award, Heart, Briefcase, FileText, CheckCircle2, Plus, Sparkles, Camera, 
  Trash2, Loader2, Edit3, Check, UserPlus, AlertTriangle
} from "lucide-react";
import * as XLSX from "xlsx";
import MapelSelector from "@/components/MapelSelector";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface PegawaiData {
  id: string;
  nama_lengkap: string;
  nik: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  no_hp: string;
  email: string;
  alamat: string;
  kategori_pegawai: string;
  unit_kerja: string;
  divisi: string;
  jabatan: string;
  mata_pelajaran: string;
  pendidikan_terakhir: string;
  status_pernikahan: string;
  foto_url: string | null;
}

const KATEGORI_OPTIONS = [
  { value: "GURU", label: "Guru / Asatidz", desc: "Pengajar kelas & kajian", color: "blue" },
  { value: "MUSYRIF", label: "Musyrif / Pengasuh", desc: "Pembina asrama & santri", color: "purple" },
  { value: "STAF", label: "Staf Pegawai", desc: "Keuangan, Sapras, IT, Media", color: "emerald" },
  { value: "IBU_DAPUR", label: "Ibu Dapur", desc: "Konsumsi & dapur santri", color: "amber" },
  { value: "PIMPINAN", label: "Pimpinan / Manajemen", desc: "Mudir, Kepala Divisi, dll", color: "rose" },
];

const DIVISI_OPTIONS = [
  "Kepengasuhan",
  "Kurikulum",
  "Kedisiplinan",
  "Sarana & Prasarana",
  "Dapur & Konsumsi",
  "IT",
  "Media & Dokumentasi",
  "Keuangan",
  "Tata Usaha",
  "Umum",
];

const PENDIDIKAN_OPTIONS = [
  "SMA / MA / Sederajat",
  "D3",
  "D4 / S1",
  "S2 (Magister)",
  "S3 (Doktor)",
  "Pondok Pesantren / Non-Formal",
];

const INITIAL_FORM = {
  nama_lengkap: "",
  nik: "",
  jenis_kelamin: "LAKI_LAKI",
  tempat_lahir: "",
  tanggal_lahir: "",
  no_hp: "",
  email: "",
  alamat: "",
  kategori_pegawai: "GURU",
  unit_kerja: "Pesantren Al-Imam",
  divisi: "",
  jabatan: "",
  mata_pelajaran: "",
  pendidikan_terakhir: "",
  status_pernikahan: "BELUM_MENIKAH",
  foto_url: null as string | null,
};

const DRAFT_KEY = "simpeg_admin_pegawai_draft";

const formatName = (str: string) => {
  if (!str) return "-";
  return str.split(" ").map((word) => {
    if (word.includes(".")) return word;
    if (word === word.toUpperCase() || word === word.toLowerCase()) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  }).join(" ");
};

const formatDateForInput = (dateStr?: string | null) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function AdminPegawaiPage() {
  const [data, setData] = useState<PegawaiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiData | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [customKategoriInput, setCustomKategoriInput] = useState("");

  // Restore draft on mount if available (Mandatory UX Rule)
  useEffect(() => {
    fetchPegawai();
  }, []);

  // Autosave draft when adding new civitas
  useEffect(() => {
    if (isAddingNew && modalOpen) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch (err) {
        console.error("Autosave draft failed", err);
      }
    }
  }, [formData, isAddingNew, modalOpen]);

  const fetchPegawai = async () => {
    try {
      const res = await fetch("/api/admin/pegawai");
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pegawai", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    // Check if there is saved draft
    let initialData = { ...INITIAL_FORM };
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          initialData = { ...initialData, ...parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSelectedPegawai(null);
    setIsAddingNew(true);
    setIsEditing(true);
    setFormData(initialData);
    setCustomKategoriInput("");
    setModalOpen(true);
  };

  const openDetailModal = (pegawai: PegawaiData, startInEditMode = false) => {
    setSelectedPegawai(pegawai);
    setIsAddingNew(false);
    setIsEditing(startInEditMode);
    setFormData({
      nama_lengkap: pegawai.nama_lengkap || "",
      nik: pegawai.nik || "",
      jenis_kelamin: pegawai.jenis_kelamin || "LAKI_LAKI",
      tempat_lahir: pegawai.tempat_lahir || "",
      tanggal_lahir: formatDateForInput(pegawai.tanggal_lahir),
      no_hp: pegawai.no_hp || "",
      email: pegawai.email || "",
      alamat: pegawai.alamat || "",
      kategori_pegawai: pegawai.kategori_pegawai || "",
      unit_kerja: pegawai.unit_kerja || "",
      divisi: pegawai.divisi || "",
      jabatan: pegawai.jabatan || "",
      mata_pelajaran: pegawai.mata_pelajaran || "",
      pendidikan_terakhir: pegawai.pendidikan_terakhir || "",
      status_pernikahan: pegawai.status_pernikahan || "BELUM_MENIKAH",
      foto_url: pegawai.foto_url || null,
    });
    setCustomKategoriInput("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPegawai(null);
    setIsAddingNew(false);
    setIsEditing(false);
  };

  const filteredData = data.filter((p) =>
    p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategori_pegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.jabatan && p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.divisi && p.divisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.unit_kerja && p.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Parse list of selected categories from formData
  const selectedKategoriList = useMemo(() => {
    if (!formData.kategori_pegawai) return [];
    return formData.kategori_pegawai
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s);
  }, [formData.kategori_pegawai]);

  const toggleKategori = (val: string) => {
    const cleanVal = val.trim().toUpperCase();
    if (!cleanVal) return;

    let updated: string[];
    if (selectedKategoriList.includes(cleanVal)) {
      updated = selectedKategoriList.filter((v) => v !== cleanVal);
    } else {
      updated = [...selectedKategoriList, cleanVal];
    }
    setFormData({ ...formData, kategori_pegawai: updated.join(",") });
  };

  const handleAddCustomKategori = () => {
    const clean = customKategoriInput.trim().toUpperCase();
    if (!clean) return;
    if (!selectedKategoriList.includes(clean)) {
      const updated = [...selectedKategoriList, clean];
      setFormData({ ...formData, kategori_pegawai: updated.join(",") });
    }
    setCustomKategoriInput("");
  };

  // Upload Foto Handler
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "<span class='text-slate-800 font-extrabold text-lg'>Ukuran File Terlalu Besar</span>",
        html: "<p class='text-slate-500 text-sm'>Ukuran foto maksimal adalah <b>5MB</b>.</p>",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#3b0a0a",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
          confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
        },
      });
      return;
    }

    setUploadingFoto(true);
    const loadingToast = toast.loading("Mengunggah foto profil...");
    try {
      const fd = new FormData();
      fd.append("foto", file);
      const res = await fetch("/api/pendataan/upload-foto", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const resData = await res.json();
        setFormData((prev) => ({ ...prev, foto_url: resData.url }));
        toast.dismiss(loadingToast);
        toast.success("Foto profil berhasil diunggah!", {
          style: {
            borderRadius: "16px",
            background: "#1e293b",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "13px",
          },
        });
      } else {
        toast.dismiss(loadingToast);
        Swal.fire({
          icon: "error",
          title: "<span class='text-slate-800 font-extrabold text-lg'>Gagal Mengunggah Foto</span>",
          html: "<p class='text-slate-500 text-sm'>Terjadi kesalahan pada server saat mengunggah foto.</p>",
          confirmButtonText: "Tutup",
          confirmButtonColor: "#3b0a0a",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
            confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      Swal.fire({
        icon: "error",
        title: "<span class='text-slate-800 font-extrabold text-lg'>Kesalahan Jaringan</span>",
        html: "<p class='text-slate-500 text-sm'>Gagal menghubungi server saat mengunggah foto.</p>",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3b0a0a",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
          confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
        },
      });
    } finally {
      setUploadingFoto(false);
    }
  };

  // Submit Handler: Add New or Edit Existing
  const handleSave = async () => {
    if (!formData.nama_lengkap.trim()) {
      Swal.fire({
        icon: "warning",
        title: "<span class='text-slate-800 font-extrabold text-lg'>Nama Lengkap Wajib Diisi</span>",
        html: "<p class='text-slate-500 text-sm'>Silakan lengkapi nama lengkap civitas / pegawai.</p>",
        confirmButtonText: "Lengkapi Sekarang",
        confirmButtonColor: "#3b0a0a",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
          confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
        },
      });
      return;
    }

    setSaving(true);
    try {
      let res: Response;
      if (isAddingNew) {
        // Create new
        res = await fetch("/api/admin/pegawai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Edit existing
        if (!selectedPegawai) return;
        res = await fetch("/api/admin/pegawai", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedPegawai.id,
            ...formData,
          }),
        });
      }

      if (res.ok) {
        // Clear draft upon successful submission (Mandatory UX Rule)
        if (isAddingNew) {
          localStorage.removeItem(DRAFT_KEY);
        }

        closeModal();
        fetchPegawai();

        Swal.fire({
          icon: "success",
          title: `<span class='text-primary-950 font-extrabold text-xl'>${isAddingNew ? "Civitas Berhasil Ditambahkan!" : "Perubahan Berhasil Disimpan!"}</span>`,
          html: `
            <div class='text-slate-600 text-sm space-y-2 pt-1'>
              <p>Data profil civitas <b>${formData.nama_lengkap}</b> telah tersimpan di database induk SIMPEG & SIKAP.</p>
              ${formData.mata_pelajaran ? `<div class='mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium text-left'><b>Mapel Ditugaskan:</b> ${formData.mata_pelajaran}</div>` : ""}
            </div>
          `,
          confirmButtonText: "Selesai",
          confirmButtonColor: "#3b0a0a",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
            confirmButton: "px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary-950/20 hover:scale-[1.02] transition-transform cursor-pointer",
          },
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        const err = await res.json().catch(() => ({ message: "Gagal menyimpan data" }));
        Swal.fire({
          icon: "error",
          title: "<span class='text-slate-800 font-extrabold text-lg'>Gagal Menyimpan</span>",
          html: `<p class='text-slate-500 text-sm'>${err.message || "Terjadi kendala saat memproses data."}</p>`,
          confirmButtonText: "Tutup",
          confirmButtonColor: "#3b0a0a",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
            confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
          },
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "<span class='text-slate-800 font-extrabold text-lg'>Kesalahan Jaringan</span>",
        html: "<p class='text-slate-500 text-sm'>Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.</p>",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3b0a0a",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
          confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDeletePegawai = async (pegawai: PegawaiData) => {
    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "<span class='text-red-950 font-extrabold text-xl'>Hapus Data Civitas?</span>",
      html: `
        <div class='text-slate-600 text-sm space-y-2 pt-1'>
          <p>Apakah Anda yakin ingin menghapus data civitas <b>${pegawai.nama_lengkap}</b>?</p>
          <p class='text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200'>
            Peringatan: Data yang dihapus tidak dapat dipulihkan kembali.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-100 p-6",
        confirmButton: "px-6 py-2.5 rounded-xl font-bold text-sm shadow-md",
        cancelButton: "px-6 py-2.5 rounded-xl font-bold text-sm",
      },
    });

    if (confirmResult.isConfirmed) {
      const deleteToast = toast.loading("Menghapus data civitas...");
      try {
        const res = await fetch(`/api/admin/pegawai?id=${pegawai.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.dismiss(deleteToast);
          fetchPegawai();
          if (selectedPegawai?.id === pegawai.id) {
            closeModal();
          }
          toast.success(`Data ${pegawai.nama_lengkap} berhasil dihapus.`, {
            style: {
              borderRadius: "16px",
              background: "#1e293b",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "13px",
            },
          });
        } else {
          toast.dismiss(deleteToast);
          const err = await res.json().catch(() => ({ message: "Gagal menghapus" }));
          Swal.fire({
            icon: "error",
            title: "<span class='text-slate-800 font-extrabold text-lg'>Gagal Menghapus</span>",
            html: `<p class='text-slate-500 text-sm'>${err.message || "Terjadi kesalahan saat menghapus data."}</p>`,
            confirmButtonText: "Tutup",
            confirmButtonColor: "#3b0a0a",
          });
        }
      } catch (e) {
        console.error(e);
        toast.dismiss(deleteToast);
        toast.error("Gagal terhubung ke server.");
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((d, index) => ({
        No: index + 1,
        "Nama Lengkap": formatName(d.nama_lengkap),
        NIK: d.nik || "-",
        "Jenis Kelamin": d.jenis_kelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
        "Tempat Lahir": d.tempat_lahir || "-",
        "Tanggal Lahir": d.tanggal_lahir ? new Date(d.tanggal_lahir).toLocaleDateString("id-ID") : "-",
        "No HP / WA": d.no_hp || "-",
        Email: d.email || "-",
        Alamat: d.alamat || "-",
        Kategori: d.kategori_pegawai.replace("_", " "),
        "Unit Kerja": d.unit_kerja || "-",
        Divisi: d.divisi || "-",
        Jabatan: d.jabatan || "-",
        "Mata Pelajaran": d.mata_pelajaran || "-",
        "Pendidikan Terakhir": d.pendidikan_terakhir || "-",
        "Status Pernikahan": d.status_pernikahan ? d.status_pernikahan.replace("_", " ") : "-",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai Lengkap");
    XLSX.writeFile(wb, "Data_Lengkap_Pegawai_Asatidz.xlsx");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* ─── HEADER BAR ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary-100 text-primary-800 rounded-2xl shrink-0 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Database Pegawai &amp; Asatidz</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Data induk civitas untuk absensi, kurikulum, dan SIAKAD</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Tambah Civitas Baru Button */}
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-800 to-primary-950 hover:from-primary-700 hover:to-primary-900 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-950/20 active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>+ Tambah Civitas</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* ─── KONTEN TABEL PEGAWAI (RESPONSIF & RAPI) ─── */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
        {/* Search & Counter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama civitas, kategori, jabatan, unit kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500 self-end sm:self-center bg-slate-100 px-3 py-1.5 rounded-lg">
            Total: <span className="text-primary-800 font-extrabold">{filteredData.length}</span> orang
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[960px]">
            <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap w-14 text-center">No</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[260px]">Nama Lengkap</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Kategori</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Jabatan / Divisi</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">Kontak</th>
                <th className="px-6 py-3.5 whitespace-nowrap w-48 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary-600" />
                    <p className="font-semibold text-sm">Memuat data civitas...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-base text-slate-700">Tidak ada data civitas ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tambahkan civitas baru.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((pegawai, index) => (
                  <tr
                    key={pegawai.id}
                    className="hover:bg-primary-50/40 transition-colors cursor-pointer group"
                    onClick={() => openDetailModal(pegawai, false)}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap text-center text-slate-400 font-semibold">{index + 1}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-800 group-hover:text-primary-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center text-xs text-slate-400 shadow-sm">
                          {pegawai.foto_url ? (
                            <img src={pegawai.foto_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="leading-tight">{formatName(pegawai.nama_lengkap)}</span>
                          {pegawai.nik && <span className="text-[11px] font-normal text-slate-400 font-mono">NIK: {pegawai.nik}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {pegawai.kategori_pegawai.split(",").map((kat, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                            kat.trim().toUpperCase().includes("GURU") 
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : kat.trim().toUpperCase().includes("MUSYRIF")
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : kat.trim().toUpperCase().includes("STAF")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : kat.trim().toUpperCase().includes("DAPUR")
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {kat.trim().replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      <div className="font-semibold text-slate-800">{pegawai.jabatan || "-"}</div>
                      {pegawai.divisi && <div className="text-xs text-slate-400">{pegawai.divisi}</div>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {pegawai.no_hp || "-"}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(pegawai, false)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-sm hover:border-slate-300"
                        >
                          Lihat Profil
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetailModal(pegawai, true)}
                          className="px-2.5 py-1.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePegawai(pegawai)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                          title="Hapus Civitas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── DETAIL, ADD & FULL EDIT MODAL (PLATINUM STANDARD) ─── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-primary-950/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {/* Header Modal */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-primary-900 to-primary-950 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-amber-300">
                    {isAddingNew ? <UserPlus className="w-5 h-5" /> : isEditing ? <Edit3 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      {isAddingNew 
                        ? "Input & Tambah Civitas Baru (Admin Super)" 
                        : isEditing 
                        ? "Edit Lengkap Data Civitas (Admin Super)" 
                        : "Detail Profil Civitas"}
                    </h2>
                    <p className="text-xs text-primary-200/80">
                      {isAddingNew 
                        ? "Bantu daftarkan data guru, musyrif, atau staf yang belum mengisi pendataan" 
                        : isEditing 
                        ? "Admin Super memiliki kewenangan penuh mengubah foto, jabatan, mapel & seluruh data identitas" 
                        : "Informasi lengkap data kepegawaian civitas"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal (Scrollable) */}
              <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
                
                {/* ─── BAGIAN ATAS: FOTO & NAMA UTAMA ─── */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
                  
                  {/* Foto Pasfoto + Upload / Ganti / Hapus */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0 relative group">
                      {(isEditing ? formData.foto_url : selectedPegawai?.foto_url) ? (
                        <img
                          src={(isEditing ? formData.foto_url : selectedPegawai?.foto_url) || ""}
                          alt={formData.nama_lengkap}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <Users className="w-12 h-12 mx-auto text-slate-300 mb-1" />
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Belum Ada Foto</span>
                        </div>
                      )}

                      {/* Loading Overlay when uploading */}
                      {uploadingFoto && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                          <span>Mengunggah...</span>
                        </div>
                      )}
                    </div>

                    {/* Foto Actions when Editing or Adding */}
                    {isEditing && (
                      <div className="flex flex-col gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => fotoInputRef.current?.click()}
                          disabled={uploadingFoto}
                          className="w-full py-1.5 px-2.5 bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{formData.foto_url ? "Ganti Foto" : "Upload Foto"}</span>
                        </button>
                        <input
                          ref={fotoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadFoto}
                        />

                        {formData.foto_url && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, foto_url: null }))}
                            className="w-full py-1 px-2 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus Foto</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Header Details (Nama Lengkap & Kategori / Jabatan) */}
                  <div className="flex-1 text-center md:text-left space-y-3 w-full">
                    {!isEditing && selectedPegawai ? (
                      <>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                          {formatName(selectedPegawai.nama_lengkap)}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                          {selectedPegawai.kategori_pegawai.split(",").map((k, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-900 rounded-full text-xs font-bold uppercase tracking-wider"
                            >
                              <Award className="w-3 h-3 text-primary-700" />
                              {k.trim().replace("_", " ")}
                            </span>
                          ))}
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          {selectedPegawai.jabatan || "Staf"} · {selectedPegawai.divisi || "Umum"} ({selectedPegawai.unit_kerja || "Pesantren Al-Imam"})
                        </p>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {/* Edit / Input Nama Lengkap */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                            Nama Lengkap &amp; Gelar Akademik <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nama_lengkap}
                            onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                            placeholder="Contoh: Ustadz Abdil Aziz, S.Pd, B.A"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>

                        {/* KATEGORI MULTI SELECTOR (CLICKABLE CARDS + CUSTOM TAGS) */}
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                            <span>Pilih Kategori Pegawai (Bisa Pilih Lebih Dari 1):</span>
                          </label>
                          
                          {/* Standard Options as Clickable Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {KATEGORI_OPTIONS.map((cat) => {
                              const isSelected = selectedKategoriList.includes(cat.value);
                              return (
                                <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => toggleKategori(cat.value)}
                                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                    isSelected
                                      ? "bg-primary-50 border-primary-600 ring-2 ring-primary-500/20 shadow-sm"
                                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected ? "bg-primary-600 text-white" : "border border-slate-300 bg-white"
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <div className={`text-xs font-bold ${isSelected ? "text-primary-950" : "text-slate-800"}`}>
                                      {cat.label}
                                    </div>
                                    <div className="text-[10px] text-slate-400 leading-tight">
                                      {cat.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Tag Adder */}
                          <div className="pt-2 space-y-2">
                            {selectedKategoriList.some((k) => !KATEGORI_OPTIONS.some((opt) => opt.value === k)) && (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori Lain:</span>
                                {selectedKategoriList
                                  .filter((k) => !KATEGORI_OPTIONS.some((opt) => opt.value === k))
                                  .map((custom) => (
                                    <span
                                      key={custom}
                                      className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-900 border border-primary-300 text-xs font-bold px-2.5 py-1 rounded-lg"
                                    >
                                      {custom}
                                      <button
                                        type="button"
                                        onClick={() => toggleKategori(custom)}
                                        className="text-primary-700 hover:text-red-600"
                                        title="Hapus"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customKategoriInput}
                                onChange={(e) => setCustomKategoriInput(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustomKategori();
                                  }
                                }}
                                placeholder="Tambah kategori kustom lainnya (misal: SATPAM, SOPIR)..."
                                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomKategori}
                                disabled={!customKategoriInput.trim()}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* JABATAN, DIVISI & UNIT KERJA */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Jabatan / Posisi</label>
                            <input 
                              type="text" 
                              value={formData.jabatan}
                              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                              placeholder="Contoh: Kasi Kurikulum"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Divisi</label>
                            <select
                              value={formData.divisi}
                              onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                            >
                              <option value="">— Pilih Divisi —</option>
                              {DIVISI_OPTIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Unit Kerja</label>
                            <input 
                              type="text" 
                              value={formData.unit_kerja}
                              onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                              placeholder="Contoh: Pesantren Al-Imam"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                            />
                          </div>
                        </div>

                        {/* PENUGASAN MAPEL (JIKA KATEGORI GURU AKTIF) */}
                        {selectedKategoriList.includes("GURU") && (
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              Penugasan Mata Pelajaran Mengajar (Khusus Guru / Asatidz)
                            </label>
                            <MapelSelector 
                              value={formData.mata_pelajaran || ""} 
                              onChange={(val) => setFormData({ ...formData, mata_pelajaran: val })} 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── BAGIAN BAWAH: DATA INDUK & IDENTITAS ─── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span>Data Induk Pribadi &amp; Kontak</span>
                    </h4>
                    {isEditing && (
                      <span className="text-xs text-primary-700 font-semibold bg-primary-50 px-2.5 py-1 rounded-lg">
                        {isAddingNew ? "Form Input Baru" : "Mode Edit Aktif"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {/* NIK */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">NIK (No. KTP)</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold font-mono">{selectedPegawai.nik || "-"}</p>
                      ) : (
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          placeholder="16 digit NIK"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-mono"
                        />
                      )}
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jenis Kelamin</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold">
                          {selectedPegawai.jenis_kelamin === "LAKI_LAKI" ? "Laki-laki" : selectedPegawai.jenis_kelamin === "PEREMPUAN" ? "Perempuan" : "-"}
                        </p>
                      ) : (
                        <select
                          value={formData.jenis_kelamin}
                          onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                        >
                          <option value="LAKI_LAKI">Laki-laki</option>
                          <option value="PEREMPUAN">Perempuan</option>
                        </select>
                      )}
                    </div>

                    {/* Tempat Lahir */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tempat Lahir</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold">{selectedPegawai.tempat_lahir || "-"}</p>
                      ) : (
                        <input
                          type="text"
                          value={formData.tempat_lahir}
                          onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                          placeholder="Kota kelahiran"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      )}
                    </div>

                    {/* Tanggal Lahir */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tanggal Lahir</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {selectedPegawai.tanggal_lahir
                            ? new Date(selectedPegawai.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                            : "-"}
                        </p>
                      ) : (
                        <input
                          type="date"
                          value={formData.tanggal_lahir}
                          onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      )}
                    </div>

                    {/* WhatsApp / No HP */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">WhatsApp / No. HP</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold flex items-center gap-1.5 font-mono">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {selectedPegawai.no_hp || "-"}
                        </p>
                      ) : (
                        <input
                          type="text"
                          value={formData.no_hp}
                          onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                          placeholder="08123456789"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-mono"
                        />
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {selectedPegawai.email || "-"}
                        </p>
                      ) : (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nama@email.com"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      )}
                    </div>

                    {/* Pendidikan Terakhir */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pendidikan Terakhir</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold">{selectedPegawai.pendidikan_terakhir || "-"}</p>
                      ) : (
                        <select
                          value={formData.pendidikan_terakhir}
                          onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                        >
                          <option value="">— Pilih Pendidikan —</option>
                          {PENDIDIKAN_OPTIONS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Status Pernikahan */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status Pernikahan</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-slate-400" />
                          {selectedPegawai.status_pernikahan ? selectedPegawai.status_pernikahan.replace("_", " ") : "-"}
                        </p>
                      ) : (
                        <select
                          value={formData.status_pernikahan}
                          onChange={(e) => setFormData({ ...formData, status_pernikahan: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
                        >
                          <option value="BELUM_MENIKAH">Belum Menikah</option>
                          <option value="MENIKAH">Menikah</option>
                          <option value="DUDA_JANDA">Duda / Janda</option>
                        </select>
                      )}
                    </div>

                    {/* Mapel Diajar (View Only Summary) */}
                    {!isEditing && selectedPegawai && (
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mata Pelajaran Diajar</span>
                        <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {selectedPegawai.mata_pelajaran || "-"}
                        </p>
                      </div>
                    )}

                    {/* Alamat */}
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Alamat Tinggal / Domisili</span>
                      {!isEditing && selectedPegawai ? (
                        <p className="text-slate-800 font-semibold flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{selectedPegawai.alamat || "-"}</span>
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          placeholder="Alamat lengkap domisili..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Modal */}
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-between shrink-0 items-center">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAddingNew) {
                          closeModal();
                        } else {
                          setIsEditing(false);
                        }
                      }}
                      disabled={saving}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50 text-sm cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || uploadingFoto}
                      className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isAddingNew ? "Simpan Civitas Baru" : "Simpan Perubahan"}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Data Civitas</span>
                      </button>
                      {selectedPegawai && (
                        <button
                          type="button"
                          onClick={() => handleDeletePegawai(selectedPegawai)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5 border border-red-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all text-sm cursor-pointer"
                    >
                      Tutup
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
