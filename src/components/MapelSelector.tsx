"use client";

import { useState, useEffect } from "react";
import { Plus, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JENJANG_OPTIONS = [
  "7 MTs",
  "8 MTs",
  "9 MTs",
  "IL",
  "10 MA",
  "11 MA",
  "12 MA"
];

interface MapelItem {
  jenjang: string;
  nama: string;
}

interface MapelSelectorProps {
  value: string; // The raw string stored in database, e.g. "[7 MTs] Fiqih, [IL] Shorf"
  onChange: (value: string) => void;
}

export default function MapelSelector({ value, onChange }: MapelSelectorProps) {
  const [items, setItems] = useState<MapelItem[]>([]);
  const [checkedJenjangs, setCheckedJenjangs] = useState<string[]>([]);
  const [inputMapel, setInputMapel] = useState("");

  // Parse existing value on mount and when value changes externally
  useEffect(() => {
    if (!value) {
      setItems([]);
      return;
    }
    
    const parsedItems: MapelItem[] = [];
    const segments = value.split(',').map(s => s.trim()).filter(s => s);
    
    segments.forEach(segment => {
      const match = segment.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        parsedItems.push({ jenjang: match[1], nama: match[2] });
      } else {
        // Fallback for old data without brackets
        parsedItems.push({ jenjang: "IL", nama: segment });
      }
    });
    
    setItems(parsedItems);
  }, [value]);

  const handleAdd = () => {
    if (!inputMapel.trim() || checkedJenjangs.length === 0) return;
    
    // Split inputMapel by comma
    const mapels = inputMapel.split(',').map(m => m.trim()).filter(m => m);
    const newItems = [...items];
    
    checkedJenjangs.forEach(jenjang => {
      mapels.forEach(mapel => {
        // Check if already exists (case-insensitive)
        const exists = newItems.some(
          item => item.jenjang === jenjang && item.nama.toLowerCase() === mapel.toLowerCase()
        );
        if (!exists) {
          newItems.push({ jenjang, nama: mapel });
        }
      });
    });
    
    updateValue(newItems);
    setInputMapel(""); // Clear input
    setCheckedJenjangs([]); // Reset checkboxes
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  const updateValue = (newItems: MapelItem[]) => {
    const strValue = newItems.map(item => `[${item.jenjang}] ${item.nama}`).join(', ');
    onChange(strValue);
  };

  return (
    <div className="space-y-3">
      {/* Checkbox Grid for Jenjangs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pilih Kelas / Jenjang (Bisa &gt; 1)</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {JENJANG_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer select-none hover:text-primary-600">
              <input
                type="checkbox"
                checked={checkedJenjangs.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedJenjangs([...checkedJenjangs, opt]);
                  } else {
                    setCheckedJenjangs(checkedJenjangs.filter((j) => j !== opt));
                  }
                }}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="flex gap-2 w-full">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={inputMapel}
            onChange={(e) => setInputMapel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Mapel, pisahkan koma jika lebih dari 1 (cth: Fiqh, Nahwu)"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all outline-none text-slate-700 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputMapel.trim() || checkedJenjangs.length === 0}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Badges Display */}
      {items.length > 0 && (
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-2.5 flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item.jenjang}-${item.nama}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 bg-white border border-primary-100 shadow-sm pl-2.5 pr-1.5 py-1 rounded-lg group"
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-primary-500 uppercase tracking-wider leading-none mb-0.5">{item.jenjang}</span>
                  <span className="text-xs font-semibold text-slate-700 leading-none">{item.nama}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1 p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
