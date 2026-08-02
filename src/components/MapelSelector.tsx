"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, BookOpen, Check, Sparkles, ChevronDown, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Definisi Pemisahan Mapel Resmi Ust Aziz (Kepala Kurikulum) per Jenjang/Kelas
export const MAPEL_PER_KELAS = {
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
};

const PRIMARY_JENJANG_OPTIONS = ["7 MTs", "IL"] as const;
const OTHER_JENJANG_OPTIONS = ["8 MTs", "9 MTs", "10 MA", "11 MA", "12 MA"];

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
  const [activeTab, setActiveTab] = useState<string>("7 MTs");
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
        let j = match[1].trim();
        if (j === "I'dad Lughowy" || j === "I'dad") j = "IL";
        parsedItems.push({ jenjang: j, nama: match[2].trim() });
      } else {
        parsedItems.push({ jenjang: "IL", nama: segment.trim() });
      }
    });

    setItems(parsedItems);
  }, [value]);

  const updateValue = (newItems: MapelItem[]) => {
    const strValue = newItems.map((item) => `[${item.jenjang}] ${item.nama}`).join(", ");
    onChange(strValue);
  };

  // Mapel groups yang sesuai dengan tab kelas aktif yang sedang dipilih
  const currentMapelGroups = useMemo(() => {
    if (activeTab === "IL") {
      return MAPEL_PER_KELAS["IL"];
    }
    // Default 7 MTs atau jenjang lainnya
    return MAPEL_PER_KELAS["7 MTs"];
  }, [activeTab]);

  const handleAddMapel = (mapelName: string) => {
    const cleanMapel = mapelName.trim();
    if (!cleanMapel) return;

    // Tambahkan ke jenjang yang aktif
    const targetJenjangs = checkedJenjangs.length > 0 ? checkedJenjangs : [activeTab];
    const newItems = [...items];

    targetJenjangs.forEach((jenjang) => {
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

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    if (!checkedJenjangs.includes(tab)) {
      setCheckedJenjangs([tab]);
    }
    setSelectedMapel("");
    setIsCustomMode(false);
  };

  const toggleJenjang = (opt: string) => {
    if (checkedJenjangs.includes(opt)) {
      const updated = checkedJenjangs.filter((j) => j !== opt);
      setCheckedJenjangs(updated);
      if (updated.length > 0) setActiveTab(updated[0]);
    } else {
      setCheckedJenjangs([...checkedJenjangs, opt]);
      setActiveTab(opt);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Pemilihan Kelas (Terpisah antara 7 MTs dan IL) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Pilih Tingkat Kelas / Jenjang:
          </span>
          <button
            type="button"
            onClick={() => setShowOtherJenjangs(!showOtherJenjangs)}
            className="text-[10px] text-primary-600 font-semibold hover:underline flex items-center gap-0.5"
          >
            {showOtherJenjangs ? "Tutup Kelas Lain" : "Tampilkan Opsi Kelas Lain"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showOtherJenjangs ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Tab Switcher Utama (7 MTs vs IL) */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            type="button"
            onClick={() => selectTab("7 MTs")}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeTab === "7 MTs"
                ? "bg-white border-primary-600 shadow-sm ring-1 ring-primary-500/20"
                : "bg-slate-100 border-slate-200 hover:bg-white text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${activeTab === "7 MTs" ? "text-primary-700" : "text-slate-700"}`}>
                Kelas 7 MTs
              </span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeTab === "7 MTs" ? "bg-primary-600 text-white" : "border border-slate-300"}`}>
                {activeTab === "7 MTs" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Madrasah Tsanawiyah (Diniyah, Arab, Umum)</p>
          </button>

          <button
            type="button"
            onClick={() => selectTab("IL")}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeTab === "IL"
                ? "bg-white border-amber-600 shadow-sm ring-1 ring-amber-500/20"
                : "bg-slate-100 border-slate-200 hover:bg-white text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${activeTab === "IL" ? "text-amber-700" : "text-slate-700"}`}>
                Kelas IL (I&apos;dad Lughowy)
              </span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeTab === "IL" ? "bg-amber-600 text-white" : "border border-slate-300"}`}>
                {activeTab === "IL" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Persiapan Bahasa Intensif &amp; Diniyah</p>
          </button>
        </div>

        {/* Expandable Other Classes */}
        {showOtherJenjangs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5"
          >
            {OTHER_JENJANG_OPTIONS.map((opt) => {
              const isChecked = checkedJenjangs.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleJenjang(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
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

      {/* 2. Pilih Mata Pelajaran (Tinggal Pilih Khusus Sesuai Kelas Terpilih) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            2. Pilih Mapel Khusus <span className="text-primary-700 font-extrabold font-mono">[{activeTab}]</span>:
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            {activeTab === "IL" ? "Kurikulum IL (Bahasa Intensif)" : "Kurikulum 7 MTs (Diniyah & Umum)"}
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
                <option value="">— Pilih Mata Pelajaran [{activeTab}] —</option>
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
                placeholder={`Ketik nama mapel kustom untuk ${activeTab}...`}
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
            <span>Tambah ke [{activeTab}]</span>
          </button>
        </div>

        {/* Quick Chips Khusus Kelas Terpilih */}
        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Pilihan Cepat Mapel {activeTab}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(activeTab === "IL"
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
      </div>

      {/* 3. Daftar Mapel Yang Ditugaskan Terbagi Berdasarkan Kelas */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Mapel Yang Ditugaskan ({items.length}):
        </span>

        {items.length === 0 ? (
          <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            Belum ada mata pelajaran yang dipilih untuk guru ini.
          </div>
        ) : (
          <div className="space-y-2">
            {/* List for 7 MTs */}
            {items.some((i) => i.jenjang === "7 MTs") && (
              <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-200">
                <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider block mb-1.5">
                  📚 Mapel di Kelas 7 MTs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang !== "7 MTs") return null;
                    return (
                      <span
                        key={`7mts-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-sky-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List for IL */}
            {items.some((i) => i.jenjang === "IL") && (
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1.5">
                  📖 Mapel di Kelas IL (I&apos;dad Lughowy):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang !== "IL") return null;
                    return (
                      <span
                        key={`il-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-amber-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List for Other Jenjangs */}
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
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span className="text-[9px] font-bold text-primary-600">[{item.jenjang}]</span>
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                          title="Hapus"
                        >
                          <X className="w-3 h-3" />
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
