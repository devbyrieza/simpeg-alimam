"use client";

import { useEffect, useState } from "react";
import { PrismaClient } from "@prisma/client";
import { motion } from "framer-motion";
import { Download, Search, Users, ShieldAlert } from "lucide-react";
import * as XLSX from "xlsx";

// Kita ambil data dari API route /api/admin/pegawai
interface PegawaiData {
  id: string;
  nama_lengkap: string;
  nik: string;
  jenis_kelamin: string;
  no_hp: string;
  kategori_pegawai: string;
  unit_kerja: string;
  jabatan: string;
}

export default function AdminPegawaiPage() {
  const [data, setData] = useState<PegawaiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((d, index) => ({
        No: index + 1,
        "Nama Lengkap": d.nama_lengkap,
        "Kategori": d.kategori_pegawai,
        "Unit Kerja": d.unit_kerja || "-",
        "Jabatan": d.jabatan || "-",
        "No HP": d.no_hp || "-",
        "NIK": d.nik || "-",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai");
    XLSX.writeFile(wb, "Data_Pegawai_Asatidz.xlsx");
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
                <th className="px-6 py-4 whitespace-nowrap">No</th>
                <th className="px-6 py-4 whitespace-nowrap">Nama Lengkap</th>
                <th className="px-6 py-4 whitespace-nowrap">Kategori</th>
                <th className="px-6 py-4 whitespace-nowrap">Unit Kerja</th>
                <th className="px-6 py-4 whitespace-nowrap">Jabatan</th>
                <th className="px-6 py-4 whitespace-nowrap">Kontak</th>
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
                  <tr key={pegawai.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                      {pegawai.nama_lengkap}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                        pegawai.kategori_pegawai === 'ASATIDZ' 
                          ? 'bg-blue-100 text-blue-700'
                          : pegawai.kategori_pegawai === 'MUSYRIF'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }\`}>
                        {pegawai.kategori_pegawai.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{pegawai.unit_kerja || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pegawai.jabatan || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pegawai.no_hp || "-"}</td>
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
