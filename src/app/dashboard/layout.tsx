"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, Mail, LogOut, LayoutDashboard, 
  PlusCircle, ChevronRight, ScrollText, Users
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-primary-950 to-primary-900 text-white flex flex-col shadow-2xl border-r border-primary-800">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <ScrollText className="w-5 h-5 text-primary-950" />
            </div>
            <div>
              <p className="font-black text-sm leading-tight text-white">Office</p>
              <p className="text-gold-200 text-xs font-medium">Al-Imam Al-Islami</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-gold-500/50 text-xs font-bold uppercase tracking-wider px-3 py-2">Menu</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-gold-100 transition-all group"
          >
            <LayoutDashboard className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/surat"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-gold-100 transition-all group"
          >
            <Mail className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Arsip Surat Keluar</span>
          </Link>
          <Link
            href="/dashboard/surat/buat"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-gold-100 transition-all group"
          >
            <PlusCircle className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Buat Surat Baru</span>
          </Link>
          <div className="pt-4 pb-2">
            <p className="text-gold-500/50 text-xs font-bold uppercase tracking-wider px-3">HRD / Kepegawaian</p>
          </div>
          <Link
            href="/dashboard/admin/pegawai"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-gold-100 transition-all group"
          >
            <Users className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Data Pegawai</span>
          </Link>
          <Link
            href="/pendataan"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-gold-100 transition-all group"
          >
            <FileText className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-sm font-medium">Form Pendataan Pegawai</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
