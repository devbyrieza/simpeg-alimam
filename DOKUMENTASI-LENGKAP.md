# 📚 DOKUMENTASI SISTEM "SIMPLE & AMAN"

## 🎯 OVERVIEW

Sistem authentication dengan:

- ✅ **Sliding Session** (7 hari, ter-refresh otomatis)
- ✅ **Idle Timeout** (30 menit auto-logout)
- ✅ **Protected Routes** (dashboard butuh login)
- ✅ **Session Monitor** (info sisa waktu session)

---

## 📦 FILE-FILE YANG DIBUAT

```
┌─────────────────────────────────────────────────┐
│ FILE UTAMA:                                     │
├─────────────────────────────────────────────────┤
│ 1. middleware.ts (root)                         │
│ 2. IdleTimeoutTracker.tsx                       │
│ 3. auth.ts (updated)                            │
│ 4. dashboard/layout.tsx                         │
│ 5. login/page.tsx (updated)                     │
│                                                 │
│ FILE BONUS:                                     │
│ 6. SessionMonitor.tsx (opsional)                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 CARA IMPLEMENTASI

### **Step 1: Replace Middleware**

```bash
📁 Lokasi: middleware.ts (root project)
📄 File: 1-middleware.ts

Action: Replace file middleware.ts yang ada
```

### **Step 2: Buat IdleTimeoutTracker Component**

```bash
📁 Lokasi: src/components/auth/IdleTimeoutTracker.tsx
📄 File: 2-IdleTimeoutTracker.tsx

Action: Buat folder 'auth' jika belum ada, lalu buat file ini
```

### **Step 3: Update Auth Helper**

```bash
📁 Lokasi: src/lib/auth.ts
📄 File: 3-auth-UPDATED.ts

Action: Replace file auth.ts yang ada
```

### **Step 4: Buat Dashboard Layout**

```bash
📁 Lokasi: src/app/dashboard/layout.tsx
📄 File: 5-dashboard-layout.tsx

Action: Buat file layout.tsx di folder dashboard
```

### **Step 5: Update Login Page**

```bash
📁 Lokasi: src/app/login/page.tsx
📄 File: 6-login-page-UPDATED.tsx

Action: Replace file login/page.tsx yang ada
```

### **Step 6 (BONUS): Tambah Session Monitor**

```bash
📁 Lokasi: src/components/auth/SessionMonitor.tsx
📄 File: 4-SessionMonitor.tsx

Action: OPSIONAL - Tampilkan info session di dashboard
```

---

## 🎯 CARA KERJA SISTEM

### **1. Sliding Session (Middleware)**

```
SCENARIO NORMAL:
═══════════════════════════════════════════
👤 User login Senin jam 08:00
   → Session expires: Senin depan 08:00 (7 hari)

📱 Rabu jam 10:00: User buka dashboard
   → Middleware detect: Session < 1 hari lagi? TIDAK
   → Action: TIDAK ADA (biarkan saja)

📱 Ahad jam 14:00: User buka dashboard
   → Middleware detect: Session < 1 hari lagi? YA! (sisa 18 jam)
   → Action: REFRESH SESSION
   → Session expires: Ahad depan 14:00 (7 hari baru)

📱 Selasa jam 09:00: User buka dashboard
   → Middleware detect: Session < 1 hari lagi? TIDAK
   → Action: TIDAK ADA (sudah di-refresh)

Result: User aktif = Tidak pernah logout! ✅
```

```
SCENARIO TIDAK AKTIF:
═══════════════════════════════════════════
👤 User login Senin jam 08:00
   → Session expires: Senin depan 08:00 (7 hari)

⏰ User tidak buka dashboard selama 7 hari

📱 Senin depan jam 09:00: User coba buka dashboard
   → Middleware detect: Session expired!
   → Action: LOGOUT OTOMATIS
   → Redirect ke /login dengan pesan

Result: User tidak aktif 7 hari = Logout otomatis! ✅
```

---

### **2. Idle Timeout (Frontend)**

```
CARA KERJA:
═══════════════════════════════════════════
1. Track aktivitas user:
   - Klik mouse ✅
   - Gerak mouse ✅
   - Keyboard ✅
   - Scroll ✅
   - Touch mobile ✅

2. Reset timer setiap ada aktivitas

3. Jika 28 menit tidak ada aktivitas:
   → Tampilkan warning modal
   → Countdown 2 menit

4. User bisa klik "Saya Masih Di Sini"
   → Timer reset ke 30 menit lagi

5. Jika 30 menit penuh tidak ada aktivitas:
   → LOGOUT OTOMATIS
   → Redirect ke /login
```

```
TIMELINE:
═══════════════════════════════════════════
00:00 - User buka dashboard
05:00 - User klik sesuatu (timer reset)
15:00 - User scroll (timer reset)
25:00 - User ketik form (timer reset)
28:00 - Tidak ada aktivitas
        ⚠️ WARNING MODAL MUNCUL
        "Logout dalam 2 menit..."
