"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, BookOpen, Check, Sparkles, ChevronDown, CheckSquare, Square, Layers, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
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

const JENJANG_DEFINITIONS = [
  { 
    id: "MTs", 
    label: "MTs (Tsanawiyah)", 
    desc: "Madrasah Tsanawiyah (Aktif: Kelas 7 MTs)",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    classes: [
      { id: "7 MTs", label: "Kelas 7 MTs", isPrimary: true },
      { id: "8 MTs", label: "Kelas 8 MTs", isPrimary: false },
      { id: "9 MTs", label: "Kelas 9 MTs", isPrimary: false },
    ]
  },
  { 
    id: "IL", 
    label: "IL (I'dad Lughowy)", 
    desc: "Persiapan Bahasa Arab Intensif (Aktif: Kelas IL)",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    classes: [
      { id: "IL", label: "Kelas IL (I'dad Lughowy)", isPrimary: true },
    ]
  },
  { 
    id: "MA", 
    label: "MA (Aliyah)", 
    desc: "Madrasah Aliyah (Direncanakan Tahun Depan)",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    classes: [
      { id: "10 MA", label: "Kelas 10 MA", isPrimary: false },
      { id: "11 MA", label: "Kelas 11 MA", isPrimary: false },
      { id: "12 MA", label: "Kelas 12 MA", isPrimary: false },
    ]
  },
];

interface MapelItem {
  jenjang: string; // e.g. "7 MTs", "IL", "10 MA"
  nama: string;
}

interface MapelSelectorProps {
  value: string; // Database format: "[7 MTs] Shorf, [IL] Shorf"
  onChange: (value: string) => void;
}

