const fs = require('fs');
const path = require('path');

const SOURCE_MAPPING = [
  'src/app/api',
  'src/lib',
  'src/hooks',
  'src/types',
  'src/app/dashboard/admin',
  'src/app/dashboard/pendaftar',
  'src/app/dashboard/penguji',
  'src/app/admin/sms-dashboard',
  'src/app/daftar/page.tsx',
  'src/app/ppdb/page.tsx' // Note: This will need text replacement
];

const TARGETS = [
  {
    path: '../alandalus-ululalbaab',
    skipFiles: [], // Array of exact paths to skip copying unconditionally
    replacements: [
      ['Al-Andalus Al-Imam', 'Al-Andalus Ulul Albaab'],
      ['PP Al-Andalus Al-Imam', 'PP Al-Andalus Ulul Albaab'],
      ['Ponpes Al-Andalus Al-Imam', 'Ponpes Al-Andalus Ulul Albaab'],
      ['Al-Imam Assistant', 'Ulul Albaab Assistant'],
      ['Al-Imam PPDB', 'Ulul Albaab PPDB'],
      ['Al-Imam', 'Ulul Albaab'],
      ['alimam@andalus.sch.id', 'ululalbaab@andalus.sch.id'],
      ['alandalus.alimam@gmail.com', 'alandalus.ululalbaab@gmail.com'],
      ['pesantren-alimam.com', 'pesantren-ululalbaab.com'],
      ['@pesantrenalimam', '@pesantrenululalbaab'],
      ['Kampus Al-Imam', 'Kampus Ulul Albaab'],
      ['Tim PSB Al-Imam', 'Tim PSB Ulul Albaab']
    ]
  },
  {
    path: '../template-demo',
    skipFiles: [],
    replacements: [
      ['Al-Andalus Al-Imam', 'Sistem PPDB Modern'],
      ['PP Al-Andalus Al-Imam', 'Sistem PPDB Modern'],
      ['Ponpes Al-Andalus Al-Imam', 'Sistem PPDB Modern'],
      ['Al-Imam Assistant', 'PPDB Assistant'],
      ['Al-Imam PPDB', 'PPDB Modern'],
      ['Al-Imam', 'PPDB'],
      ['alimam@andalus.sch.id', 'admin@demo-ppdb.com'],
      ['alandalus.alimam@gmail.com', 'admin@demo-ppdb.com'],
      ['pesantren-alimam.com', 'demo-ppdb.vercel.app'],
      ['@pesantrenalimam', '@demoppdb'],
      ['Kampus Al-Imam', 'Kampus Pusat'],
      ['Tim PSB Al-Imam', 'Sistem PPDB Modern']
    ]
  }
];

// Helper to get all files recursively from a path
function getAllFiles(dirPath, filesArray = []) {
  if (!fs.existsSync(dirPath)) return filesArray;
  
  if (fs.statSync(dirPath).isFile()) {
    filesArray.push(dirPath);
    return filesArray;
  }
  
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.match(/node_modules|\.next|\.git|config/)) {
        filesArray = getAllFiles(fullPath, filesArray);
      }
    } else {
      if (file.match(/\.(tsx|ts|js|json|css)$/)) {
        filesArray.push(fullPath);
      }
    }
  });
  return filesArray;
}

const baseSrcUrl = path.resolve(__dirname, '..'); // Points to alandalus-alimam base

async function sync() {
  for (const target of TARGETS) {
    const targetBaseUrl = path.resolve(baseSrcUrl, target.path);
    console.log(`\n\n=== Syncing to ${target.path} ===`);
    
    let updatedFiles = 0;
    
    for (const sourceRel of SOURCE_MAPPING) {
      const sourceAbs = path.join(baseSrcUrl, sourceRel);
      if (!fs.existsSync(sourceAbs)) {
        console.warn(`[WARN] Source path does not exist: ${sourceRel}`);
        continue;
      }
      
      const filesToSync = getAllFiles(sourceAbs);
      
      for (const fileAbs of filesToSync) {
        const fileRelativePath = path.relative(baseSrcUrl, fileAbs);
        
        // Check skips
        if (target.skipFiles.some(skip => fileRelativePath.includes(skip))) {
          continue;
        }
        
        const targetAbs = path.join(targetBaseUrl, fileRelativePath);
        
        // Ensure dir exists
        fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
        
        let content = fs.readFileSync(fileAbs, 'utf8');
        
        // Apply replacements
        target.replacements.forEach(([search, replace]) => {
          const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          content = content.replace(regex, replace);
        });
        
        // Only write if new or content differs
        let shouldWrite = true;
        if (fs.existsSync(targetAbs)) {
          const currentTargetContent = fs.readFileSync(targetAbs, 'utf8');
          if (currentTargetContent === content) {
            shouldWrite = false;
          }
        }
        
        if (shouldWrite) {
          fs.writeFileSync(targetAbs, content, 'utf8');
          console.log(`[SYNCED] ${fileRelativePath}`);
          updatedFiles++;
        }
      }
    }
    console.log(`Done for ${target.path}. Total files updated: ${updatedFiles}`);
  }
}

sync().catch(console.error);
