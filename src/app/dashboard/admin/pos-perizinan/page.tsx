"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function POSPerizinan() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"KELUAR" | "KEMBALI">("KELUAR");
  const [santriData, setSantriData] = useState<any>(null);
  
  // Form khusus izin keluar
  const [jenisIzin, setJenisIzin] = useState("KELUAR_PONDOK");
  const [alasan, setAlasan] = useState("");
  const [batasKembali, setBatasKembali] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input agar selalu siap menerima scan barcode
  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current && !santriData) {
        inputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [santriData]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode) return;

    if (mode === "KELUAR") {
      // Jika mode keluar, kita cek identitas dulu
      setLoading(true);
      try {
        const res = await fetch(`/api/dompet/cek-saldo?qr_code=${qrCode}`);
        const data = await res.json();
        
        if (data.success) {
          setSantriData(data.data);
          toast.success("Kartu dikenali, lengkapi data izin");
        } else {
          toast.error(data.error || "Kartu tidak valid");
          setQrCode("");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan jaringan");
      } finally {
        setLoading(false);
      }
    } else {
      // Jika mode kembali, langsung proses absen kembali
      handleProsesKembali(qrCode);
    }
  };

  const handleProsesKeluar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode || !alasan) return;

    setLoading(true);
    try {
      const res = await fetch("/api/perizinan/keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_code_string: qrCode,
          pemberi_izin_id: "00000000-0000-0000-0000-000000000000", // TODO: Ambil dari session admin
          jenis_izin: jenisIzin,
          alasan: alasan,
          batas_kembali: batasKembali ? new Date(batasKembali).toISOString() : null
        }) });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`Berhasil mencatat izin keluar untuk ${data.data.nama}`);
        resetForm();
      } else {
        toast.error(data.error || "Gagal mencatat izin");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleProsesKembali = async (scannedQr: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/perizinan/kembali", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code_string: scannedQr }) });

      const data = await res.json();
      
      if (data.success) {
        if (data.data.keterlambatan) {
          toast.error(`SANTRI TERLAMBAT! ${data.data.nama} sudah dicatat kembali.`);
        } else {
          toast.success(`Berhasil! ${data.data.nama} dicatat kembali tepat waktu.`);
        }
        setQrCode("");
      } else {
        toast.error(data.error || "Gagal memproses absensi kembali");
        setQrCode("");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const resetForm = () => {
    setQrCode("");
    setSantriData(null);
    setAlasan("");
    setBatasKembali("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Gerbang Perizinan Santri
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Sistem Point of Sale Perizinan Keluar-Masuk Pondok berbasis QR Code Santri.
          </p>
        </div>
      </div>
      
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <button
          onClick={() => { setMode("KELUAR"); resetForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-lg transition-all ${
            mode === "KELUAR" 
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]" 
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm"
          }`}
        >
          SCAN KELUAR PONDOK <ArrowUpRight className="w-6 h-6" />
        </button>
        <button
          onClick={() => { setMode("KEMBALI"); resetForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-lg transition-all ${
            mode === "KEMBALI" 
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]" 
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm"
          }`}
        >
          SCAN KEMBALI <ArrowDownLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Scan */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            {mode === "KELUAR" ? "1. Scan Kartu" : "Silakan Scan Kartu"}
          </h2>
          <form onSubmit={handleScan}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Arahkan scanner ke QR Code</label>
              <input
                ref={inputRef}
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 outline-none transition-all font-mono text-lg font-bold ${
                  mode === "KELUAR" ? "focus:ring-purple-500/20 border-slate-200 focus:border-purple-500" : "focus:ring-emerald-500/20 border-emerald-200 bg-emerald-50/50 focus:border-emerald-500"
                }`}
                placeholder="Scan di sini..."
                disabled={loading || (mode === "KELUAR" && santriData !== null)}
                autoComplete="off"
              />
            </div>
            {mode === "KELUAR" && !santriData && (
              <button 
                type="submit" 
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-lg shadow-slate-800/30 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                disabled={loading || !qrCode}
              >
                {loading ? "Memeriksa..." : "Lanjut Verifikasi"}
              </button>
            )}
            {mode === "KEMBALI" && (
              <p className="text-sm font-medium text-slate-500 mt-4 text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                Data akan otomatis tersimpan saat scan berhasil.
              </p>
            )}
          </form>
        </div>

        {/* Kolom Input Izin (Hanya muncul saat Keluar) */}
        {mode === "KELUAR" && (
          <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 transition-all ${santriData ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h2 className="text-xl font-black text-slate-900 mb-6">2. Detail Perizinan</h2>
            
            {santriData && (
              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Nama Santri</p>
                  <p className="font-black text-purple-900 text-lg mt-1">{santriData.nama}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">NIS</p>
                  <p className="font-bold text-purple-800">{santriData.nis}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleProsesKeluar}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Izin</label>
                  <select 
                    value={jenisIzin}
                    onChange={(e) => setJenisIzin(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-slate-700 bg-white"
                  >
                    <option value="KELUAR_PONDOK">Keluar Pondok (Belanja/Tugas)</option>
                    <option value="PULANG">Pulang Kampung / Liburan</option>
                    <option value="SAKIT">Sakit / Berobat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alasan Detail</label>
                  <input
                    type="text"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    placeholder="Contoh: Beli sabun di depan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Batas Waktu Kembali (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={batasKembali}
                    onChange={(e) => setBatasKembali(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                  disabled={loading || !alasan}
                >
                  {loading ? "Memproses..." : "Izinkan Keluar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