export default function MapelSelector({ value, onChange }: MapelSelectorProps) {
  const [items, setItems] = useState<MapelItem[]>([]);
  
  // Multi-Selected Jenjangs (e.g. ['MTs', 'IL'])
  const [selectedJenjangs, setSelectedJenjangs] = useState<string[]>(["MTs"]);

  // Multi-Selected Classes (e.g. ['7 MTs', 'IL'])
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["7 MTs"]);

  // Custom inputs per class
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [dropdownInputs, setDropdownInputs] = useState<Record<string, string>>({});

  // Show extra/inactive classes toggle
  const [showOtherClasses, setShowOtherClasses] = useState<Record<string, boolean>>({});

  // Parse existing database value on mount
  useEffect(() => {
    if (!value) {
      setItems([]);
      return;
    }

    const parsedItems: MapelItem[] = [];
    const detectedJenjangs = new Set<string>();
    const detectedClasses = new Set<string>();

    const segments = value.split(",").map((s) => s.trim()).filter((s) => s);

    segments.forEach((segment) => {
      const match = segment.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        let j = match[1].trim();
        if (j === "I'dad Lughowy" || j === "I'dad") j = "IL";
        
        parsedItems.push({ jenjang: j, nama: match[2].trim() });
        detectedClasses.add(j);

        if (j.includes("MTs")) detectedJenjangs.add("MTs");
        else if (j === "IL") detectedJenjangs.add("IL");
        else if (j.includes("MA")) detectedJenjangs.add("MA");
      } else {
        // Fallback without bracket
        parsedItems.push({ jenjang: "7 MTs", nama: segment.trim() });
        detectedClasses.add("7 MTs");
        detectedJenjangs.add("MTs");
      }
    });

    setItems(parsedItems);

    if (detectedJenjangs.size > 0) {
      setSelectedJenjangs(Array.from(detectedJenjangs));
    }
    if (detectedClasses.size > 0) {
      setSelectedClasses(Array.from(detectedClasses));
    }
  }, [value]);

  const updateValue = (newItems: MapelItem[]) => {
    setItems(newItems);
    const strValue = newItems.map((item) => `[${item.jenjang}] ${item.nama}`).join(", ");
    onChange(strValue);
  };

  // Toggle Jenjang selection (Multi-Select)
  const toggleJenjang = (jenjangId: string) => {
    let updatedJenjangs: string[];
    let updatedClasses = [...selectedClasses];

    if (selectedJenjangs.includes(jenjangId)) {
      // If deselecting jenjang
      updatedJenjangs = selectedJenjangs.filter((j) => j !== jenjangId);
      
      // Also remove associated classes and mapels
      const jenjangDef = JENJANG_DEFINITIONS.find((j) => j.id === jenjangId);
      const classIdsToRemove = jenjangDef?.classes.map((c) => c.id) || [];
      updatedClasses = updatedClasses.filter((c) => !classIdsToRemove.includes(c));
      
      const newItems = items.filter((item) => !classIdsToRemove.includes(item.jenjang));
      updateValue(newItems);
    } else {
      // If selecting jenjang
      updatedJenjangs = [...selectedJenjangs, jenjangId];
      
      // Auto-enable primary class of that jenjang
      const jenjangDef = JENJANG_DEFINITIONS.find((j) => j.id === jenjangId);
      const primary = jenjangDef?.classes.find((c) => c.isPrimary) || jenjangDef?.classes[0];
      if (primary && !updatedClasses.includes(primary.id)) {
        updatedClasses.push(primary.id);
      }
    }

    setSelectedJenjangs(updatedJenjangs);
    setSelectedClasses(updatedClasses);
  };

  // Toggle Class selection (Multi-Select)
  const toggleClass = (classId: string) => {
    let updatedClasses: string[];
    if (selectedClasses.includes(classId)) {
      updatedClasses = selectedClasses.filter((c) => c !== classId);
      // Remove mapels of this class
      const newItems = items.filter((item) => item.jenjang !== classId);
      updateValue(newItems);
    } else {
      updatedClasses = [...selectedClasses, classId];
    }
    setSelectedClasses(updatedClasses);
  };

  // Toggle single mapel for a class
  const toggleMapel = (classId: string, mapelName: string) => {
    const clean = mapelName.trim();
    if (!clean || !classId) return;

    const existingIndex = items.findIndex(
      (item) => item.jenjang === classId && item.nama.toLowerCase() === clean.toLowerCase()
    );

    if (existingIndex >= 0) {
      const newItems = items.filter((_, i) => i !== existingIndex);
      updateValue(newItems);
    } else {
      const newItems = [...items, { jenjang: classId, nama: clean }];
      updateValue(newItems);
    }
  };

  const handleAddCustomMapel = (classId: string) => {
    const clean = (customInputs[classId] || "").trim();
    if (!clean) return;

    const exists = items.some(
      (item) => item.jenjang === classId && item.nama.toLowerCase() === clean.toLowerCase()
    );

    if (!exists) {
      const newItems = [...items, { jenjang: classId, nama: clean }];
      updateValue(newItems);
    }

    setCustomInputs((prev) => ({ ...prev, [classId]: "" }));
  };

  const handleSelectDropdown = (classId: string, mapelName: string) => {
    if (!mapelName) return;
    toggleMapel(classId, mapelName);
    setDropdownInputs((prev) => ({ ...prev, [classId]: "" }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  // Counts helpers
  const countPerJenjang = useMemo(() => {
    const counts: Record<string, number> = { MTs: 0, IL: 0, MA: 0 };
    items.forEach((it) => {
      if (it.jenjang.includes("MTs")) counts["MTs"] = (counts["MTs"] || 0) + 1;
      else if (it.jenjang === "IL") counts["IL"] = (counts["IL"] || 0) + 1;
      else if (it.jenjang.includes("MA")) counts["MA"] = (counts["MA"] || 0) + 1;
    });
    return counts;
  }, [items]);

  const countPerKelas = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => {
      counts[it.jenjang] = (counts[it.jenjang] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <div className="space-y-4">
      {/* ─── STEP 1: PILIH JENJANG (MULTI-SELECT CHECKBOX CARDS) ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[11px] font-black flex items-center justify-center">
              1
            </span>
            <span>Pilih Jenjang Mengajar (Bisa Centang Lebih Dari 1 Jenjang):</span>
          </label>
          <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full">
            {items.length} total mapel dipilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {JENJANG_DEFINITIONS.map((j) => {
            const isChecked = selectedJenjangs.includes(j.id);
            const count = countPerJenjang[j.id] || 0;

            return (
              <button
                key={j.id}
                type="button"
                onClick={() => toggleJenjang(j.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative ${
                  isChecked
                    ? "bg-white border-primary-600 shadow-md ring-2 ring-primary-500/20"
                    : "bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked ? "bg-primary-600 text-white shadow-sm" : "border border-slate-300 bg-slate-50"
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`text-xs font-black truncate ${isChecked ? "text-primary-950" : "text-slate-700"}`}>
                      {j.label}
                    </span>
                    {count > 0 && (
                      <span className="bg-primary-600 text-white text-[9px] font-extrabold px-2 py-0.2 rounded-full shrink-0">
                        {count} mapel
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">
                    {j.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 2 & 3: SECTIONS UNTUK SETIAP JENJANG YANG DICENTANG ─── */}
      {selectedJenjangs.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Silakan centang minimal satu jenjang di atas (misal: <b>MTs</b> atau <b>IL</b>) untuk mulai memilih kelas dan mata pelajaran.
        </div>
      ) : (
        <div className="space-y-4">
          {selectedJenjangs.map((jenjangId) => {
            const jenjangDef = JENJANG_DEFINITIONS.find((j) => j.id === jenjangId);
            if (!jenjangDef) return null;

            return (
              <motion.div
                key={jenjangId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
              >
                {/* Header Jenjang Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 font-black text-xs flex items-center justify-center">
                      {jenjangId}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">
                        Pengaturan Mapel Jenjang {jenjangDef.label}
                      </h4>
                      <p className="text-[11px] text-slate-400">{jenjangDef.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {countPerJenjang[jenjangId] || 0} mapel aktif
                    </span>
                  </div>
                </div>

                {/* Sub-Step: Pilih Kelas di Jenjang Ini */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Centang Kelas Mengajar di Jenjang [{jenjangId}]:</span>
                    </label>

                    {jenjangDef.classes.some((c) => !c.isPrimary) && (
                      <button
                        type="button"
                        onClick={() => setShowOtherClasses((prev) => ({ ...prev, [jenjangId]: !prev[jenjangId] }))}
                        className="text-[11px] text-primary-700 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        {showOtherClasses[jenjangId] ? "Sembunyikan Kelas Lain" : "Tampilkan Kelas Lain"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOtherClasses[jenjangId] ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {jenjangDef.classes
                      .filter((c) => c.isPrimary || showOtherClasses[jenjangId] || jenjangId === "MA")
                      .map((c) => {
                        const isClassChecked = selectedClasses.includes(c.id);
                        const classCount = countPerKelas[c.id] || 0;

                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleClass(c.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                              isClassChecked
                                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                                : "bg-white text-slate-700 border-slate-300 hover:border-primary-400"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${isClassChecked ? "bg-white text-primary-600" : "border border-slate-400 bg-slate-50"}`}>
                              {isClassChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{c.label}</span>
                            {classCount > 0 && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${isClassChecked ? "bg-white text-primary-900" : "bg-primary-100 text-primary-800"}`}>
                                {classCount} mapel
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Mapel Pickers untuk Setiap Kelas yang Dicentang di Jenjang Ini */}
                <div className="space-y-3">
                  {jenjangDef.classes
                    .filter((c) => selectedClasses.includes(c.id))
                    .map((c) => {
                      const mapelGroups = MAPEL_PER_KELAS[c.id] || MAPEL_PER_KELAS["7 MTs"] || [];
                      const allMapelItems = mapelGroups.flatMap((g) => g.items);

                      return (
                        <div key={c.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-primary-950 uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                              <span>Pilih Mapel untuk [{c.label}]:</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {countPerKelas[c.id] || 0} mapel terpilih
                            </span>
                          </div>

                          {/* Quick Select Chips (Click to Toggle ON/OFF) */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              Klik Chip Mapel (Centang / Batal Centang):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {allMapelItems.map((m) => {
                                const isSelected = items.some(
                                  (it) => it.jenjang === c.id && it.nama.toLowerCase() === m.toLowerCase()
                                );

                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => toggleMapel(c.id, m)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                      isSelected
                                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                                        : "bg-slate-50 hover:bg-primary-50 hover:text-primary-800 hover:border-primary-300 border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${isSelected ? "bg-white text-primary-600" : "border border-slate-300 bg-white"}`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span>{m}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dropdown Selector & Custom Adder */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                            <div className="flex-1 relative">
                              <select
                                value={dropdownInputs[c.id] || ""}
                                onChange={(e) => handleSelectDropdown(c.id, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                              >
                                <option value="">— Tambah Dari Daftar Lengkap [{c.id}] —</option>
                                {mapelGroups.map((group) => (
                                  <optgroup key={group.kategori} label={`── ${group.kategori} ──`}>
                                    {group.items.map((m) => {
                                      const isAdded = items.some(
                                        (it) => it.jenjang === c.id && it.nama.toLowerCase() === m.toLowerCase()
                                      );
                                      return (
                                        <option key={m} value={m}>
                                          {isAdded ? `✓ ${m} (Sudah Terpilih)` : m}
                                        </option>
                                      );
                                    })}
                                  </optgroup>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customInputs[c.id] || ""}
                                onChange={(e) => setCustomInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustomMapel(c.id);
                                  }
                                }}
                                placeholder={`Ketik mapel kustom ${c.id}...`}
                                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 flex-1 sm:w-48"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomMapel(c.id)}
                                disabled={!(customInputs[c.id] || "").trim()}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── RANGKUMAN SELURUH MAPEL YANG DITUGASKAN (SEMUA JENJANG & KELAS) ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary-600" />
            <span>Rangkuman Mapel Yang Ditugaskan ({items.length} Mapel):</span>
          </span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => updateValue([])}
              className="text-xs text-red-500 hover:underline font-bold"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada mata pelajaran yang dipilih.</p>
        ) : (
          <div className="space-y-2">
            {/* Group 7 MTs */}
            {items.some((i) => i.jenjang === "7 MTs") && (
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider block mb-1.5">
                  📚 Jenjang MTs (Kelas 7 MTs):
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
                          onClick={() => handleRemoveItem(index)}
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
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block mb-1.5">
                  📖 Jenjang IL (Kelas I&apos;dad Lughowy):
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
                          onClick={() => handleRemoveItem(index)}
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

            {/* Group Kelas Lainnya */}
            {items.some((i) => i.jenjang !== "7 MTs" && i.jenjang !== "IL") && (
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block mb-1.5">
                  📌 Kelas Lainnya:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, index) => {
                    if (item.jenjang === "7 MTs" || item.jenjang === "IL") return null;
                    return (
                      <span
                        key={`other-${item.jenjang}-${item.nama}-${index}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-purple-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span className="text-[9px] font-extrabold text-purple-700">[{item.jenjang}]</span>
                        {item.nama}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
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
