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
      cancelButtonText: "Batal",
    });

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary-600" />
            E-Office: Arsip Surat Keluar
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola penomoran dan arsip digital surat pesantren secara terpusat.
          </p>
        </div>
        <Link
          href="/dashboard/admin/arsip-surat/buat"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-5 h-5" />
          Buat Surat Baru
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat atau judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
          />
        </div>
        <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
          <Filter className="w-4 h-4" /> Filter Lanjutan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor & Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perihal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Divisi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data surat.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat) => (
                  <tr key={surat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{surat.nomor_surat}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1">{surat.judul}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Oleh: {surat.pembuat?.full_name || "Sistem"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                        {surat.kode_divisi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {surat.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                          <Edit className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button> */}
                        <button 
                          onClick={() => handleDelete(surat.id, surat.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            surat.status === "PUBLISHED" 
                            ? "text-slate-300 cursor-not-allowed" 
                            : "text-red-600 hover:bg-red-50"
                          }`}
                          disabled={surat.status === "PUBLISHED"}
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
