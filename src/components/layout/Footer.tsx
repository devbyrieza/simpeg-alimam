"use client";

import Link from "next/link";
import {
  Youtube,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Twitter,
  Globe,
  ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { BRANDING } from "@/config/branding";
 
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: Instagram, href: BRANDING.igUrl, label: "Instagram" },
    { Icon: Youtube, href: BRANDING.ytUrl, label: "YouTube" },
    { Icon: Facebook, href: BRANDING.fbUrl, label: "Facebook" },
    { Icon: Twitter, href: BRANDING.twitterUrl ?? "#", label: "Twitter / X" },
  ];

  const lembagaLinks = [
    { label: "Tentang Kami", href: "/tentang" },
    { label: "Program Studi", href: "/program" },
    { label: "Fasilitas", href: "/fasilitas" },
    { label: "Kegiatan Santri", href: "/kegiatan" },
  ];

  const infoLinks = [
    { label: "Pendaftaran SPMB", href: "/daftar" },
    { label: "Biaya Pendidikan", href: "/daftar#biaya" },
    { label: "Beasiswa Tahfidz", href: "/daftar#beasiswa" },
    { label: "Kalender Akademik", href: "/kalender" },
  ];

  return (
    <footer
      className="relative overflow-hidden pt-20 pb-28 md:pb-14"
      style={{
        background:
          "linear-gradient(160deg, var(--color-primary-900) 0%, var(--color-primary-950) 60%, #2A0505 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* ── Decorative orbs — maroon-warm ── */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"
        style={{
          background:
            "radial-gradient(circle, rgba(176,64,64,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/3"
        style={{
          background:
            "radial-gradient(circle, rgba(228,193,111,0.08) 0%, transparent 70%)" }}
      />
      {/* Topline shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)" }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 mb-16">
          {/* ── Brand Info ── */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-secondary-100) 0%, var(--color-secondary-200) 100%)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.20)" }}
              >
                <Image
                  src={BRANDING.logoPath}
                  alt={`Logo ${BRANDING.schoolName}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                  {BRANDING.schoolLegalName}
                </h3>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mt-1.5"
                  style={{ color: "var(--color-secondary-400)" }}
                >
                  Pesantren Modern International
                </p>
              </div>
            </Link>

            <p
              className="font-medium leading-relaxed max-w-xs text-sm"
              style={{ color: "rgba(253,248,238,0.85)" }}
            >
              Membangun generasi Qur&apos;ani yang cerdas &amp; berakhlak mulia
              melalui sistem terintegrasi Al Andalus.
            </p>

            {/* Social Links */}
            <div className="flex gap-2.5">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group/social"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-secondary-300)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--color-secondary-200)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-secondary-200)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-primary-900)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.10)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-secondary-300)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Lembaga Links ── */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Lembaga
            </h4>
            <ul className="space-y-3.5">
              {lembagaLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold flex items-center gap-1.5 group/link transition-colors duration-200"
                    style={{ color: "rgba(253,248,238,0.85)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(253,248,238,0.85)";
                    }}
                  >
                    {item.label}
                    <ArrowUpRight
                      className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all duration-200 flex-shrink-0"
                      style={{ color: "var(--color-gold-400)" }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Informasi Links ── */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Informasi
            </h4>
            <ul className="space-y-3.5">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: "rgba(253,248,238,0.85)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(253,248,238,0.85)";
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Kontak ── */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Kontak Kami
            </h4>
            <div className="space-y-4">
              {/* Alamat */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-gold-400)" }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <p
                  className="text-sm font-medium leading-relaxed pt-1"
                  style={{ color: "rgba(253,248,238,0.85)" }}
                  dangerouslySetInnerHTML={{
                    __html: BRANDING.address.replace(/,/g, ",<br />") }}
                />
              </div>

              {/* Telepon */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-gold-400)" }}
                >
                  <Phone className="w-4 h-4" />
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-white">
                    {BRANDING.phone}
                  </p>
                  <p
                    className="text-[11px] font-medium tracking-wide mt-0.5"
                    style={{ color: "rgba(253,248,238,0.65)" }}
                  >
                    Layanan Pelanggan
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-gold-400)" }}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-white break-all pt-1.5">
                  {BRANDING.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs font-medium order-2 md:order-1 text-center md:text-left"
            style={{ color: "rgba(253,248,238,0.60)" }}
          >
            &copy; {currentYear} {BRANDING.schoolLegalName}. Hak cipta dilindungi
            undang-undang.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-5 order-1 md:order-2">
            {["Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs font-semibold transition-colors duration-200"
                style={{ color: "rgba(253,248,238,0.65)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(253,248,238,0.85)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(253,248,238,0.65)";
                }}
              >
                {item}
              </Link>
            ))}

            {/* Language toggle */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(253,248,238,0.50)" }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ID / AR</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
