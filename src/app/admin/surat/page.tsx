"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  nomor_surat: string;
  judul: string;
  perihal: string;
  jenis_surat: string;
  kode_divisi: string;
  tanggal_surat: string;
  status: string;
  pembuat: { full_name: string } | null;
}

export default function DaftarSuratPage() {
  const [surats, setSurats] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("");

  const fetchSurats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surat?limit=50&q=${search}&divisi=${filterDivisi}`);
      const data = await res.json();
      if (res.ok) setSurats(data.data || []);
      else throw new Error(data.error);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSurats, 500);
    return () => clearTimeout(timer);
  }, [search, filterDivisi]);

  const badgeColor = (status: string) => {
    if (status === "PUBLISHED") return "bg-green-100 text-green-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-gold-600" />
            Arsip Persuratan
          </h1>
          <p className="text-slate-500 mt-1">Kelola data surat keluar Al-Imam (Undangan, Edaran, SK)</p>
        </div>
        <Link 
          href="/admin/surat/tambah" 
          className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-gold-600/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Buat Surat Baru
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Nomor Surat, Judul, atau Perihal..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
            />
          </div>
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
            value={filterDivisi}
            onChange={(e) => setFilterDivisi(e.target.value)}
          >
            <option value="">Semua Divisi</option>
            <option value="TU">Tata Usaha (TU)</option>
            <option value="KS">Kesantrian (KS)</option>
            <option value="AK">Akademik (AK)</option>
            <option value="KU">Keuangan (KU)</option>
            <option value="PSB">PSB (PSB)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-200">
                <th className="px-6 py-4">Nomor & Tanggal</th>
                <th className="px-6 py-4">Perihal</th>
                <th className="px-6 py-4">Divisi / Pembuat</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gold-500" />
                    Memuat arsip surat...
                  </td>
                </tr>
              ) : surats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Belum ada data surat.
                  </td>
                </tr>
              ) : (
                surats.map((surat) => (
                  <tr key={surat.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{surat.nomor_surat}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{surat.judul}</div>
                      <div className="text-sm text-slate-500 line-clamp-1">{surat.perihal}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold mb-1">
                        {surat.kode_divisi}
                      </div>
                      <div className="text-sm text-slate-500">{surat.pembuat?.full_name || 'Admin'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor(surat.status)}`}>
                        {surat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-gold-600 transition-colors p-2" title="Unduh">
                        <Download className="w-5 h-5" />
                      </button>
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
