"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Clock, MapPin, Search, Edit2, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface KalenderAkademik {
  id: string;
  nama_kegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kategori: string;
  deskripsi: string | null;
  is_libur: boolean;
  warna_label: string;
}

const BULAN_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function KalenderAkademikPage() {
  const [agendas, setAgendas] = useState<KalenderAkademik[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kalender`);
      const data = await res.json();
      if (res.ok) setAgendas(data.data || []);
      else throw new Error(data.error);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const formatTanggalRange = (start: string, end: string) => {
    const ds = new Date(start);
    const de = new Date(end);
    if (ds.getTime() === de.getTime()) {
      return `${ds.getDate()} ${BULAN_NAMES[ds.getMonth()]} ${ds.getFullYear()}`;
    }
    if (ds.getMonth() === de.getMonth() && ds.getFullYear() === de.getFullYear()) {
      return `${ds.getDate()} - ${de.getDate()} ${BULAN_NAMES[ds.getMonth()]} ${ds.getFullYear()}`;
    }
    return `${ds.getDate()} ${BULAN_NAMES[ds.getMonth()]} - ${de.getDate()} ${BULAN_NAMES[de.getMonth()]} ${de.getFullYear()}`;
  };

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "AKADEMIK": return "bg-blue-100 text-blue-700";
      case "LIBUR": return "bg-red-100 text-red-700";
      case "PSB": return "bg-purple-100 text-purple-700";
      case "ASRAMA": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  // Grouping by Month-Year
  const groupedAgendas: Record<string, KalenderAkademik[]> = {};
  agendas
    .filter(a => a.nama_kegiatan.toLowerCase().includes(search.toLowerCase()))
    .forEach(agenda => {
      const date = new Date(agenda.tanggal_mulai);
      const key = `${BULAN_NAMES[date.getMonth()]} ${date.getFullYear()}`;
      if (!groupedAgendas[key]) groupedAgendas[key] = [];
      groupedAgendas[key].push(agenda);
    });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary-600" />
            Kalender Akademik
          </h1>
          <p className="text-slate-500 mt-1">Agenda kegiatan tahunan Pesantren Al-Imam Al-Islami.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/kalender/tambah" 
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Agenda
          </Link>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari kegiatan (Misal: PTS, Idul Adha)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm bg-white"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-gold-500 mb-4" />
          <p className="text-slate-500 font-bold">Memuat agenda tahunan...</p>
        </div>
      ) : Object.keys(groupedAgendas).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 text-center px-4">
          <Calendar className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Tidak ada kegiatan ditemukan</h3>
          <p className="text-slate-500 mt-2 max-w-md">Belum ada agenda yang dijadwalkan, atau kata kunci pencarian Anda tidak cocok dengan agenda manapun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedAgendas).map(([monthYear, items]) => (
            <div key={monthYear} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-900 px-5 py-4 border-b border-slate-800">
                <h2 className="text-lg font-black text-white">{monthYear}</h2>
              </div>
              <div className="flex-1 p-4 space-y-4">
                {items.map((agenda) => (
                  <div key={agenda.id} className="group relative border-l-4 pl-4 py-1" style={{ borderLeftColor: agenda.is_libur ? '#ef4444' : '#c9983a' }}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-bold text-[15px] leading-tight ${agenda.is_libur ? 'text-red-600' : 'text-slate-900'}`}>
                        {agenda.nama_kegiatan}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${getKategoriBadge(agenda.kategori)}`}>
                        {agenda.kategori}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTanggalRange(agenda.tanggal_mulai, agenda.tanggal_selesai)}
                    </div>
                    {agenda.deskripsi && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {agenda.deskripsi}
                      </p>
                    )}
                    
                    {/* Action buttons show on hover */}
                    <div className="absolute top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex gap-1 shadow-sm border border-slate-100">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
