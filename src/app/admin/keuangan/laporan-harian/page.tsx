"use client";

import { useState, useEffect } from "react";
import { Printer, Calendar, Search, FileText, CheckCircle2, TrendingUp } from "lucide-react";

export default function LaporanHarianPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [laporanData, setLaporanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporanData();
  }, [date]);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/keuangan/laporan?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setLaporanData(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan", error);
    } finally {
      setLoading(false);
    }
  };

  const ringkasan = laporanData?.ringkasan || {
    totalTransaksi: 0,
    totalNominal: 0,
    topupKantin: 0,
    pemasukanSPP: 0
  };

  const riwayat = laporanData?.riwayat || [];

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Rekap & Tutup Kasir</h1>
          <p className="text-slate-500 mt-1">Laporan harian mutasi keuangan dan transaksi kantin.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border border-slate-200 font-bold text-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-maroon-500"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 print:shadow-none print:border-none print:p-0">
        
        {/* Laporan Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">PESANTREN AL IMAM</h2>
          <p className="text-slate-600 font-medium">Laporan Keuangan & Operasional Kantin Harian</p>
          <p className="text-sm font-bold mt-2 bg-slate-100 inline-block px-4 py-1 rounded-full">
            Tanggal: {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Pemasukan Keuangan (SPP/Top-Up)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-600">Total Pembayaran SPP/Tagihan</span>
                <span className="font-black text-slate-900">Rp {ringkasan.pemasukanSPP.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-600">Total Top-Up Saldo Jajan</span>
                <span className="font-black text-slate-900">Rp 5.000.000</span>
              </div>
            </div>
          </div>

          <div className="bg-maroon-50 p-6 rounded-2xl border border-maroon-100">
            <h3 className="text-sm font-bold text-maroon-700 uppercase mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Operasional Kantin (E-Money)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-maroon-200 pb-2">
                <span className="font-medium text-maroon-800">Jumlah Transaksi (Struk)</span>
                <span className="font-black text-maroon-900">{ringkasan.totalTransaksi} Trx</span>
              </div>
              <div className="flex justify-between items-center border-b border-maroon-200 pb-2">
                <span className="font-medium text-maroon-800">Total Omzet Kantin Hari Ini</span>
                <span className="font-black text-maroon-900 text-xl">Rp {ringkasan.totalNominal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Penjualan */}
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-4">Rincian Transaksi Terakhir</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 font-bold rounded-tl-xl">Waktu</th>
                <th className="p-3 font-bold">Santri</th>
                <th className="p-3 font-bold">Keterangan</th>
                <th className="p-3 font-bold text-right rounded-tr-xl">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Memuat data transaksi...</td>
                </tr>
              ) : riwayat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Belum ada transaksi ZAD pada hari ini.</td>
                </tr>
              ) : (
                riwayat.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="p-3 text-slate-600">{tx.waktu}</td>
                    <td className="p-3 font-bold text-slate-800">{tx.santri}</td>
                    <td className="p-3 text-slate-600">{tx.keterangan}</td>
                    <td className="p-3 font-black text-right">Rp {tx.nominal.toLocaleString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="p-4 text-right font-black text-slate-800 uppercase">Total Akhir Omzet Kantin:</td>
                <td className="p-4 text-right font-black text-maroon-700 text-xl">Rp {ringkasan.totalNominal.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-16 flex justify-between px-10">
          <div className="text-center">
            <p className="text-slate-500 mb-20">Petugas Kantin</p>
            <p className="font-bold text-slate-900 underline decoration-2 underline-offset-4">_______________________</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 mb-20">Keuangan / Finance</p>
            <p className="font-bold text-slate-900 underline decoration-2 underline-offset-4">Bpk. Bachtiar</p>
          </div>
        </div>

      </div>
    </div>
  );
}
