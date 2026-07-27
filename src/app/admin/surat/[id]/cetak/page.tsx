"use client";

import { useEffect, useState, use } from "react";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  nomor_surat: string;
  jenis_surat: string;
  kode_divisi: string;
  judul: string;
  perihal: string;
  tanggal_surat: string;
  isi_singkat: string;
  penerima: string;
  pembuat: { full_name: string } | null;
}

export default function CetakSuratPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [surat, setSurat] = useState<Surat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/surat/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSurat(data.data);
      })
      .catch(err => Swal.fire("Gagal", err.message, "error"))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-gold-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!surat) return <div className="p-8 text-center text-slate-500">Surat tidak ditemukan.</div>;

  const tanggalFormatted = new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-12 print:bg-white print:pb-0">
      
      {/* Control Bar (Hidden on Print) */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden shadow-sm">
        <Link href="/admin/surat" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <button onClick={handlePrint} className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gold-600/20 transition-all">
          <Printer className="w-5 h-5" /> Cetak / Save PDF
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="mx-auto mt-8 bg-white shadow-xl overflow-hidden print:shadow-none print:mt-0 relative"
           style={{ width: "210mm", minHeight: "297mm", padding: "20mm" }}>
        
        {/* Watermark Logo (Optional) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <img src="/logo-alimam.png" alt="watermark" className="w-[120mm] h-[120mm] object-contain grayscale" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10">
          
          {/* Kop Surat */}
          <div className="flex items-center gap-6 border-b-[3px] border-double border-black pb-4 mb-6">
            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
               <img src="/logo-alimam.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-400">LOGO</div>'; }} />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-black text-green-800 tracking-wide">YAYASAN AL IMAM AL ISLAMI</h1>
              <h2 className="text-2xl font-black text-black mt-1">PESANTREN AL-IMAM AL-ISLAMI</h2>
              <p className="text-sm text-slate-700 mt-1">
                Jl. Raya Jatinom - Boyolali Km. 5, Gedaren, Jatinom, Klaten, Jawa Tengah
              </p>
              <p className="text-sm text-slate-700">
                Telp: 0812-3456-7890 | Web: www.al-imam.ponpes.id | Email: info@al-imam.ponpes.id
              </p>
            </div>
          </div>

          {/* Metadata Surat */}
          <div className="flex justify-between items-start mb-8 text-black text-[15px]">
            <div>
              <table className="border-none">
                <tbody>
                  <tr><td className="w-24 py-1">Nomor</td><td className="px-2">:</td><td className="font-bold">{surat.nomor_surat}</td></tr>
                  <tr><td className="w-24 py-1">Lampiran</td><td className="px-2">:</td><td>-</td></tr>
                  <tr><td className="w-24 py-1 align-top">Perihal</td><td className="px-2 align-top">:</td><td className="font-bold">{surat.perihal}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="text-right">
              Klaten, {tanggalFormatted}
            </div>
          </div>

          {/* Penerima */}
          {surat.penerima && (
            <div className="mb-8 text-black text-[15px]">
              <p>Kepada Yth,</p>
              <p className="font-bold">{surat.penerima}</p>
              <p>Di Tempat</p>
            </div>
          )}

          {/* Isi Surat (Rich Text rendered here) */}
          <div 
            className="text-black text-[15px] leading-relaxed text-justify space-y-4 mb-16 ql-editor-print"
            dangerouslySetInnerHTML={{ __html: surat.isi_singkat || "<p><i>Isi surat belum ditulis.</i></p>" }}
          />

          {/* Tanda Tangan */}
          <div className="flex justify-end text-black text-[15px]">
            <div className="text-center w-64 relative">
              <p className="mb-24">Mengetahui,</p>
              
              {/* Tempat Stempel & TTD Asli (Placeholder) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-24 flex items-center justify-center opacity-30 pointer-events-none z-[-1]">
                <div className="w-20 h-20 border-4 border-blue-600 text-blue-600 rounded-full flex flex-col items-center justify-center rotate-[-15deg]">
                  <span className="text-[10px] font-black uppercase">Stempel</span>
                  <span className="text-[10px] font-black uppercase">Yayasan</span>
                </div>
              </div>

              <p className="font-bold underline">Ustadz Wahab, S.Pd.I.</p>
              <p>Mudir Pesantren Al-Imam</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Print styles override specific to Quill elements if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 0; }
        }
        .ql-editor-print p { margin-bottom: 0.5rem; }
        .ql-editor-print ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ql-editor-print ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ql-editor-print strong, .ql-editor-print b { font-weight: bold; }
        .ql-editor-print i, .ql-editor-print em { font-style: italic; }
        .ql-editor-print u { text-decoration: underline; }
      `}} />
    </div>
  );
}
