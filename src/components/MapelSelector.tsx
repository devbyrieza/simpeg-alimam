"use client";

import { useState, useEffect } from "react";
import { Plus, X, BookOpen, Check, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Daftar Kelas / Jenjang
const PRIMARY_JENJANG_OPTIONS = ["7 MTs", "IL"];
const OTHER_JENJANG_OPTIONS = ["8 MTs", "9 MTs", "10 MA", "11 MA", "12 MA"];

// Daftar Mata Pelajaran Resmi dari Ustadz Aziz (Kepala Kurikulum)
export const KURIKULUM_MAPEL_GROUPS = [
  {
    kategori: "Diniyah & Al-Qur'an",
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
      "Nahwu",
      "Shorf",
      "Kitabah",
      "Tadribat Alal Anmath",
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
];

// Flat list mapel resmi untuk pencarian / quick select
export const ALL_STANDARD_MAPEL = KURIKULUM_MAPEL_GROUPS.flatMap((g) => g.items);

interface MapelItem {
  jenjang: string;
  nama: string;
}

interface MapelSelectorProps {
  value: string; // Stored in database, e.g. "[7 MTs] Shorf, [IL] Shorf"
  onChange: (value: string) => void;
}

export default function MapelSelector({ value, onChange }: MapelSelectorProps) {
  const [items, setItems] = useState<MapelItem[]>([]);
  const [checkedJenjangs, setCheckedJenjangs] = useState<string[]>(["7 MTs"]);
  const [showOtherJenjangs, setShowOtherJenjangs] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [customMapel, setCustomMapel] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Parse existing value on mount and when value changes externally
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
        parsedItems.push({ jenjang: match[1], nama: match[2] });
      } else {
        parsedItems.push({ jenjang: "IL", nama: segment });
      }
    });

    setItems(parsedItems);
  }, [value]);

  const updateValue = (newItems: MapelItem[]) => {
    const strValue = newItems.map((item) => `[${item.jenjang}] ${item.nama}`).join(", ");
    onChange(strValue);
  };

  const handleAddMapel = (mapelName: string) => {
    const cleanMapel = mapelName.trim();
    if (!cleanMapel || checkedJenjangs.length === 0) return;

    const newItems = [...items];
    checkedJenjangs.forEach((jenjang) => {
      const exists = newItems.some(
        (item) => item.jenjang === jenjang && item.nama.toLowerCase() === cleanMapel.toLowerCase()
      );
      if (!exists) {
        newItems.push({ jenjang, nama: cleanMapel });
      }
    });

    updateValue(newItems);
    setSelectedMapel("");
    setCustomMapel("");
    setIsCustomMode(false);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  const toggleJenjang = (opt: string) => {
    if (checkedJenjangs.includes(opt)) {
      setCheckedJenjangs(checkedJenjangs.filter((j) => j !== opt));
    } else {
      setCheckedJenjangs([...checkedJenjangs, opt]);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Pilih Kelas / Jenjang Target */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Pilih Kelas / Jenjang Mengajar (Bisa &gt; 1):
          </span>
          <button
            type="button"
            onClick={() => setShowOtherJenjangs(!showOtherJenjangs)}
            className="text-[10px] text-primary-600 font-semibold hover:underline flex items-center gap-0.5"
          >
            {showOtherJenjangs ? "Sembunyikan Kelas Lain" : "Tampilkan Kelas Lain (8-9 MTs, MA)"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showOtherJenjangs ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Primary Active Classes (7 MTs & IL) */}
        <div className="flex flex-wrap gap-2 mb-2">
          {PRIMARY_JENJANG_OPTIONS.map((opt) => {
            const isChecked = checkedJenjangs.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleJenjang(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isChecked
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:border-primary-400"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? "bg-white border-white text-primary-600" : "border-slate-400"}`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                {opt} <span className="text-[10px] opacity-75 font-normal">({opt === "7 MTs" ? "Tsanawiyah" : "I'dad Lughowy"})</span>
              </button>
            );
          })}
        </div>

        {/* Expandable Other Classes */}
        {showOtherJenjangs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5"
          >
            {OTHER_JENJANG_OPTIONS.map((opt) => {
              const isChecked = checkedJenjangs.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleJenjang(opt)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isChecked
                      ? "bg-primary-100 text-primary-900 border-primary-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-primary-600 w-3 h-3 pointer-events-none"
                  />
                  {opt}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 2. Pilih Mata Pelajaran (Dropdown Standar Kurikulum Ust Aziz) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          2. Pilih Mata Pelajaran (Dokumen Resmi Kurikulum):
        </span>

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
                <option value="">— Pilih Mata Pelajaran Resmi —</option>
                {KURIKULUM_MAPEL_GROUPS.map((group) => (
                  <optgroup key={group.kategori} label={`── ${group.kategori} ──`}>
                    {group.items.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="── Opsi Lainnya ──">
                  <option value="__CUSTOM__">✍️ Ketik Mapel Lain (Kustom)...</option>
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
                placeholder="Ketik nama mata pelajaran kustom..."
                className="w-full px-3 py-2.5 rounded-xl border border-primary-300 bg-white text-slate-800 text-xs outline-none focus:ring-2 focus:ring-primary-500/30 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                title="Kembali ke pilihan dropdown"
              >
                Batal
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleAddMapel(isCustomMode ? customMapel : selectedMapel)}
            disabled={
              checkedJenjangs.length === 0 ||
              (!isCustomMode && !selectedMapel) ||
              (isCustomMode && !customMapel.trim())
            }
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>

        {/* Quick Select Chips (Pilihan Cepat) */}
        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Pilihan Cepat Mapel Populer:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Akidah", "Hadis", "Fiqh", "Bahasa Arab", "Nahwu", "Shorf", "Tahsin Al-Quran", "Bahasa Inggris", "Matematika", "IPA Terpadu"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleAddMapel(m)}
                disabled={checkedJenjangs.length === 0}
                className="px-2.5 py-1 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-40"
              >
                + {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Daftar Mapel Yang Ditugaskan (Badges Display) */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Mapel Ditugaskan ({items.length}):
        </span>

        {items.length === 0 ? (
          <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            Belum ada mata pelajaran yang dipilih untuk guru ini.
          </div>
        ) : (
          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-2.5 flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.jenjang}-${item.nama}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 bg-white border border-primary-200 shadow-sm pl-2.5 pr-1.5 py-1 rounded-lg group"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-primary-600 uppercase tracking-wider leading-none mb-0.5">
                      {item.jenjang}
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-none">
                      {item.nama}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="ml-1 p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Mapel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
