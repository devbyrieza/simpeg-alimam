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
        }),
      });

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
        body: JSON.stringify({ qr_code_string: scannedQr }),
      });

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[#550000]">Gerbang Perizinan Santri</h1>
      
      {/* Mode Switcher */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => { setMode("KELUAR"); resetForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
            mode === "KELUAR" 
              ? "bg-[#550000] text-white shadow-lg scale-105" 
              : "bg-white text-gray-500 hover:bg-red-50 border"
          }`}
        >
          SCAN KELUAR PONDOK <ArrowUpRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setMode("KEMBALI"); resetForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
            mode === "KEMBALI" 
              ? "bg-[#ddc192] text-[#550000] shadow-lg scale-105" 
              : "bg-white text-gray-500 hover:bg-yellow-50 border"
          }`}
        >
          SCAN KEMBALI <ArrowDownLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Scan */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">
            {mode === "KELUAR" ? "1. Scan Kartu" : "Silakan Scan Kartu"}
          </h2>
          <form onSubmit={handleScan}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Arahkan scanner ke QR Code</label>
              <input
                ref={inputRef}
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                  mode === "KELUAR" ? "focus:ring-[#550000] border-gray-300" : "focus:ring-[#ddc192] border-yellow-300 bg-yellow-50"
                }`}
                placeholder="Scan di sini..."
                disabled={loading || (mode === "KELUAR" && santriData !== null)}
                autoComplete="off"
              />
            </div>
            {mode === "KELUAR" && !santriData && (
              <button 
                type="submit" 
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
                disabled={loading || !qrCode}
              >
                {loading ? "Memeriksa..." : "Lanjut Verifikasi"}
              </button>
            )}
            {mode === "KEMBALI" && (
              <p className="text-sm text-gray-500 mt-4 text-center">Data akan otomatis tersimpan saat scan berhasil.</p>
            )}
          </form>
        </div>

        {/* Kolom Input Izin (Hanya muncul saat Keluar) */}
        {mode === "KELUAR" && (
          <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-opacity ${santriData ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h2 className="text-xl font-semibold mb-4">2. Detail Perizinan</h2>
            
            {santriData && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                <p className="font-bold text-[#550000]">{santriData.nama}</p>
                <p className="text-sm text-gray-600">NIS: {santriData.nis}</p>
              </div>
            )}

            <form onSubmit={handleProsesKeluar}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Izin</label>
                  <select 
                    value={jenisIzin}
                    onChange={(e) => setJenisIzin(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="KELUAR_PONDOK">Keluar Pondok (Belanja/Tugas)</option>
                    <option value="PULANG">Pulang Kampung / Liburan</option>
                    <option value="SAKIT">Sakit / Berobat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Detail</label>
                  <input
                    type="text"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Contoh: Beli sabun di depan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu Kembali (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={batasKembali}
                    onChange={(e) => setBatasKembali(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-[#550000] text-white py-3 rounded-lg font-bold hover:bg-red-900 transition disabled:opacity-50"
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
