// src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("alimam_login_email_draft");
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && email) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("alimam_login_email_draft", email);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Username / Email dan Password wajib diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      localStorage.removeItem("alimam_login_email_draft");
      window.location.href = "/dashboard";
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white py-10 px-4 flex flex-col justify-center items-center font-sans relative overflow-hidden">
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      {/* Top Navigation Pills (OMI Standard) */}
      <div className="w-full max-w-md flex items-center justify-between gap-3 mb-5 relative z-10">
        <a
          href="https://pesantren-alimam.com"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-[#550000] hover:border-[#550000]/40 transition-all hover:-translate-y-0.5"
        >
          <span>← Beranda Utama</span>
        </a>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Portal SIMPEG 2026/2027</span>
        </div>
      </div>

      {/* Two-Section OMI Card */}
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 border border-slate-200 bg-white relative z-10">
        
        {/* Section 1: Dark Maroon Gradient Header */}
        <div className="bg-gradient-to-br from-[#2D0000] via-[#400000] to-[#550000] p-7 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#ddc192]/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2.5">
            <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto shadow-md border border-white/20 flex items-center justify-center">
              <Image
                src="/images/logo-alimam.png"
                alt="Logo Al-Imam"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                SIMPEG AL-IMAM
              </h1>
              <p className="text-xs text-[#ddc192] font-semibold mt-0.5">
                Sistem Informasi Manajemen Pegawai &amp; SDM
              </p>
            </div>
            <p className="text-[11px] text-slate-300 font-medium tracking-wider uppercase">
              Pesantren Al-Imam Al-Islami Sukabumi
            </p>
          </div>
        </div>

        {/* Section 2: White Body Card */}
        <div className="p-7 space-y-5 bg-white">
          
          {/* Info Banner Box */}
          <div className="p-3.5 rounded-2xl bg-[#ddc192]/15 border border-[#ddc192]/40 text-xs text-[#550000] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#550000] shrink-0" />
            <span className="font-medium leading-relaxed">
              Masuk menggunakan <strong>Username, Email, atau No. WhatsApp</strong> staf Anda.
            </span>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-bold"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <span>Username / Email / No. WA</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username / Email / No. WA"
                  className="w-full h-12 pl-4 pr-10 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-[#550000] focus:ring-4 focus:ring-[#550000]/10 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <span>Kata Sandi Pegawai</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full h-12 pl-4 pr-11 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-[#550000] focus:ring-4 focus:ring-[#550000]/10 transition-all select-text"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#550000] hover:bg-[#400000] text-white font-extrabold text-sm shadow-md shadow-[#550000]/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Staf...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Portal SIMPEG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Card Info */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              Kendala akses? Hubungi Tim Administrasi / HRD Pesantren
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Koneksi Aman Terenkripsi SSL</span>
            </div>
          </div>

        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-6 font-medium">
        &copy; 2026 Pesantren Al-Imam Al-Islami &bull; SIMPEG v1.0
      </p>

    </main>
  );
}
