"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Plus,
  Star,
  Edit3,
  X } from "lucide-react";

interface TahunAjaran {
  id: string;
  nama: string;
  tahun_mulai: number;
  tahun_selesai: number;
  is_active: boolean;
  tanggal_buka_pendaftaran: string;
  tanggal_tutup_pendaftaran: string;
  biaya_pendaftaran: number;
}

export default function PengaturanPage() {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit State
  const [editingTa, setEditingTa] = useState<TahunAjaran | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama: "",
    tanggal_buka_pendaftaran: "",
    tanggal_tutup_pendaftaran: "",
    biaya_pendaftaran: 0,
    is_active: false });

  const fetchTahunAjaran = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tahun-ajaran/seed");
      if (response.ok) {
        const result = await response.json();
        setTahunAjaranList(result.all || []);
      }
    } catch (error) {
      console.error("Error fetching tahun ajaran:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const handleSeed2026 = async () => {
    try {
      setSeeding(true);
      setMessage(null);

      const response = await fetch("/api/admin/tahun-ajaran/seed", {
        method: "POST" });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        fetchTahunAjaran();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal menambahkan tahun ajaran" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSeeding(false);
    }
  };

  const startEdit = (ta: TahunAjaran) => {
    setEditingTa(ta);
    setEditFormData({
      nama: ta.nama,
      tanggal_buka_pendaftaran: ta.tanggal_buka_pendaftaran.split("T")[0],
      tanggal_tutup_pendaftaran: ta.tanggal_tutup_pendaftaran.split("T")[0],
      biaya_pendaftaran: Number(ta.biaya_pendaftaran),
      is_active: ta.is_active });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTa) return;

    try {
      setUpdating(true);
      setMessage(null);

      const response = await fetch(`/api/admin/tahun-ajaran/${editingTa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData) });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Tahun ajaran berhasil diperbarui" });
        setEditingTa(null);
        fetchTahunAjaran();
      } else {
        const err = await response.json();
        setMessage({
          type: "error",
          text: err.error || "Gagal memperbarui data" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    } finally {
      setUpdating(false);
    }
  };

  const activeTahunAjaran = tahunAjaranList.find((ta) => ta.is_active);
  const has2026 = tahunAjaranList.some(
    (ta) => ta.tahun_mulai === 2026 && ta.tahun_selesai === 2027,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-purple-500/20">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan</h2>
              <p className="text-slate-500 font-medium mt-1">Konfigurasi sistem SPMB</p>
            </div>
          </div>
          <button
            onClick={fetchTahunAjaran}
            disabled={loading}
            className="flex w-full md:w-auto justify-center items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="font-bold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border-2 ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Tahun Ajaran Section */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-slate-900">Tahun Ajaran</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Active Tahun Ajaran */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-700 mb-3">
                Tahun Ajaran Aktif
              </h4>
              {activeTahunAjaran ? (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Star className="w-8 h-8 text-emerald-600 fill-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xl font-black text-emerald-900">
                        {activeTahunAjaran.nama}
                      </p>
                      <p className="text-sm text-emerald-700 font-medium mt-1">
                        Pendaftaran:{" "}
                        <span className="font-bold">{formatDate(activeTahunAjaran.tanggal_buka_pendaftaran)}</span>{" "}
                        -{" "}
                        <span className="font-bold">{formatDate(
                          activeTahunAjaran.tanggal_tutup_pendaftaran,
                        )}</span>
                      </p>
                      <p className="text-sm text-emerald-700 mt-0.5">
                        Biaya:{" "}
                        <span className="font-bold">{formatCurrency(activeTahunAjaran.biaya_pendaftaran)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(activeTahunAjaran)}
                    className="p-3 bg-white text-emerald-600 rounded-2xl hover:shadow-md transition-all border border-emerald-200 w-full md:w-auto flex justify-center"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                  <p className="text-slate-600 font-medium text-center">
                    Tidak ada tahun ajaran yang aktif
                  </p>
                </div>
              )}
            </div>

            {/* Add 2026/2027 Button */}
            {!has2026 && (
              <div className="mb-8">
                <button
                  onClick={handleSeed2026}
                  disabled={seeding}
                  className="flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                >
                  {seeding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Tambah & Aktifkan Tahun Ajaran 2026/2027
                </button>
              </div>
            )}

            {/* All Tahun Ajaran */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">
                Semua Tahun Ajaran
              </h4>
              {tahunAjaranList.length === 0 ? (
                <div className="text-center py-10">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-sm border border-primary-50">
                      <Calendar className="w-10 h-10 text-primary-300" />
                    </div>
                  </div>
                  <h3 className="text-slate-900 text-lg font-black tracking-tight mb-1">
                    Belum Ada Data Tahun Ajaran
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Silakan tambahkan Tahun Ajaran baru untuk memulai operasional pendaftaran.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tahunAjaranList.map((ta) => (
                    <div key={ta.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{ta.nama}</span>
                          {ta.is_active && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full">Aktif</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatDate(ta.tanggal_buka_pendaftaran)} - {formatDate(ta.tanggal_tutup_pendaftaran)}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(ta)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {editingTa && (
        <div className="fixed inset-0 z-[9999] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center bg-stone-900/50 backdrop-blur-sm p-4 overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Tahun Ajaran</h3>
              <button
                onClick={() => setEditingTa(null)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  Nama Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={editFormData.nama}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, nama: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-purple-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">
                    Buka Pendaftaran
                  </label>
                  <input
                    type="date"
                    value={editFormData.tanggal_buka_pendaftaran}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tanggal_buka_pendaftaran: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">
                    Tutup Pendaftaran
                  </label>
                  <input
                    type="date"
                    value={editFormData.tanggal_tutup_pendaftaran}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tanggal_tutup_pendaftaran: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  Biaya Pendaftaran (Rp)
                </label>
                <input
                  type="number"
                  value={editFormData.biaya_pendaftaran}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      biaya_pendaftaran: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-purple-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editFormData.is_active}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-2 border-stone-300 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-bold text-stone-700"
                >
                  Aktifkan Tahun Ajaran Ini
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTa(null)}
                  className="flex-1 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
