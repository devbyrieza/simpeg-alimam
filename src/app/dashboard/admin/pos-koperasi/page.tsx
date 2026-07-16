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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[#550000]">POS Kasir Koperasi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Scan */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Scan Kartu Santri</h2>
          <form onSubmit={handleScan}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Arahkan scanner ke QR Code</label>
              <input
                ref={inputRef}
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ddc192] focus:border-transparent outline-none transition"
                placeholder="Scan di sini..."
                disabled={loading || santriData !== null}
                autoComplete="off"
              />
            </div>
            {!santriData && (
              <button 
                type="submit" 
                className="w-full bg-[#550000] text-white py-3 rounded-lg font-medium hover:bg-red-900 transition disabled:opacity-50"
                disabled={loading || !qrCode}
              >
                {loading ? "Memeriksa..." : "Cek Kartu"}
              </button>
            )}
          </form>
        </div>

        {/* Kolom Pembayaran */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 opacity-100 transition-opacity">
          <h2 className="text-xl font-semibold mb-4">Informasi Transaksi</h2>
          
          {santriData ? (
            <div className="space-y-4">
              <div className="bg-[#fdfbf7] p-4 rounded-lg border border-[#ddc192]">
                <p className="text-sm text-gray-500">Nama Santri</p>
                <p className="font-bold text-lg">{santriData.nama}</p>
                <div className="flex justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-500">NIS</p>
                    <p className="font-medium">{santriData.nis}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saldo Saat Ini</p>
                    <p className="font-bold text-[#550000]">Rp {Number(santriData.saldo).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBayar}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Belanja (Rp)</label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#550000] focus:border-transparent outline-none transition"
                    placeholder="0"
                    required
                    min="1"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => { setSantriData(null); setQrCode(""); }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] bg-[#ddc192] text-[#550000] py-3 rounded-lg font-bold hover:brightness-95 transition disabled:opacity-50"
                    disabled={loading || !nominal}
                  >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <p>Silakan scan kartu santri terlebih dahulu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
