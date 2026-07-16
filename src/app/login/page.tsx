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
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-800/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 mb-6 shadow-2xl">
            <Image
              src="/logo.png"
              alt="Logo Al-Andalus Al-Imam"
              width={56}
              height={56}
              className="w-14 h-14 object-contain rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            E-Office
          </h1>
          <p className="text-sm font-semibold text-white/50 uppercase tracking-[0.2em]">
            Pesantren Al-Andalus Al-Imam
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Selamat Datang</h2>
            <p className="text-white/50 text-sm">Masuk dengan akun staf Anda</p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-white/30 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pesantren-alimam.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/30 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-0 bottom-0 flex items-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Memproses...</span></>
              ) : (
                <><ShieldCheck className="w-5 h-5" /><span>Masuk ke E-Office</span></>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-white/40 text-center font-medium">
              Lupa password? Hubungi Administrator Sistem
            </p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-white/20 mt-8 font-medium">
          © 2026 Pesantren Al-Andalus Al-Imam · E-Office v1.0
        </p>
      </div>
    </main>
  );
}
