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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard SIMPEG</h1>
        <p className="text-slate-500 mt-1">Sistem Informasi Manajemen Kepegawaian Pesantren Al-Imam Al-Islami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Surat</p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Telah Publish</p>
            <p className="text-3xl font-black text-slate-900">{stats.published}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Draft</p>
            <p className="text-3xl font-black text-slate-900">{stats.draft}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" /> Akses Cepat
        </h2>
        <div className="flex gap-4 flex-wrap">
          <Link href="/dashboard/surat/buat" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md shadow-primary-600/20">
            Buat Surat Baru
          </Link>
          <Link href="/dashboard/surat" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
            Lihat Arsip
          </Link>
          <Link href="/pendataan" className="px-4 py-2 bg-gold-500 text-white rounded-xl font-bold hover:bg-gold-600 shadow-md shadow-gold-500/20">
            Form Pendataan Pegawai
          </Link>
        </div>
      </div>
    </div>
  );
}
