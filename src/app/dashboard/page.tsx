"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, FileText, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });

  useEffect(() => {
    // In a real app, this would fetch from a stats API.
    // For now, we'll just fetch the list and calculate.
    fetch("/api/surat")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const total = json.data.length;
          const published = json.data.filter((s: any) => s.status === "PUBLISHED").length;
          const draft = total - published;
          setStats({ total, published, draft });
        }
      });
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard SIMPEG</h1>
        <p className="text-slate-500 mt-2 font-medium">Sistem Informasi Manajemen Kepegawaian Pesantren Al-Imam Al-Islami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white px-7 py-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Surat</p>
            <p className="text-4xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white px-7 py-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Telah Publish</p>
            <p className="text-4xl font-black text-slate-900">{stats.published}</p>
          </div>
        </div>

        <div className="bg-white px-7 py-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Draft</p>
            <p className="text-4xl font-black text-slate-900">{stats.draft}</p>
          </div>
        </div>
      </div>

      <div className="bg-white px-7 py-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-600" />
          </div>
          Akses Cepat
        </h2>
        <div className="flex gap-4 flex-wrap">
          <Link href="/dashboard/surat/buat" className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2">
            Buat Surat Baru
          </Link>
          <Link href="/dashboard/surat" className="px-6 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all">
            Lihat Arsip
          </Link>
          <Link href="/pendataan" className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all">
            Form Pendataan Pegawai
          </Link>
        </div>
      </div>
    </div>
  );
}
