const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, '../src/app');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorReplacements = [
  // 1. Primary Action Buttons / Focus Rings / Shadows (Gold/Purple -> Primary)
  { regex: /bg-gold-600/g, replacement: 'bg-primary-600' },
  { regex: /bg-gold-700/g, replacement: 'bg-primary-700' },
  { regex: /focus:border-gold-500/g, replacement: 'focus:border-primary-500' },
  { regex: /focus:ring-gold-500/g, replacement: 'focus:ring-primary-500' },
  { regex: /shadow-gold-600/g, replacement: 'shadow-primary-600' },
  { regex: /text-gold-600/g, replacement: 'text-primary-600' },
  
  { regex: /bg-gradient-to-r from-purple-600 to-indigo-600/g, replacement: 'bg-gradient-to-r from-primary-600 to-primary-700' },
  { regex: /bg-gradient-to-br from-purple-500 to-indigo-600/g, replacement: 'bg-gradient-to-br from-primary-500 to-primary-600' },
  
  // 2. Fix secondary buttons that shouldn't be heavy maroon
  // "Batal", "Lihat Detail"
  { regex: /bg-primary-100 hover:bg-primary-200 text-primary-700/g, replacement: 'bg-slate-100 hover:bg-slate-200 text-slate-700' },

  // 3. Badges: Some badges might use primary-50 text-primary-600, let's diversify them.
  // We can randomly cycle through some colors or just replace common primary badges with blue or teal
  { regex: /bg-primary-50 text-primary-600/g, replacement: 'bg-blue-50 text-blue-600' },
  { regex: /bg-primary-100 text-primary-700/g, replacement: 'bg-teal-100 text-teal-700' }
];

let filesProcessed = 0;
let filesModified = 0;

walkDir(srcAppDir, function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    filesProcessed++;
    let originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // Apply color replacements
    colorReplacements.forEach(rule => {
      content = content.replace(rule.regex, rule.replacement);
    });

    // Implement Autosave for forms
    // Heuristic: If file imports useForm or uses useState for formData, and doesn't have localStorage.getItem
    const hasForm = content.includes('useForm') || content.includes('setFormData');
    const hasAutosave = content.includes('localStorage.getItem');
    const hasUseEffect = content.includes('useEffect');

    if (hasForm && !hasAutosave) {
      // Find a place to insert autosave logic. 
      // This is risky to do via simple string manipulation for 93 files.
      // But we can try finding `const onSubmit` or `const handleSubmit` and just adding a comment 
      // or we just rely on manual edits for those. 
      // Since it's a strict requirement, we'll try to add it.
      // Let's just log files that need autosave.
      console.log('Needs autosave manually:', filePath);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log('Modified:', filePath);
    }
  }
});

console.log(`\nProcessed ${filesProcessed} page.tsx files.`);
console.log(`Modified ${filesModified} files.`);
