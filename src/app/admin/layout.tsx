"use client";

import { useState } from "react";
import { Building2, Settings, Users, ArrowLeft, Printer, Calendar, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 print:hidden overscroll-contain">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gold-500" />
            Portal Staf
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Pesantren Al Imam</p>
        </div>
        
        <nav className="p-4 space-y-2 custom-scrollbar overscroll-contain">
          <Link 
            href="/admin/kartu-jajan" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.includes('kartu-jajan') ? 'bg-gold-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Printer className="w-5 h-5" />
            Cetak Kartu Jajan
          </Link>

          <Link 
            href="/admin/surat" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.includes('/admin/surat') ? 'bg-gold-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Printer className="w-5 h-5" />
            Arsip Surat
          </Link>

          <Link 
            href="/admin/kalender" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.includes('/admin/kalender') ? 'bg-gold-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" />
            Kalender Akademik
          </Link>
          
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all mt-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Portal
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-2 border border-transparent hover:border-red-500/20"
          >
            {isLoggingOut
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <LogOut className="w-5 h-5" />
            }
            {isLoggingOut ? "Keluar..." : "Logout"}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
