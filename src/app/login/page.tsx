"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan Password wajib diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      window.location.href = "/dashboard";
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-100/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white shadow-xl shadow-primary-900/10 rounded-3xl mb-6 border border-slate-100">
            <Image
              src="/logo.png"
              alt="Logo Al-Imam"
              width={56}
              height={56}
              className="w-14 h-14 object-contain rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-br from-slate-900 via-primary-900 to-slate-700 bg-clip-text text-transparent mb-2 tracking-tight">
            E-Office
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Pesantren Al-Imam Al-Islami
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl shadow-slate-900/8 relative overflow-hidden"
        >
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-900 opacity-80" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Selamat Datang</h2>
            <p className="text-slate-500 text-sm">Masuk dengan akun staf Anda</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pesantren-alimam.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-0 bottom-0 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: "#3b0a0a" }}
              className="w-full py-4 mt-2 text-white font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2.5 disabled:opacity-60 hover:opacity-90"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Memproses...</span></>
              ) : (
                <><ShieldCheck className="w-5 h-5" /><span>Masuk ke E-Office</span></>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 text-center font-medium">
              Lupa password? Hubungi Administrator Sistem
            </p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          © 2026 Pesantren Al-Imam Al-Islami · E-Office v1.0
        </p>
      </div>
    </main>
  );
}
