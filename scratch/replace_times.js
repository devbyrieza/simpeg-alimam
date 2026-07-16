const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-alimam',
  'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab',
  'c:/Users/itpua/Dev/Work/al-andalus/template-demo'
];

const newComponents = `const ADMIN_ROLES = ["admin", "admin_super"];

const TimeDataLists = () => (
  <>
    <datalist id="hour-options">
      {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h} />)}
    </datalist>
    <datalist id="minute-options">
      {Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0')).map(m => <option key={m} value={m} />)}
    </datalist>
  </>
);

const FlexibleTimeInput = ({ value, onChange, type }: { value: string, onChange: (val: string) => void, type: "hour" | "minute" }) => {
  const [localValue, setLocalValue] = require("react").useState(value);

  require("react").useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    let formatted = localValue.replace(/\\D/g, "");
    if (!formatted) formatted = "00";
    if (formatted.length === 1) formatted = formatted.padStart(2, '0');
    
    let num = parseInt(formatted);
    if (type === "hour" && num > 23) num = 23;
    if (type === "minute" && num > 59) num = 59;
    
    const final = String(num).padStart(2, '0');
    setLocalValue(final);
    if (final !== value) {
      onChange(final);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\\D/g, "").slice(0, 2);
    setLocalValue(val);
    if (val.length === 2) {
      let num = parseInt(val);
      if (type === "hour" && num > 23) num = 23;
      if (type === "minute" && num > 59) num = 59;
      const final = String(num).padStart(2, '0');
      onChange(final);
    }
  };

  return (
    <input
      type="text"
      list={\`\${type}-options\`}
      className="bg-transparent outline-none cursor-pointer w-12 text-center font-black"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={(e) => e.target.select()}
      placeholder="00"
    />
  );
};

const CustomTimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [h, m] = (value || "00:00").split(":");
  return (
    <div className="relative flex items-center justify-center bg-white border border-stone-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm font-black text-primary-950 focus-within:ring-2 focus-within:ring-primary-500 shadow-sm w-full">
      <FlexibleTimeInput type="hour" value={h || "00"} onChange={(newH) => onChange(\`\${newH}:\${m || "00"}\`)} />
      <span className="text-stone-400 font-bold mx-1">:</span>
      <FlexibleTimeInput type="minute" value={m || "00"} onChange={(newM) => onChange(\`\${h || "00"}:\${newM}\`)} />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
    </div>
  );
};

export default function JadwalPengujiPage() {`;

