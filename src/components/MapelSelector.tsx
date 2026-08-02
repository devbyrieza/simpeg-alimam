"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, BookOpen, Check, Sparkles, ChevronDown, GraduationCap, School, Layers, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Definisi Mapel Resmi Ust Aziz (Revisi 31 Juli 2026) per Jenjang & Kelas
export const MAPEL_PER_KELAS: Record<string, { kategori: string; items: string[] }[]> = {
  "7 MTs": [
    {
      kategori: "Syariah & Diniyah",
      items: [
        "Akidah",
        "Hadis",
        "Fiqh",
        "Siroh Nabi",
        "Tahsin Al-Quran",
        "Tahfidz Al-Quran",
        "Adab & Akhlak",
        "Khitobah",
      ],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: [
        "Bahasa Arab",
        "Kitabah",
        "Shorf",
      ],
    },
    {
      kategori: "Umum & Keterampilan",
      items: [
        "Bahasa Indonesia",
        "Bahasa Inggris",
        "Matematika",
        "IPA Terpadu",
        "Entrepreneurship",
      ],
    },
  ],
  "8 MTs": [
    {
      kategori: "Syariah & Diniyah",
      items: ["Akidah", "Hadis", "Fiqh", "Siroh Nabi", "Tahsin Al-Quran", "Tahfidz Al-Quran", "Adab & Akhlak", "Khitobah"],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: ["Bahasa Arab", "Kitabah", "Shorf", "Nahwu"],
    },
    {
      kategori: "Umum & Keterampilan",
      items: ["Bahasa Indonesia", "Bahasa Inggris", "Matematika", "IPA Terpadu", "Entrepreneurship"],
    },
  ],
  "9 MTs": [
    {
      kategori: "Syariah & Diniyah",
      items: ["Akidah", "Hadis", "Fiqh", "Siroh Nabi", "Tahsin Al-Quran", "Tahfidz Al-Quran", "Adab & Akhlak", "Khitobah"],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: ["Bahasa Arab", "Kitabah", "Shorf", "Nahwu"],
    },
    {
      kategori: "Umum & Keterampilan",
      items: ["Bahasa Indonesia", "Bahasa Inggris", "Matematika", "IPA Terpadu", "Entrepreneurship"],
    },
  ],
  "IL": [
    {
      kategori: "Bahasa Arab Intensif & Lughoh",
      items: [
        "Bahasa Arab",
        "Nahwu",
        "Shorf",
        "Kitabah",
        "Tadribat Alal Anmath",
      ],
    },
    {
      kategori: "Syariah & Diniyah",
      items: [
        "Akidah",
        "Hadis",
        "Fiqh",
        "Siroh Nabi",
        "Tahsin Al-Quran",
        "Tahfidz Al-Quran",
        "Adab & Akhlak",
        "Khitobah",
      ],
    },
    {
      kategori: "Keterampilan",
      items: [
        "Entrepreneurship",
      ],
    },
  ],
  "10 MA": [
    {
      kategori: "Syariah & Diniyah",
      items: ["Tafsir", "Hadis", "Ushul Fiqh", "Fiqh", "Akidah", "Tahsin Al-Quran", "Tahfidz Al-Quran"],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: ["Bahasa Arab", "Nahwu", "Shorf", "Balaghah"],
    },
    {
      kategori: "Umum & Keterampilan",
      items: ["Bahasa Indonesia", "Bahasa Inggris", "Matematika", "Sosiologi / IPA", "Entrepreneurship"],
    },
  ],
  "11 MA": [
    {
      kategori: "Syariah & Diniyah",
      items: ["Tafsir", "Hadis", "Ushul Fiqh", "Fiqh", "Akidah", "Tahsin Al-Quran", "Tahfidz Al-Quran"],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: ["Bahasa Arab", "Nahwu", "Shorf", "Balaghah"],
    },
    {
      kategori: "Umum & Keterampilan",
      items: ["Bahasa Indonesia", "Bahasa Inggris", "Matematika", "Entrepreneurship"],
    },
  ],
  "12 MA": [
    {
      kategori: "Syariah & Diniyah",
      items: ["Tafsir", "Hadis", "Ushul Fiqh", "Fiqh", "Akidah", "Tahsin Al-Quran", "Tahfidz Al-Quran"],
    },
    {
      kategori: "Bahasa & Lughoh",
      items: ["Bahasa Arab", "Nahwu", "Shorf", "Balaghah"],
    },
    {
      kategori: "Umum & Keterampilan",
      items: ["Bahasa Indonesia", "Bahasa Inggris", "Matematika", "Entrepreneurship"],
    },
  ],
};

