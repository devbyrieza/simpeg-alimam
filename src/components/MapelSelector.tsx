"use client";

import { useState, useEffect } from "react";
import { Plus, X, GraduationCap, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JENJANG_OPTIONS = [
  "Umum / Semua Kelas",
  "I'dad Lughowy (IL)",
  "7 MTs",
  "8 MTs",
  "9 MTs",
  "10 MA",
  "11 MA",
  "12 MA",
  "Halaqah Tahfizh"
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
  const [selectedJenjang, setSelectedJenjang] = useState(JENJANG_OPTIONS[0]);
  const [inputMapel, setInputMapel] = useState("");

  // Parse existing value on mount and when value changes externally
  useEffect(() => {
    if (!value) {
      setItems([]);
      return;
    }
    
    const parsedItems: MapelItem[] = [];
    // Split safely by comma, ignoring commas inside brackets if any (though unlikely for mapel)
    const segments = value.split(',').map(s => s.trim()).filter(s => s);
    
    segments.forEach(segment => {
      const match = segment.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        parsedItems.push({ jenjang: match[1], nama: match[2] });
      } else {
        // Fallback for old data without brackets
        parsedItems.push({ jenjang: "Umum / Semua Kelas", nama: segment });
      }
    });
    
    setItems(parsedItems);
  }, [value]);

  const handleAdd = () => {
    if (!inputMapel.trim()) return;
    
    const newItem = { jenjang: selectedJenjang, nama: inputMapel.trim() };
    const newItems = [...items, newItem];
    
    updateValue(newItems);
    setInputMapel(""); // Clear input
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
      {/* Input Form */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-shrink-0 sm:w-5/12">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={selectedJenjang}
            onChange={(e) => setSelectedJenjang(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all outline-none text-slate-700 text-sm appearance-none cursor-pointer"
          >
            {JENJANG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div className="relative flex-grow flex gap-2">
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
              placeholder="Nama mapel (cth: Shorf)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all outline-none text-slate-700 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputMapel.trim()}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Badges Display */}
      {items.length > 0 && (
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 flex flex-wrap gap-2">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item.jenjang}-${item.nama}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 bg-white border border-primary-100 shadow-sm pl-3 pr-2 py-1.5 rounded-lg group"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-primary-500 uppercase tracking-wider leading-none mb-0.5">{item.jenjang}</span>
                  <span className="text-xs font-semibold text-slate-700 leading-none">{item.nama}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1.5 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
