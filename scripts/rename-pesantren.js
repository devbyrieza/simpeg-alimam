const fs = require('fs');
const path = require('path');

function replaceInDir(dir, search, replace) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vscode') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            replaceInDir(filePath, search, replace);
        } else {
            // Only process text files like .ts, .tsx, .js, .json, .env
            if (/\.(ts|tsx|js|json|md|env|env\.production|env\.local)$/.test(file) || file.startsWith('.env')) {
                let content = fs.readFileSync(filePath, 'utf-8');
                if (content.includes(search)) {
                    content = content.split(search).join(replace);
                    fs.writeFileSync(filePath, content);
                    console.log('Updated', filePath);
                }
            }
        }
    }
}

const basePath = path.join(__dirname, '..');
replaceInDir(basePath, 'Pesantren Al Imam Al Islami', 'Pesantren Al Imam Al Islami');
console.log('Done replacing Al-Andalus with Al Islami');
