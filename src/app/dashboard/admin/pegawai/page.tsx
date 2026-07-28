"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Search, Users, ShieldAlert, X, Calendar, Phone, Mail, MapPin, Award, Heart, Briefcase, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import Image from "next/image";

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

const formatName = (str: string) => {
  if (!str) return "-";
  return str.split(' ').map(word => {
    if (word.includes('.')) return word; // Biarkan singkatan gelar (misal B.A, S.Pd)
    // Jika semua huruf kapital (misal dari database) atau semua huruf kecil (wahyudi), kita format menjadi Title Case
    if (word === word.toUpperCase() || word === word.toLowerCase()) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  }).join(' ');
};

export default function AdminPegawaiPage() {
  const [data, setData] = useState<PegawaiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ kategori_pegawai: "", jabatan: "", unit_kerja: "", divisi: "", mata_pelajaran: "" });

  useEffect(() => {
    fetchPegawai();
  }, []);

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

  const filteredData = data.filter((p) =>
    p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategori_pegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.unit_kerja && p.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveEdit = async () => {
    if (!selectedPegawai) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pegawai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPegawai.id,
          ...editForm
        })
      });
      if (res.ok) {
        setIsEditing(false);
        fetchPegawai();
        setSelectedPegawai({ ...selectedPegawai, ...editForm });
      } else {
        alert("Gagal menyimpan perubahan");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
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
        "Status Pernikahan": d.status_pernikahan.replace("_", " ") || "-",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai Lengkap");
    XLSX.writeFile(wb, "Data_Lengkap_Pegawai_Asatidz.xlsx");
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 text-primary-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Database Pegawai & Asatidz</h1>
            <p className="text-slate-500 text-sm">Data induk untuk absensi dan SIAKAD</p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* Konten */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama, kategori, unit kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Total: {filteredData.length} orang
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap w-16 text-center">No</th>
                <th className="px-4 py-3 whitespace-nowrap">Nama Lengkap</th>
                <th className="px-4 py-3 whitespace-nowrap">Kategori</th>
                <th className="px-4 py-3 whitespace-nowrap">Jabatan</th>
                <th className="px-4 py-3 whitespace-nowrap">Kontak</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                    Belum ada data pegawai.
                  </td>
                </tr>
              ) : (
                filteredData.map((pegawai, index) => (
                  <tr key={pegawai.id} className="hover:bg-primary-50/50 transition-colors cursor-pointer group" onClick={() => { setSelectedPegawai(pegawai); setIsEditing(false); setEditForm({ kategori_pegawai: pegawai.kategori_pegawai, jabatan: pegawai.jabatan || "", unit_kerja: pegawai.unit_kerja || "", divisi: pegawai.divisi || "", mata_pelajaran: pegawai.mata_pelajaran || "" }); }}>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                      {formatName(pegawai.nama_lengkap)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {pegawai.kategori_pegawai.split(',').map((kat, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                            kat.trim().toUpperCase().includes('GURU') 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : kat.trim().toUpperCase().includes('MUSYRIF')
                              ? 'bg-purple-50 text-purple-600 border border-purple-200'
                              : kat.trim().toUpperCase().includes('STAF')
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {kat.trim().replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{pegawai.jabatan || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{pegawai.no_hp || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelectedPegawai(pegawai); setIsEditing(false); setEditForm({ kategori_pegawai: pegawai.kategori_pegawai, jabatan: pegawai.jabatan || "", unit_kerja: pegawai.unit_kerja || "", divisi: pegawai.divisi || "", mata_pelajaran: pegawai.mata_pelajaran || "" }); }}
                        className="px-3 py-1.5 bg-white hover:bg-primary-50 text-primary-600 border border-slate-200 hover:border-primary-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Lihat Profil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPegawai && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPegawai(null)}
              className="absolute inset-0 bg-primary-950/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-6 md:p-8 flex justify-between items-center text-white shrink-0" style={{ backgroundColor: "#3b0a0a" }}>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white/80" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Detail Profil Civitas</h2>
                    <p className="text-xs text-white/80">Informasi lengkap data kepegawaian</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPegawai(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 no-scrollbar flex-1">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 pb-6 border-b border-slate-100">
                  {/* Photo area */}
                  <div className="w-32 h-40 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {selectedPegawai.foto_url ? (
                      <img
                        src={selectedPegawai.foto_url}
                        alt={selectedPegawai.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">No Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Top Details */}
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                      {formatName(selectedPegawai.nama_lengkap)}
                    </h3>
                    {!isEditing ? (
                      <>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-100 text-primary-900 rounded-full text-xs font-bold uppercase tracking-wider">
                          <Award className="w-3.5 h-3.5" />
                          {selectedPegawai.kategori_pegawai.replace("_", " ")}
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          {selectedPegawai.jabatan || "Staf"} · {selectedPegawai.divisi || "Umum"}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-4 mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Kategori Pegawai (Bisa lebih dari 1, pisahkan dengan koma)</label>
                          <input 
                            type="text" 
                            value={editForm.kategori_pegawai}
                            onChange={(e) => setEditForm({...editForm, kategori_pegawai: e.target.value.toUpperCase()})}
                            placeholder="Contoh: GURU,MUSYRIF"
                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={(editForm?.kategori_pegawai || "").toUpperCase().includes("GURU") ? "" : "col-span-1 md:col-span-2"}>
                            <label className="text-xs font-bold text-slate-500 uppercase">Jabatan</label>
                            <input 
                              type="text" 
                              value={editForm.jabatan}
                              onChange={(e) => setEditForm({...editForm, jabatan: e.target.value})}
                              placeholder="Contoh: Kasi IT, Musyrif"
                              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          {(editForm?.kategori_pegawai || "").toUpperCase().includes("GURU") && (
                            <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Mapel / Mengajar</label>
                              <select
                                value={editForm.mata_pelajaran}
                                onChange={(e) => setEditForm({...editForm, mata_pelajaran: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              >
                                <option value="">Tidak Mengajar / Pilih Mapel...</option>
                                <option value="Al-Qur'an (Tahfidz)">Al-Qur'an (Tahfidz / Tahsin)</option>
                                <option value="Bahasa Arab">Bahasa Arab (Nahwu / Sharaf / Durusul Lughah)</option>
                                <option value="Fiqih">Fiqih</option>
                                <option value="Aqidah">Aqidah</option>
                                <option value="Hadits">Hadits</option>
                                <option value="Tafsir">Tafsir</option>
                                <option value="Tarikh">Tarikh / Sejarah Kebudayaan Islam</option>
                                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                <option value="Bahasa Inggris">Bahasa Inggris</option>
                                <option value="Matematika">Matematika</option>
                                <option value="IPA">IPA (Fisika / Biologi)</option>
                                <option value="IPS">IPS</option>
                                <option value="PKn">Pendidikan Pancasila & Kewarganegaraan</option>
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Divisi</label>
                            <input 
                              type="text" 
                              value={editForm.divisi}
                              onChange={(e) => setEditForm({...editForm, divisi: e.target.value})}
                              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Unit Kerja</label>
                            <input 
                              type="text" 
                              value={editForm.unit_kerja}
                              onChange={(e) => setEditForm({...editForm, unit_kerja: e.target.value})}
                              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* NIK */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">NIK (No. KTP)</span>
                    <p className="text-slate-800 text-sm font-semibold">{selectedPegawai.nik || "-"}</p>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Jenis Kelamin</span>
                    <p className="text-slate-800 text-sm font-semibold">
                      {selectedPegawai.jenis_kelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>

                  {/* TTL */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Tempat / Tanggal Lahir</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {selectedPegawai.tempat_lahir || "-"}, {selectedPegawai.tanggal_lahir ? new Date(selectedPegawai.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  </div>

                  {/* Kontak */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">WhatsApp / No. HP</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selectedPegawai.no_hp || "-"}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Email</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {selectedPegawai.email || "-"}
                    </p>
                  </div>

                  {/* Pendidikan */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Pendidikan Terakhir</span>
                    <p className="text-slate-800 text-sm font-semibold">{selectedPegawai.pendidikan_terakhir || "-"}</p>
                  </div>

                  {/* Status Pernikahan */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Status Pernikahan</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-slate-400" />
                      {selectedPegawai.status_pernikahan ? selectedPegawai.status_pernikahan.replace("_", " ") : "-"}
                    </p>
                  </div>

                  {/* Mapel */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Mata Pelajaran Diajar</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {selectedPegawai.mata_pelajaran || "-"}
                    </p>
                  </div>

                  {/* Alamat */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Alamat Tinggal / Domisili</span>
                    <p className="text-slate-800 text-sm font-semibold flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedPegawai.alamat || "-"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between shrink-0 items-center">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl transition-all"
                    >
                      Edit Kategori / Posisi
                    </button>
                    <button
                      onClick={() => setSelectedPegawai(null)}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
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