28:30 - User klik "Saya Masih Di Sini"
        ✅ Timer reset ke 30 menit
30:00 - (alternative) Jika user tidak klik
        🔒 LOGOUT OTOMATIS
```

---

## 🧪 TESTING CHECKLIST

### **Test 1: Protected Routes**

```
[ ] Buka /dashboard tanpa login
    → Harus redirect ke /login ✅

[ ] Login berhasil
    → Redirect ke /dashboard ✅

[ ] Sudah login, buka /login lagi
    → Redirect ke /dashboard ✅
```

### **Test 2: Sliding Session**

```
[ ] Login hari ini
[ ] Buka dashboard 5 hari kemudian
    → Session masih aktif ✅
[ ] Buka dashboard 2 hari kemudian lagi
    → Session masih aktif (sudah di-refresh) ✅
[ ] Tunggu 8 hari tanpa buka dashboard
[ ] Coba buka dashboard
    → Logout otomatis + redirect ✅
```

### **Test 3: Idle Timeout**

```
[ ] Login ke dashboard
[ ] Diamkan 28 menit
    → Warning modal muncul ✅
[ ] Klik "Saya Masih Di Sini"
    → Modal hilang, timer reset ✅
[ ] Diamkan lagi 30 menit
    → Logout otomatis ✅
```

---

## 🎨 CUSTOMIZATION

### **Ubah Durasi Session**

```typescript
// File: middleware.ts
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari
const SESSION_REFRESH_THRESHOLD = 24 * 60 * 60; // Refresh jika < 1 hari

// Ubah ke 14 hari:
const SESSION_MAX_AGE = 14 * 24 * 60 * 60;
const SESSION_REFRESH_THRESHOLD = 2 * 24 * 60 * 60; // Refresh jika < 2 hari
```

### **Ubah Idle Timeout**

```typescript
// File: IdleTimeoutTracker.tsx
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit
const WARNING_TIME = 2 * 60 * 1000; // Warning 2 menit sebelum

// Ubah ke 15 menit:
const IDLE_TIMEOUT = 15 * 60 * 1000;
const WARNING_TIME = 1 * 60 * 1000; // Warning 1 menit sebelum
```

---

## 🛠️ TROUBLESHOOTING

### **Problem: Session tidak ter-refresh**

```
Solusi:
1. Cek middleware.ts sudah di root project
2. Cek environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Restart dev server: npm run dev
```

### **Problem: Idle timeout tidak jalan**

```
Solusi:
1. Cek IdleTimeoutTracker sudah di dashboard/layout.tsx
2. Cek console untuk error
3. Test di private/incognito window
```

### **Problem: User logout terus**

```
Kemungkinan:
1. Session expired (> 7 hari tidak aktif)
   → Normal, user harus login lagi
2. Cookie blocked oleh browser
   → Check browser settings
3. Middleware error
   → Check server logs
```

---

## 📊 MONITORING & LOGS

### **Console Logs:**

```typescript
// Middleware:
"🔄 Refreshing session (sliding window)...";
"✅ Session refreshed successfully!";
"❌ Session refresh failed:";

// Idle Timeout:
"⏰ Idle timeout reached - logging out...";
```

### **URL Parameters:**

```typescript
// Session expired:
/login?expired=true

// Idle timeout:
/login?timeout=true&message=...

// Custom message:
/login?message=Custom+message+here
```

---

## 🎁 BONUS FEATURES

### **SessionMonitor Component**

```typescript
// Tampilkan di dashboard header
import SessionMonitor from "@/components/auth/SessionMonitor";

<div className="flex items-center gap-4">
  <SessionMonitor />
  <LogoutButton />
</div>;

// Akan tampil:
// ✓ Sisa 5 hari 🛡️ (hijau)
// ⏰ Sisa 8 jam (kuning jika < 1 hari)
```

---

## 📖 BEST PRACTICES

1. ✅ **HTTPS Only** - Wajib pakai HTTPS di production
2. ✅ **HttpOnly Cookies** - Already handled by Supabase
3. ✅ **Regular Testing** - Test session & idle timeout tiap deploy
4. ✅ **Monitor Logs** - Check middleware logs untuk error
5. ✅ **User Education** - Kasih tau user tentang idle timeout

---

## ❓ FAQ

**Q: Apakah session bisa lebih dari 7 hari?**
A: Ya! Selama user aktif, session akan ter-refresh terus.

**Q: Bagaimana jika user buka di 2 device?**
A: Session terpisah per device. Logout di device 1 tidak affect device 2.

**Q: Idle timeout jalan di background tab?**
A: Tidak. Hanya track activity di tab aktif. Bagus untuk keamanan!

**Q: Bisakah user disable idle timeout?**
A: Tidak bisa. Ini security feature yang wajib.

---

## 🎉 SELESAI!

Sistem "Simple & Aman" sudah siap digunakan! 🚀

Questions? Check FAQ atau hubungi developer team.