for (const dir of targetDirs) {
  const filePath = path.join(dir, 'src/app/dashboard/penguji/jadwal/page.tsx');
  if (!fs.existsSync(filePath)) {
    console.log("File not found:", filePath);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Insert components
  if (!content.includes('const TimeDataLists')) {
    content = content.replace('const ADMIN_ROLES = ["admin", "admin_super"];\r\n\r\nexport default function JadwalPengujiPage() {', newComponents);
    content = content.replace('const ADMIN_ROLES = ["admin", "admin_super"];\n\nexport default function JadwalPengujiPage() {', newComponents);
  }

  // 2. Insert TimeDataLists in return
  if (!content.includes('<TimeDataLists />')) {
    content = content.replace(
      '<div className="space-y-6">',
      '<div className="space-y-6">\n      <TimeDataLists />'
    );
  }

  // 3. Regex replacements for input type="time"
  content = content.replace(/<input\s+type="time"\s+required\s+className="[^"]+"\s+value=\{bulkEditForm\.start_time\}\s+onChange=\{\(e\)\s*=>\s*setBulkEditForm\(\{\s*\.\.\.bulkEditForm,\s*start_time:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={bulkEditForm.start_time} onChange={(val) => setBulkEditForm({ ...bulkEditForm, start_time: val })} />');

  content = content.replace(/<input\s+type="time"\s+required\s+className="[^"]+"\s+value=\{bulkEditForm\.end_time\}\s+onChange=\{\(e\)\s*=>\s*setBulkEditForm\(\{\s*\.\.\.bulkEditForm,\s*end_time:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={bulkEditForm.end_time} onChange={(val) => setBulkEditForm({ ...bulkEditForm, end_time: val })} />');

  content = content.replace(/<input\s+type="time"\s+required\s+className="[^"]+"\s+value=\{newAssignment\.waktu_mulai\}\s+onChange=\{\(e\)\s*=>\s*setNewAssignment\(\{\s*\.\.\.newAssignment,\s*waktu_mulai:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={newAssignment.waktu_mulai} onChange={(val) => setNewAssignment({ ...newAssignment, waktu_mulai: val })} />');

  content = content.replace(/<input\s+type="time"\s+className="[^"]+"\s+value=\{newAssignment\.waktu_selesai\}\s+onChange=\{\(e\)\s*=>\s*setNewAssignment\(\{\s*\.\.\.newAssignment,\s*waktu_selesai:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={newAssignment.waktu_selesai || ""} onChange={(val) => setNewAssignment({ ...newAssignment, waktu_selesai: val })} />');

  content = content.replace(/<input\s+type="time"\s+required\s+className="[^"]+"\s+value=\{slotForm\.start_time\}\s+onChange=\{\(e\)\s*=>\s*setSlotForm\(\{\s*\.\.\.slotForm,\s*start_time:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={slotForm.start_time} onChange={(val) => setSlotForm({ ...slotForm, start_time: val })} />');

  content = content.replace(/<input\s+type="time"\s+required\s+className="[^"]+"\s+value=\{slotForm\.end_time\}\s+onChange=\{\(e\)\s*=>\s*setSlotForm\(\{\s*\.\.\.slotForm,\s*end_time:\s*e\.target\.value,\s*\}\)\s*\}\s*\/>/g, 
    '<CustomTimePicker value={slotForm.end_time} onChange={(val) => setSlotForm({ ...slotForm, end_time: val })} />');

  // 4. Bulk Replace the two custom components we made previously
  // Start Time custom component
  const startRegex = /<div className="relative flex items-center justify-center bg-stone-50 border border-stone-100 rounded-2xl pl-4 pr-10 py-2\.5 text-sm font-black text-primary-950 focus-within:ring-2 focus-within:ring-primary-500">\s*<select[\s\S]*?value=\{slot\.start\.split\(":"\)\[0\]\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const newStart = `\$\{e\.target\.value\}:\$\{slot\.start\.split\(":"\)\[1\]\}`;[\s\S]*?const newSlots = \[\.\.\.\(bulkForm\.daySlots\[activeDay\] \|\| \[\]\)\];[\s\S]*?newSlots\[index\]\.start = newStart;[\s\S]*?newSlots\[index\]\.end = calculateEndTime\(newStart, bulkForm\.title\);[\s\S]*?setBulkForm\(\{ \.\.\.bulkForm, daySlots: \{ \.\.\.bulkForm\.daySlots, \[activeDay\]: newSlots \} \}\);[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<\/select>\s*<span className="text-stone-400 font-bold mx-1">:<\/span>\s*<select[\s\S]*?value=\{slot\.start\.split\(":"\)\[1\]\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const newStart = `\$\{slot\.start\.split\(":"\)\[0\]\}:\$\{e\.target\.value\}`;[\s\S]*?const newSlots = \[\.\.\.\(bulkForm\.daySlots\[activeDay\] \|\| \[\]\)\];[\s\S]*?newSlots\[index\]\.start = newStart;[\s\S]*?newSlots\[index\]\.end = calculateEndTime\(newStart, bulkForm\.title\);[\s\S]*?setBulkForm\(\{ \.\.\.bulkForm, daySlots: \{ \.\.\.bulkForm\.daySlots, \[activeDay\]: newSlots \} \}\);[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<\/select>\s*<Clock className="absolute right-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-stone-300 pointer-events-none" \/>\s*<\/div>/g;

  content = content.replace(startRegex, 
    `<CustomTimePicker value={slot.start} onChange={(val) => {
                          const newSlots = [...(bulkForm.daySlots[activeDay] || [])];
                          newSlots[index].start = val;
                          newSlots[index].end = calculateEndTime(val, bulkForm.title);
                          setBulkForm({ ...bulkForm, daySlots: { ...bulkForm.daySlots, [activeDay]: newSlots } });
                        }} />`
  );

  // End Time custom component
  const endRegex = /<div className="relative flex items-center justify-center bg-stone-50 border border-stone-100 rounded-2xl pl-4 pr-10 py-2\.5 text-sm font-black text-primary-950 focus-within:ring-2 focus-within:ring-primary-500">\s*<select[\s\S]*?value=\{slot\.end\.split\(":"\)\[0\]\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const newSlots = \[\.\.\.\(bulkForm\.daySlots\[activeDay\] \|\| \[\]\)\];[\s\S]*?newSlots\[index\]\.end = `\$\{e\.target\.value\}:\$\{slot\.end\.split\(":"\)\[1\]\}`;[\s\S]*?setBulkForm\(\{ \.\.\.bulkForm, daySlots: \{ \.\.\.bulkForm\.daySlots, \[activeDay\]: newSlots \} \}\);[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<\/select>\s*<span className="text-stone-400 font-bold mx-1">:<\/span>\s*<select[\s\S]*?value=\{slot\.end\.split\(":"\)\[1\]\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const newSlots = \[\.\.\.\(bulkForm\.daySlots\[activeDay\] \|\| \[\]\)\];[\s\S]*?newSlots\[index\]\.end = `\$\{slot\.end\.split\(":"\)\[0\]\}:\$\{e\.target\.value\}`;[\s\S]*?setBulkForm\(\{ \.\.\.bulkForm, daySlots: \{ \.\.\.bulkForm\.daySlots, \[activeDay\]: newSlots \} \}\);[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<\/select>\s*<Clock className="absolute right-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-stone-300 pointer-events-none" \/>\s*<\/div>/g;

  content = content.replace(endRegex,
    `<CustomTimePicker value={slot.end} onChange={(val) => {
                          const newSlots = [...(bulkForm.daySlots[activeDay] || [])];
                          newSlots[index].end = val;
                          setBulkForm({ ...bulkForm, daySlots: { ...bulkForm.daySlots, [activeDay]: newSlots } });
                        }} />`
  );

  fs.writeFileSync(filePath, content);
  console.log("Updated", filePath);
}
