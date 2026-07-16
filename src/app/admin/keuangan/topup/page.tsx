"use client";

import { useState, useEffect } from "react";
import { Search, Wallet, CheckCircle2, Loader2, RefreshCcw, History, Plus, XCircle } from "lucide-react";

interface Dompet {
  id: string;
  saldo: number;
}

interface Santri {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  DompetSantri?: Dompet;
}

export default function FinanceTopupPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/santri-aktif"); // We need an API to get all active students with their wallets
      const data = await res.json();
      if (data.success) {
        setSantriList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch santri", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSantri();
  }, []);

  const handleTopup = async () => {
    if (!selectedSantri || !nominal) return;
    
    setIsProcessing(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/keuangan/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: selectedSantri.id,
          nominal: Number(nominal.replace(/\D/g, '')),
          keterangan: keterangan || "Top Up Saldo via Admin"
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Top Up Berhasil!", type: "success" });
        setNominal("");
        setKeterangan("");
        fetchSantri(); // Refresh balances
        setTimeout(() => {
          setSelectedSantri(null);
          setMessage({ text: "", type: "" });
        }, 3000);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Gagal memproses Top Up", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSantri = santriList.filter(s => 
    s.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    s.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Top Up Saldo Jajan</h1>
          <p className="text-slate-500 mt-1">Kelola dan isi ulang saldo dompet elektronik santri.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau No. Reg..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/20"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1 items-start">
        {/* Kiri: Daftar Santri */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Daftar Santri Aktif</h3>
            <button onClick={fetchSantri} className="text-slate-400 hover:text-maroon-600 transition-colors" title="Refresh Data">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-maroon-500" />
              </div>
            ) : filteredSantri.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400 font-medium">
                Tidak ada data santri ditemukan.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSantri.map(santri => (
                  <div 
                    key={santri.id}
                    onClick={() => setSelectedSantri(santri)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedSantri?.id === santri.id ? 'bg-maroon-50 border border-maroon-200' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div>
                      <p className={`font-bold ${selectedSantri?.id === santri.id ? 'text-maroon-800' : 'text-slate-800'}`}>{santri.nama_lengkap}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{santri.nomor_pendaftaran} • {santri.jenjang}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Saldo</p>
                      <p className="font-black text-slate-700">Rp {Number(santri.DompetSantri?.saldo || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kanan: Panel Top Up */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          {/* Header Panel */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-maroon-100 text-maroon-700 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Proses Top Up</h2>
              <p className="text-xs text-slate-500">Isi saldo dompet santri</p>
            </div>
          </div>

          {!selectedSantri ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                <Plus className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Pilih santri dari daftar di sebelah kiri untuk melakukan Top Up.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="bg-slate-900 rounded-2xl p-5 mb-6 text-white shadow-inner">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Penerima</p>
                <p className="font-black text-lg line-clamp-1">{selectedSantri.nama_lengkap}</p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Sisa Saldo</p>
                    <p className="font-black text-2xl text-gold-500">Rp {Number(selectedSantri.DompetSantri?.saldo || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-white/20" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nominal Top Up (Rp)</label>
                  <input 
                    type="number" 
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="w-full font-bold text-lg text-slate-900 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/20"
                  />
                </div>

                {/* Preset Nominal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[50000, 100000, 500000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setNominal(val.toString())}
                      className="py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      {val / 1000}k
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Keterangan Transfer</label>
                  <input 
                    type="text" 
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="BSI M-Banking - Bpk Hasan"
                    className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-maroon-500"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`mt-5 p-3 rounded-xl border flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <button
                onClick={handleTopup}
                disabled={!nominal || isProcessing}
                className="w-full mt-6 bg-maroon-600 hover:bg-maroon-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tambahkan Saldo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
