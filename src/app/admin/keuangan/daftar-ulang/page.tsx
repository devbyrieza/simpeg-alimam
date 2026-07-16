"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";

export default function DaftarUlangPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Dummy data for presentation
    setData([
      { id: 1, nama: "Khubaib Abdul Aziz", jenjang: "I'dad Lughowi", status: "lunas", cicilan: 0, sisa: 0, total: 15000000 },
      { id: 2, nama: "Ahmad Fulan", jenjang: "MTs", status: "cicilan", cicilan: 2, sisa: 10000000, total: 15000000 },
      { id: 3, nama: "Budi Santoso", jenjang: "MTs", status: "belum", cicilan: 0, sisa: 15000000, total: 15000000 },
    ]);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Rekap Daftar Ulang</h1>
        <p className="text-slate-500 mt-1">Pantau pembayaran uang pangkal santri baru yang terintegrasi dari portal PPDB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Lunas</p>
            <p className="text-2xl font-black text-slate-800">1 <span className="text-sm font-medium text-slate-400">Santri</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Mencicil</p>
            <p className="text-2xl font-black text-slate-800">1 <span className="text-sm font-medium text-slate-400">Santri</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Belum Bayar</p>
            <p className="text-2xl font-black text-slate-800">1 <span className="text-sm font-medium text-slate-400">Santri</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Santri</th>
              <th className="p-4 text-center">Status Daftar Ulang</th>
              <th className="p-4 text-right">Sisa Tagihan</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{item.nama}</p>
                  <p className="text-xs text-slate-500">{item.jenjang}</p>
                </td>
                <td className="p-4 text-center">
                  {item.status === 'lunas' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">LUNAS</span>}
                  {item.status === 'cicilan' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">CICILAN KE-{item.cicilan}</span>}
                  {item.status === 'belum' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">BELUM BAYAR</span>}
                </td>
                <td className="p-4 text-right font-black text-slate-700">
                  Rp {item.sisa.toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-center">
                  <button className="text-xs font-bold text-maroon-600 hover:text-maroon-800 underline">
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
