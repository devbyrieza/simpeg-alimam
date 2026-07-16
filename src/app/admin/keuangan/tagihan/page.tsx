"use client";

import { useState, useEffect } from "react";
import { Search, FileText, CheckCircle2, Clock, Plus, Loader2 } from "lucide-react";

export default function ManajemenTagihanPage() {
  const [loading, setLoading] = useState(true);
  const [tagihan, setTagihan] = useState([]);
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      // In a real app, we fetch from /api/admin/keuangan/tagihan
      // For now, let's use dummy data to show the layout
      setTagihan([
        { id: 1, nama: "Khubaib Abdul Aziz", jenis: "SPP Bulan Juli 2026", nominal: 1500000, status: "pending", tanggal: "2026-07-01" },
        { id: 2, nama: "Khubaib Abdul Aziz", jenis: "Uang Kegiatan Tahunan", nominal: 800000, status: "lunas", tanggal: "2026-07-01" },
        { id: 3, nama: "Ahmad Fulan", jenis: "SPP Bulan Juli 2026", nominal: 1500000, status: "pending", tanggal: "2026-07-01" },
      ] as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihan();
  }, []);

  const handleGenerateSPP = async () => {
    setIsGenerating(true);
    setMessage({ text: "", type: "" });
    try {
      // Simulate API call to generate SPP for all active students
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ text: "Berhasil men-generate tagihan SPP Juli 2026 untuk seluruh santri aktif", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    } catch (err) {
      setMessage({ text: "Gagal men-generate tagihan", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Manajemen Tagihan</h1>
          <p className="text-slate-500 mt-1">Pantau pembayaran SPP bulanan, laundry, dan kegiatan santri.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari santri..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-maroon-500"
            />
          </div>
          <button 
            onClick={handleGenerateSPP}
            disabled={isGenerating}
            className="bg-maroon-600 hover:bg-maroon-700 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Generate SPP
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold shadow-sm animate-in fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <CheckCircle2 className="w-5 h-5" />
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Santri</th>
                <th className="p-4 font-bold">Jenis Tagihan</th>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold text-right">Nominal</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-maroon-500 mx-auto" />
                  </td>
                </tr>
              ) : tagihan.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{t.nama}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {t.jenis}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{t.tanggal}</td>
                  <td className="p-4 font-black text-slate-700 text-right">
                    Rp {t.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center">
                    {t.status === 'lunas' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <Clock className="w-3.5 h-3.5" /> Menunggu
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                     {t.status === 'pending' && (
                       <button className="text-xs font-bold text-maroon-600 hover:text-maroon-800 hover:underline">
                         Verifikasi Bayar
                       </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
