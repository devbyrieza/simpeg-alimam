"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FileText, Plus, Search, Filter, MoreVertical, 
  Eye, Edit, Trash2, Mail, CheckCircle2, XCircle
} from "lucide-react";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  nomor_surat: string;
  jenis_surat: string;
  kode_divisi: string;
  judul: string;
  tanggal_surat: string;
  status: "DRAFT" | "PUBLISHED";
  pembuat: { full_name: string } | null;
}

export default function ArsipSuratPage() {
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/surat-keluar");
      const json = await res.json();
      if (json.data) {
        setSuratList(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (status === "PUBLISHED") {
      Swal.fire("Gagal", "Surat yang sudah di-publish tidak dapat dihapus.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Hapus Surat?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal" });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/surat-keluar/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Berhasil", "Surat berhasil dihapus", "success");
          fetchSurat();
        } else {
          Swal.fire("Gagal", "Terjadi kesalahan saat menghapus surat.", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghubungi server", "error");
      }
    }
  };

  const filteredSurat = suratList.filter(s => 
    s.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
    s.judul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg shadow-primary-600/20 text-white">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Arsip Surat <span className="text-primary-700">Keluar</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Kelola penomoran dan arsip digital surat pesantren secara terpusat.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/arsip-surat/buat"
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Buat Surat Baru
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat atau judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm">
          <Filter className="w-4 h-4" /> Filter Lanjutan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nomor & Tanggal</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Perihal</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Divisi</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 font-bold">
                    Belum ada data surat.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat, index) => (
                  <tr key={surat.id} className={`hover:bg-slate-50/80 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{surat.nomor_surat}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        {new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{surat.judul}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Oleh: {surat.pembuat?.full_name || "Sistem"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-200">
                        {surat.kode_divisi}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {surat.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-200">
                          <Edit className="w-4 h-4" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(surat.id, surat.status)}
                          className={`p-2.5 rounded-xl transition-all ${
                            surat.status === "PUBLISHED" 
                            ? "text-slate-300 cursor-not-allowed bg-slate-50" 
                            : "text-red-600 bg-red-50 hover:bg-red-100 hover:scale-105 active:scale-95"
                          }`}
                          disabled={surat.status === "PUBLISHED"}
                          title="Hapus Surat"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