const JENJANG_OPTIONS = [
  { id: "MTs", label: "MTs", desc: "Madrasah Tsanawiyah", active: true },
  { id: "IL", label: "IL", desc: "I'dad Lughowy (Bahasa Intensif)", active: true },
  { id: "MA", label: "MA", desc: "Madrasah Aliyah (Tahun Depan)", active: false },
];

const KELAS_BY_JENJANG: Record<string, { id: string; label: string; isPrimary: boolean }[]> = {
  MTs: [
    { id: "7 MTs", label: "Kelas 7 MTs", isPrimary: true },
    { id: "8 MTs", label: "Kelas 8 MTs", isPrimary: false },
    { id: "9 MTs", label: "Kelas 9 MTs", isPrimary: false },
  ],
  IL: [
    { id: "IL", label: "Kelas IL (I'dad Lughowy)", isPrimary: true },
  ],
  MA: [
    { id: "10 MA", label: "Kelas 10 MA", isPrimary: false },
    { id: "11 MA", label: "Kelas 11 MA", isPrimary: false },
    { id: "12 MA", label: "Kelas 12 MA", isPrimary: false },
  ],
};

interface MapelItem {
  jenjang: string;
  nama: string;
}

interface MapelSelectorProps {
  value: string; // Database format: "[7 MTs] Shorf, [IL] Shorf"
  onChange: (value: string) => void;
}

