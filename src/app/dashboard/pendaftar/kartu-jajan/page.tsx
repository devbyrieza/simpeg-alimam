"use client";

import { useState, useEffect } from "react";
import { HandCoins, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Edit2, Save, X } from "lucide-react";

interface DompetSantri {
  id: string;
  saldo: string;
  batas_jajan_harian: string;
  batas_maksimal_saldo: string;
  status: string;
}

interface Transaksi {
  id: string;
  jenis_transaksi: string;
  nominal: string;
  saldo_akhir: string;
  keterangan: string;
  created_at: string;
}

export default function KartuJajanPage() {
  const [dompet, setDompet] = useState<DompetSantri | null>(null);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  
  // States for Edit Limit
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState<number>(0);
  const [savingLimit, setSavingLimit] = useState(false);

  const presetAmounts = [20000, 50000, 100000, 200000, 500000];

  useEffect(() => {
    fetchDompet();
  }, []);

  useEffect(() => {
    // Inject Midtrans Snap script dynamically
    const midtransUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = midtransUrl;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchDompet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pendaftar/dompet"); // We will create this API later or adjust
      const data = await res.json();
      if (data.success) {
        setDompet(data.data.dompet);
        setTransaksiList(data.data.transaksi);
        setNewLimit(Number(data.data.dompet.batas_jajan_harian));
      }
    } catch (err) {
      console.error("Gagal mengambil data dompet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    try {
      setProcessing(true);
      setError("");

      const res = await fetch("/api/dompet/topup/midtrans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal: topupAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      // @ts-ignore
      window.snap.pay(data.data.snap_token, {
        onSuccess: function (result: any) {
          console.log("Success:", result);
          fetchDompet();
        },
        onPending: function (result: any) {
          console.log("Pending:", result);
          fetchDompet();
        },
        onError: function (result: any) {
          console.log("Error:", result);
          setError("Pembayaran gagal atau dibatalkan");
        },
        onClose: function () {
          fetchDompet();
        },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveLimit = async () => {
    try {
      setSavingLimit(true);
      const res = await fetch("/api/dompet/limit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: newLimit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah limit");
      
      setIsEditingLimit(false);
      fetchDompet();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingLimit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!dompet) {
    return (
      <div className="bg-white rounded-[1.5rem] p-8 text-center shadow-sm border border-gold-100">
        <AlertCircle className="w-12 h-12 text-ink-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-ink-900 mb-2">Kartu Jajan Belum Aktif</h3>
        <p className="text-ink-500 max-w-md mx-auto">
          Fitur Kartu Jajan (Dompet Santri) akan aktif secara otomatis setelah ananda berada di pesantren dan mendapatkan Smart Card fisik.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Saldo Card */}
      <div className="bg-linear-to-br from-primary-800 to-primary-950 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-clay-lg">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard className="w-48 h-48 -rotate-12 translate-x-8 -translate-y-8" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-gold-200 font-bold uppercase tracking-widest text-sm mb-2">Saldo Saat Ini</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Rp {Number(dompet.saldo).toLocaleString("id-ID")}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {isEditingLimit ? (
                <div className="flex items-center gap-2 bg-white/20 p-1.5 rounded-xl">
                  <span className="text-sm font-bold ml-2">Rp</span>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="w-24 bg-transparent border-b border-white/50 text-white font-bold outline-hidden focus:border-white"
                  />
                  <button onClick={handleSaveLimit} disabled={savingLimit} className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white">
                    {savingLimit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsEditingLimit(false)} className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20">
                    Limit Harian: Rp {Number(dompet.batas_jajan_harian).toLocaleString("id-ID")}
                  </span>
                  <button onClick={() => { setIsEditingLimit(true); setNewLimit(Number(dompet.batas_jajan_harian)); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Ubah Limit Jajan">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${dompet.status === "AKTIF" ? "bg-green-500/20 text-green-200 border-green-500/30" : "bg-red-500/20 text-red-200 border-red-500/30"}`}>
                Status: {dompet.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-up Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-surface-100 h-fit">
          <h3 className="text-lg font-bold text-primary-950 mb-4 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-gold-500" />
            Top Up Saldo
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopupAmount(amount)}
                  className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${
                    topupAmount === amount
                      ? "border-primary-600 bg-primary-50 text-primary-800"
                      : "border-surface-200 text-ink-600 hover:border-gold-300 hover:bg-gold-50"
                  }`}
                >
                  {amount / 1000}K
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-bold">Rp</span>
              <input
                type="number"
                min="10000"
                step="10000"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 font-bold text-ink-900 transition-all outline-hidden"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <button
              onClick={handleTopup}
              disabled={processing || topupAmount < 10000 || dompet.status !== "AKTIF"}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-200 disabled:text-ink-400 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Top Up Sekarang"}
            </button>
            <p className="text-[10px] text-ink-400 text-center">
              Pembayaran aman dan diverifikasi otomatis via Midtrans
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-surface-100">
          <h3 className="text-lg font-bold text-primary-950 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500" />
            Riwayat Transaksi
          </h3>

          <div className="space-y-4">
            {transaksiList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-ink-400 text-sm font-medium">Belum ada riwayat transaksi</p>
              </div>
            ) : (
              transaksiList.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 border border-surface-100 hover:border-gold-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      trx.jenis_transaksi === "TOPUP" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {trx.jenis_transaksi === "TOPUP" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-ink-900 text-sm">{trx.keterangan || trx.jenis_transaksi}</p>
                      <p className="text-xs text-ink-500">{new Date(trx.created_at).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${trx.jenis_transaksi === "TOPUP" ? "text-green-600" : "text-ink-900"}`}>
                      {trx.jenis_transaksi === "TOPUP" ? "+" : "-"} Rp {Number(trx.nominal).toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-ink-400 font-medium">Saldo: Rp {Number(trx.saldo_akhir).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
