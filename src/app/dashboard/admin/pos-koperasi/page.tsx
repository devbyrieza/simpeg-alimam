"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function POSKoperasi() {
  const [qrCode, setQrCode] = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);
  const [santriData, setSantriData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input agar selalu siap menerima scan barcode
  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dompet/cek-saldo?qr_code=${qrCode}`);
      const data = await res.json();
      
      if (data.success) {
        setSantriData(data.data);
        toast.success("Kartu dikenali");
      } else {
        toast.error(data.error || "Kartu tidak valid");
        setQrCode("");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleBayar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode || !nominal) return;

    setLoading(true);
    try {
      const res = await fetch("/api/dompet/jajan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_code_string: qrCode,
          nominal: Number(nominal),
          kasir_id: "00000000-0000-0000-0000-000000000000", // TODO: Ambil dari session login admin
          keterangan: "Belanja Koperasi"
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`Pembayaran berhasil! Sisa Saldo: Rp ${data.data.sisa_saldo}`);
        // Reset form untuk antrian berikutnya
        setQrCode("");
        setNominal("");
        setSantriData(null);
        inputRef.current?.focus();
      } else {
        toast.error(data.error || "Pembayaran gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            POS Kasir Koperasi
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Sistem Point of Sale Koperasi berbasis QR Code Santri.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Scan */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-6">Scan Kartu Santri</h2>
          <form onSubmit={handleScan}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Arahkan scanner ke QR Code</label>
              <input
                ref={inputRef}
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-lg font-bold"
                placeholder="Scan di sini..."
                disabled={loading || santriData !== null}
                autoComplete="off"
              />
            </div>
            {!santriData && (
              <button 
                type="submit" 
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                disabled={loading || !qrCode}
              >
                {loading ? "Memeriksa..." : "Cek Kartu"}
              </button>
            )}
          </form>
        </div>

        {/* Kolom Pembayaran */}
        <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 transition-all ${!santriData ? 'opacity-80' : ''}`}>
          <h2 className="text-xl font-black text-slate-900 mb-6">Informasi Transaksi</h2>
          
          {santriData ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Santri</p>
                <p className="font-black text-xl text-slate-900 mt-1">{santriData.nama}</p>
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">NIS</p>
                    <p className="font-bold text-slate-700">{santriData.nis}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo Saat Ini</p>
                    <p className="font-black text-2xl text-emerald-600">Rp {Number(santriData.saldo).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBayar}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Total Belanja (Rp)</label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-5 py-4 text-3xl font-black border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900"
                    placeholder="0"
                    required
                    min="1"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setSantriData(null); setQrCode(""); }}
                    className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                    disabled={loading || !nominal}
                  >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="font-medium">Silakan scan kartu santri terlebih dahulu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