export default function MapelSelector({ value, onChange }: MapelSelectorProps) {
  const [items, setItems] = useState<MapelItem[]>([]);
  
  // Cascading Selection States
  const [selectedJenjang, setSelectedJenjang] = useState<string>(""); // Step 1
  const [selectedKelas, setSelectedKelas] = useState<string>("");     // Step 2
  const [selectedMapel, setSelectedMapel] = useState<string>("");     // Step 3
  
  const [customMapel, setCustomMapel] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showOtherKelas, setShowOtherKelas] = useState(false);

  // Parse existing value on mount
  useEffect(() => {
    if (!value) {
      setItems([]);
      return;
    }

    const parsedItems: MapelItem[] = [];
    const segments = value.split(",").map((s) => s.trim()).filter((s) => s);

    segments.forEach((segment) => {
      const match = segment.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        let j = match[1].trim();
        if (j === "I'dad Lughowy" || j === "I'dad") j = "IL";
        parsedItems.push({ jenjang: j, nama: match[2].trim() });
      } else {
        parsedItems.push({ jenjang: "IL", nama: segment.trim() });
      }
    });

    setItems(parsedItems);

    // Auto-detect initial jenjang & kelas from existing items if available
    if (parsedItems.length > 0) {
      const firstJenjang = parsedItems[0].jenjang;
      if (firstJenjang.includes("MTs")) {
        setSelectedJenjang("MTs");
        setSelectedKelas(firstJenjang);
      } else if (firstJenjang === "IL") {
        setSelectedJenjang("IL");
        setSelectedKelas("IL");
      } else if (firstJenjang.includes("MA")) {
        setSelectedJenjang("MA");
        setSelectedKelas(firstJenjang);
      }
    }
  }, [value]);

  const updateValue = (newItems: MapelItem[]) => {
    const strValue = newItems.map((item) => `[${item.jenjang}] ${item.nama}`).join(", ");
    onChange(strValue);
  };

  // Step 1: When Jenjang changes, reset Kelas & Mapel
  const handleSelectJenjang = (jenjangId: string) => {
    setSelectedJenjang(jenjangId);
    
    // Auto-select primary class if available
    const classes = KELAS_BY_JENJANG[jenjangId] || [];
    const primary = classes.find((c) => c.isPrimary);
    if (primary) {
      setSelectedKelas(primary.id);
    } else {
      setSelectedKelas("");
    }

    setSelectedMapel("");
    setCustomMapel("");
    setIsCustomMode(false);
  };

  // Step 2: When Kelas changes, reset Mapel selection
  const handleSelectKelas = (kelasId: string) => {
    setSelectedKelas(kelasId);
    setSelectedMapel("");
    setCustomMapel("");
    setIsCustomMode(false);
  };

  // Available classes for current selected jenjang
  const availableClasses = useMemo(() => {
    if (!selectedJenjang) return [];
    return KELAS_BY_JENJANG[selectedJenjang] || [];
  }, [selectedJenjang]);

  // Available mapel groups for current selected kelas
  const currentMapelGroups = useMemo(() => {
    if (!selectedKelas) return [];
    return MAPEL_PER_KELAS[selectedKelas] || MAPEL_PER_KELAS["7 MTs"] || [];
  }, [selectedKelas]);

  // Step 3: Add Mapel
  const handleAddMapel = (mapelName: string) => {
    const cleanMapel = mapelName.trim();
    if (!cleanMapel || !selectedKelas) return;

    const newItems = [...items];
    const exists = newItems.some(
      (item) => item.jenjang === selectedKelas && item.nama.toLowerCase() === cleanMapel.toLowerCase()
    );

    if (!exists) {
      newItems.push({ jenjang: selectedKelas, nama: cleanMapel });
      updateValue(newItems);
    }

    setSelectedMapel("");
    setCustomMapel("");
    setIsCustomMode(false);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  return (
    <div className="space-y-3.5">
      {/* ─── TAHAP 1: PILIH JENJANG MENGAJAR ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
            1
          </span>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Pilih Jenjang Mengajar (Wajib):
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {JENJANG_OPTIONS.map((j) => {
            const isSelected = selectedJenjang === j.id;
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => handleSelectJenjang(j.id)}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all relative ${
                  isSelected
                    ? "bg-white border-primary-600 shadow-sm ring-2 ring-primary-500/20 text-primary-900"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className={`text-xs font-black ${isSelected ? "text-primary-700" : "text-slate-800"}`}>
                    {j.label}
                  </span>
                  {isSelected && (
                    <Check className="w-3 h-3 text-primary-600 stroke-[3]" />
                  )}
                </div>
                <div className="text-[9px] text-slate-400 leading-tight truncate">
                  {j.id === "MTs" ? "Tsanawiyah" : j.id === "IL" ? "I'dad Lughowy" : "Aliyah"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAHAP 2: PILIH KELAS MENGAJAR (Hanya tampil setelah jenjang dipilih) ─── */}
      <AnimatePresence>
        {selectedJenjang ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Kelas Mengajar di Jenjang <span className="text-primary-700 font-extrabold font-mono">[{selectedJenjang}]</span>:
                </span>
              </div>

              {availableClasses.some((c) => !c.isPrimary) && (
                <button
                  type="button"
                  onClick={() => setShowOtherKelas(!showOtherKelas)}
                  className="text-[10px] text-primary-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  {showOtherKelas ? "Sembunyikan Kelas Lain" : "Tampilkan Kelas Lain"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showOtherKelas ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Pilihan Kelas Utama */}
            <div className="flex flex-wrap gap-2">
              {availableClasses
                .filter((c) => c.isPrimary || showOtherKelas || selectedJenjang === "MA")
                .map((c) => {
                  const isSelected = selectedKelas === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectKelas(c.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:border-primary-400"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "bg-white text-primary-600" : "border-slate-400"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{c.label}</span>
                      {c.isPrimary && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {selectedJenjang === "MA" && (
              <p className="text-[10px] text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Jenjang MA belum memiliki kelas berjalan saat ini (Direncanakan aktif tahun depan). Anda tetap dapat memilih kelas untuk penugasan mapel awal.</span>
              </p>
            )}
          </motion.div>
        ) : (
          <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pilih <strong>Jenjang</strong> (Step 1) terlebih dahulu untuk memilih kelas mengajar.</span>
          </div>
        )}
      </AnimatePresence>

      {/* ─── TAHAP 3: PILIH MAPEL (Hanya muncul setelah Jenjang & Kelas dipilih) ─── */}
      <AnimatePresence>
        {selectedKelas ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Mapel Mengajar di <span className="text-primary-700 font-extrabold font-mono">[{selectedKelas}]</span>:
                </span>
              </div>
              <span className="text-[10px] bg-primary-50 text-primary-800 border border-primary-200 px-2 py-0.5 rounded-full font-bold">
                Kurikulum {selectedKelas}
              </span>
            </div>

            {/* Dropdown Select Mapel */}
            <div className="flex flex-col sm:flex-row gap-2">
              {!isCustomMode ? (
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-primary-600" />
                  </div>
                  <select
                    value={selectedMapel}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomMode(true);
                        setSelectedMapel("");
                      } else {
                        setSelectedMapel(e.target.value);
                      }
                    }}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none cursor-pointer"
                  >
                    <option value="">— Pilih Mata Pelajaran [{selectedKelas}] —</option>
                    {currentMapelGroups.map((group) => (
                      <optgroup key={group.kategori} label={`── ${group.kategori} ──`}>
                        {group.items.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="── Opsi Lainnya ──">
                      <option value="__CUSTOM__">✍️ Ketik Mapel Kustom...</option>
                    </optgroup>
                  </select>
                </div>
              ) : (
                <div className="relative flex-grow flex items-center gap-2">
                  <input
                    type="text"
                    value={customMapel}
                    onChange={(e) => setCustomMapel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMapel(customMapel);
                      }
                    }}
                    placeholder={`Ketik nama mapel kustom untuk ${selectedKelas}...`}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-300 bg-white text-slate-800 text-xs outline-none focus:ring-2 focus:ring-primary-500/30 font-medium"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                  >
                    Batal
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleAddMapel(isCustomMode ? customMapel : selectedMapel)}
                disabled={
                  (!isCustomMode && !selectedMapel) ||
                  (isCustomMode && !customMapel.trim())
                }
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah ke [{selectedKelas}]</span>
              </button>
            </div>

            {/* Quick Chips Khusus Kelas yang Dipilih */}
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Pilihan Cepat Mapel {selectedKelas}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(selectedKelas === "IL"
                  ? ["Bahasa Arab", "Nahwu", "Shorf", "Kitabah", "Tadribat Alal Anmath", "Akidah", "Hadis", "Fiqh", "Tahsin Al-Quran", "Entrepreneurship"]
                  : ["Akidah", "Hadis", "Fiqh", "Siroh Nabi", "Bahasa Arab", "Shorf", "Kitabah", "Tahsin Al-Quran", "Bahasa Indonesia", "Bahasa Inggris", "Matematika", "IPA Terpadu", "Entrepreneurship"]
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleAddMapel(m)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          selectedJenjang && (
            <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pilih <strong>Kelas Mengajar</strong> (Step 2) untuk menampilkan daftar mata pelajaran.</span>
            </div>
          )
        )}
      </AnimatePresence>

      {/* ─── DAFTAR MAPEL YANG TELAH DITUGASKAN (GROUPED BY KELAS) ─── */}
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
          Daftar Mapel Yang Ditugaskan Untuk Guru Ini ({items.length}):
        </span>

        {items.length === 0 ? (
          <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            Belum ada mata pelajaran yang ditambahkan. Silakan ikuti 3 langkah di atas untuk menambahkan mapel.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Group 7 MTs */}
            {items.some((i) => i.jenjang === "7 MTs") && (
              <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200">
                <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider block mb-1.5">
                  📚 Mapel Kelas 7 MTs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang !== "7 MTs") return null;
                    return (
                      <span
                        key={`7mts-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-sky-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Group IL */}
            {items.some((i) => i.jenjang === "IL") && (
              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block mb-1.5">
                  📖 Mapel Kelas IL (I&apos;dad Lughowy):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang !== "IL") return null;
                    return (
                      <span
                        key={`il-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-amber-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Group Other Classes */}
            {items.some((i) => i.jenjang !== "7 MTs" && i.jenjang !== "IL") && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  📌 Mapel Kelas Lainnya:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang === "7 MTs" || item.jenjang === "IL") return null;
                    return (
                      <span
                        key={`other-${item.jenjang}-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span className="text-[9px] font-bold text-primary-600">[{item.jenjang}]</span>
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
