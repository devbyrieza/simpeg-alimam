"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingUp, Users, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";

export default function DashboardEksekutifPage() {
  const [isClient, setIsClient] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null; // Prevent hydration error for recharts

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin w-8 h-8 border-4 border-maroon-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { metrics, charts } = dashboardData;
  const { revenueData, sppStatusData } = charts;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Dashboard Eksekutif</h1>
        <p className="text-slate-500 mt-1">Ringkasan keuangan dan aktivitas santri Pesantren Al Imam.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-600 shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Saldo ZAD</p>
            <p className="text-2xl font-black text-slate-800">Rp {(metrics.totalSaldoZAD / 1000000).toFixed(1)} Jt</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pemasukan SPP (Juli)</p>
            <p className="text-2xl font-black text-slate-800">Rp {(metrics.pemasukanSPP / 1000000).toFixed(1)} Jt</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-maroon-100 flex items-center justify-center text-maroon-600 shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jajan ZAD Hari Ini</p>
            <p className="text-2xl font-black text-slate-800">Rp {(metrics.jajanHariIni / 1000000).toFixed(1)} Jt</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Santri Aktif</p>
            <p className="text-2xl font-black text-slate-800">{metrics.santriAktif}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART: Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Penerimaan Mingguan</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value))}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="spp" name="Penerimaan SPP" fill="#850000" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="jajan" name="Transaksi Kantin" fill="#eab308" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: SPP Status */}
        <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Status SPP Juli 2026</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sppStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sppStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} Santri`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-black text-slate-800">{Math.round((sppStatusData[0].value / (metrics.santriAktif || 1)) * 100)}%</p>
              <p className="text-xs font-bold text-slate-400">LUNAS</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {sppStatusData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{item.value} Santri</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
