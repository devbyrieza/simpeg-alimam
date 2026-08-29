const fs = require('fs');
const file = 'src/components/dashboard/ProfileSettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Camera to lucide-react imports if not there
if (!content.includes('Camera')) {
  content = content.replace(/AlertCircle\s*\} from "lucide-react";/, 'AlertCircle, Camera } from "lucide-react";');
}

// 2. Add foto_url to UserSession interface
if (!content.includes('foto_url?: string;')) {
  content = content.replace(/username\?: string;/, 'username?: string;\n  foto_url?: string;');
}

// 3. Add foto_url state
if (!content.includes('const [fotoUrl, setFotoUrl]')) {
  content = content.replace(/const \[username, setUsername\] = useState\(user\?\.username \|\| ""\);/, 'const [username, setUsername] = useState(user?.username || "");\n  const [fotoUrl, setFotoUrl] = useState(user?.foto_url || "");');
}

// 4. Update fetch call to include foto_url
content = content.replace(
  /body: JSON\.stringify\(\{ full_name: fullName, email, phone, username \}\)/,
  'body: JSON.stringify({ full_name: fullName, email, phone, username, foto_url: fotoUrl })'
);

// 5. Add handleFileChange function
const handleFileChangeCode = `
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran foto maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
`;
if (!content.includes('handleFileChange')) {
  content = content.replace(/const handleSaveProfile = async/, handleFileChangeCode + '\n  const handleSaveProfile = async');
}

// 6. Replace the generic avatar with the image + upload overlay
const genericAvatarRegex = /<div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">\s*<User className="w-8 h-8" \/>\s*<\/div>/s;
const avatarWithUpload = `
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 group">
                <div className="w-full h-full rounded-full bg-primary-100 border border-primary-200 overflow-hidden flex items-center justify-center text-primary-600 shadow-sm relative">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
                  )}
                  
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-semibold tracking-wider">UBAH</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
`;
content = content.replace(genericAvatarRegex, avatarWithUpload);

fs.writeFileSync(file, content);
console.log("Updated ProfileSettings.tsx");
