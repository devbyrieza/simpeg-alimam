"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, Trash2, Mail, CheckCircle2, Edit, User
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
      const res = await fetch("/api/surat");
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
        const res = await fetch(`/api/surat/${id}`, { method: "DELETE" });
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
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            Arsip Surat Keluar
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola penomoran dan arsip digital surat pesantren secara terpusat.
          </p>
        </div>
        <Link
          href="/dashboard/surat/buat"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          Buat Surat Baru
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat atau judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all outline-none"
          />
        </div>
        <button className="px-6 py-3.5 bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors">
          <Filter className="w-4 h-4" /> Filter Lanjutan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Nomor & Tanggal</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Perihal</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Divisi</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                      <span className="font-bold tracking-tight">Memuat data arsip...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500 font-bold">
                    Belum ada data surat ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat, index) => (
                  <tr key={surat.id} className={`transition-all hover:bg-slate-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-black text-slate-900 tracking-tight">{surat.nomor_surat}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        {new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-4 min-w-[250px]">
                      <p className="font-bold text-slate-800 line-clamp-2">{surat.judul}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> {surat.pembuat?.full_name || "Sistem"}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200/60 shadow-sm">
                        {surat.kode_divisi}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {surat.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-200 shadow-sm shadow-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 shadow-sm">
                          <Edit className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(surat.id, surat.status)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm ${
                            surat.status === "PUBLISHED" 
                            ? "text-slate-300 bg-slate-50 cursor-not-allowed border border-transparent" 
                            : "text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 hover:-translate-y-0.5"
                          }`}
                          disabled={surat.status === "PUBLISHED"}
                          title={surat.status === "PUBLISHED" ? "Tidak dapat dihapus" : "Hapus Surat"}
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
