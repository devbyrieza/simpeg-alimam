"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Printer, Loader2, CheckCircle2 } from "lucide-react";
import KartuJajanPrint from "@/components/admin/KartuJajanPrint";

interface Santri {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
}

export default function AdminKartuJajanPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSantri();
  }, []);

  const fetchSantri = async () => {
    try {
      const res = await fetch("/api/admin/santri");
      const data = await res.json();
      if (data.success) {
        setSantriList(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data santri", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cetak Kartu Jajan</h1>
          <p className="text-slate-500 mt-1">Daftar santri yang telah Diterima dan siap dicetak ID Card-nya.</p>
        </div>
        
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
        >
          <Printer className="w-5 h-5" />
          Cetak {santriList.length} Kartu
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Table List (Left Side) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-700">
              <Users className="w-5 h-5 text-gold-500" />
              Daftar Santri ({santriList.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black">
                <tr>
                  <th className="px-4 py-3">No. Reg</th>
                  <th className="px-4 py-3">Nama Santri</th>
                  <th className="px-4 py-3">Jenjang</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {santriList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-600 font-bold">{santri.nomor_pendaftaran}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{santri.nama_lengkap}</td>
                    <td className="px-4 py-3 text-slate-600">{santri.jenjang}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold bg-green-50 py-1 px-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> Diterima
                      </div>
                    </td>
                  </tr>
                ))}
                {santriList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">Belum ada data santri yang diterima.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Preview (Right Side) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 sticky top-6">
            <h3 className="font-bold text-slate-700 mb-4 text-center text-sm uppercase tracking-widest">Preview Desain Cetak</h3>
            
            {/* The Print Area (Hidden during normal view, only shows during print, but we show a preview wrapper here) */}
            <div className="flex flex-col gap-6 items-center overflow-y-auto max-h-[600px] pb-4">
              {santriList.slice(0, 1).map((santri) => (
                <div key={"preview-" + santri.id} className="scale-100 origin-top transform-gpu shadow-xl rounded-lg">
                  <KartuJajanPrint santri={santri} />
                </div>
              ))}
              <p className="text-xs text-center text-slate-500 mt-2">
                *Hanya menampilkan 1 preview.<br/>Saat dicetak, seluruh {santriList.length} kartu akan di-render.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Container - This holds all cards for the actual print out */}
      <div className="hidden">
        <div ref={printRef} className="print-container">
          <style type="text/css" media="print">
            {`
              @page { size: A4 portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .print-container { 
                display: flex !important; 
                flex-wrap: wrap !important; 
                gap: 10mm !important; 
                justify-content: flex-start !important;
                background: white;
              }
              .print-container > div {
                page-break-inside: avoid;
              }
            `}
          </style>
          {santriList.map((santri) => (
            <div key={"print-" + santri.id}>
              <KartuJajanPrint santri={santri} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
