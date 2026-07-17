import { PrismaClient } from "@prisma/client";
import { Users, FileDown, Search, User } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function AdminPendataanPage() {
  const data = await prisma.pegawai.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-700" />
            Monitoring Pendataan Civitas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Database rekapitulasi pengisian formulir data diri civitas Al-Imam Al-Islami.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-700 transition-all shrink-0">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Mengisi</p>
          <p className="text-3xl font-black text-slate-800">{data.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-medium text-slate-500 mb-1">Guru & Musyrif</p>
          <p className="text-3xl font-black text-primary-700">
            {data.filter(d => d.kategori_pegawai.includes("GURU") || d.kategori_pegawai.includes("MUSYRIF")).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-medium text-slate-500 mb-1">Staf & Kantor</p>
          <p className="text-3xl font-black text-blue-700">
            {data.filter(d => d.kategori_pegawai.includes("STAF")).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-medium text-slate-500 mb-1">Dapur / Lainnya</p>
          <p className="text-3xl font-black text-emerald-700">
            {data.filter(d => d.kategori_pegawai.includes("DAPUR") || d.kategori_pegawai.includes("UMUM")).length}
          </p>
        </div>
      </div>

      {/* Table Container - The Siakad Standard for Data Density */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Divisi / Jabatan</th>
                <th className="px-4 py-3">Waktu Isi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 bg-slate-50/30">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    Belum ada data civitas yang masuk.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {item.foto_url ? (
                            <img src={item.foto_url} alt="Foto" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.nama_lengkap}</p>
                          <p className="text-[11px] text-slate-400">{item.tempat_lahir || "-"}, {item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{item.no_hp || "-"}</p>
                      {item.email && <p className="text-[11px] text-slate-400">{item.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.kategori_pegawai.split(",").map(cat => (
                          <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{item.divisi || "Tanpa Divisi"}</p>
                      <p className="text-[11px] text-slate-400">{item.jabatan || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
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
