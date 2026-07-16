# 🔍 CARA AMBIL NIK DARI DATABASE PRODUCTION

## 📋 PANDUAN LENGKAP

Database production ada di VPS Hostinger (72.61.141.50). Ada beberapa cara untuk mendapatkan NIK asli:

---

## 🛠️ CARA 1: Via SSH + psql (PALING MUDAH)

### Step 1: SSH ke VPS
```bash
ssh root@72.61.141.50
```
Masukkan password VPS.

### Step 2: Masuk ke Database
```bash
psql -U postgres -d ppdb_alimam
```

### Step 3: Query Data Pendaftar
Copy-paste query ini di psql:

```sql
-- Tampilkan data lengkap 3 pendaftar yang dicari
SELECT 
    nama_lengkap,
    nomor_pendaftaran,
    nik,
    jenis_kelamin,
    jenjang,
    no_hp,
    email,
    status_pendaftaran,
    created_at
FROM pendaftar
WHERE 
    nama_lengkap ILIKE '%Azzam%' 
    OR nama_lengkap ILIKE '%Raylan%'
    OR nama_lengkap ILIKE '%Sukari%'
ORDER BY nama_lengkap;
```

### Step 4: Copy Hasilnya
Hasil query akan tampil seperti ini:
```
       nama_lengkap       | nomor_pendaftaran |       nik        | ...
--------------------------+-------------------+------------------+-----
 muhammad Azzam Al hafiz  | A250076           | 3201234567890123 | ...
 Raylan Akbar             | C250026           | 3201234567890124 | ...
 Ahmad Sukari Tes         | MTI2500001        | 3201234567890125 | ...
```

**Copy NIK tersebut** dan update di script restore!

### Step 5: Keluar dari psql
```bash
\q
```

---

## 🛠️ CARA 2: Via Script TypeScript (OTOMATIS)

### Step 1: Dapatkan Connection String Production

Dari Coolify dashboard atau konfigurasi VPS, dapatkan connection string PostgreSQL.

Format:
```
postgresql://postgres:[PASSWORD]@72.61.141.50:5432/ppdb_alimam
```

### Step 2: Set Environment Variable

Edit file `.env` di project lokal:

```bash
# Tambahkan ini di bawah
PRODUCTION_DATABASE_URL="postgresql://postgres:[PASSWORD]@72.61.141.50:5432/ppdb_alimam"
```

### Step 3: Jalankan Script

```bash
npx tsx scripts/check-production-data.ts
```

Script akan:
1. Connect ke production database
2. Cari 3 pendaftar (Azzam, Raylan, Sukari)
3. Tampilkan NIK dan data lengkap mereka
4. Generate code untuk script restore

---

## 🛠️ CARA 3: Via Docker (Jika Pakai Coolify)

### Step 1: SSH ke VPS
```bash
ssh root@72.61.141.50
```

### Step 2: Cari Container PostgreSQL
```bash
docker ps | grep postgres
```

### Step 3: Exec ke Container
```bash
docker exec -it [CONTAINER_ID] psql -U postgres -d ppdb_alimam
```

### Step 4: Jalankan Query
```sql
SELECT 
    nama_lengkap,
    nomor_pendaftaran,
    nik,
    no_hp,
    email
FROM pendaftar
WHERE 
    nama_lengkap ILIKE '%Azzam%' 
    OR nama_lengkap ILIKE '%Raylan%'
    OR nama_lengkap ILIKE '%Sukari%';
```

---

## 🛠️ CARA 4: Via pgAdmin/Database Client (GUI)

Jika Bapak pakai pgAdmin, DBeaver, atau database client lain:

### Step 1: Buat Koneksi Baru

- **Host:** 72.61.141.50
- **Port:** 5432
- **Database:** ppdb_alimam
- **Username:** postgres
- **Password:** [password PostgreSQL]

### Step 2: Jalankan Query

```sql
SELECT 
    nama_lengkap,
    nomor_pendaftaran,
    nik,
    jenis_kelamin,
    jenjang,
    no_hp,
    email,
    user_id,
    CASE 
        WHEN user_id IS NOT NULL THEN '✅ Bisa Login'
        ELSE '❌ Tidak Bisa Login'
    END as status_login
FROM pendaftar
WHERE 
    nama_lengkap ILIKE '%Azzam%' 
    OR nama_lengkap ILIKE '%Raylan%'
    OR nama_lengkap ILIKE '%Sukari%'
ORDER BY nama_lengkap;
```

---

## 📊 QUERY TAMBAHAN YANG BERGUNA

### Cek Semua Pendaftar (jika data sedikit)
```sql
SELECT 
    nomor_pendaftaran,
    nama_lengkap,
    nik,
    jenjang,
    CASE 
        WHEN user_id IS NOT NULL THEN '✅'
        ELSE '❌'
    END as login
FROM pendaftar
ORDER BY created_at DESC;
```

### Cek Apakah Ada Data dengan Nomor Pendaftaran Tertentu
```sql
SELECT * FROM pendaftar
WHERE nomor_pendaftaran IN ('A250076', 'C250026', 'MTI2500001');
```

### Cek Profile yang Terhubung
```sql
SELECT 
    p.nama_lengkap,
    p.nomor_pendaftaran,
    p.nik,
    pr.email,
    pr.phone,
    pr.role
FROM pendaftar p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.nama_lengkap ILIKE '%Azzam%' 
   OR p.nama_lengkap ILIKE '%Raylan%'
   OR p.nama_lengkap ILIKE '%Sukari%';
```

---

## 🔧 TROUBLESHOOTING

### "Connection refused"
- Pastikan PostgreSQL di VPS sedang running
- Cek firewall: `ufw status`
- Pastikan port 5432 terbuka

### "Password authentication failed"
- Gunakan password PostgreSQL yang benar
- Cek di Coolify dashboard untuk credential

### "Database does not exist"
- Pastikan nama database: `ppdb_alimam`
- List semua database: `\l` di psql

### "Table does not exist"
- Cek schema: `\dt` di psql
- Mungkin ada di schema lain: `SELECT * FROM public.pendaftar;`

---

## 📝 SETELAH DAPAT NIK

1. **Update script restore** (`scripts/restore-3-pendaftar.ts`):
   ```typescript
   const RESTORE_DATA = [
       {
           nama_lengkap: 'muhammad Azzam Al hafiz',
           nomor_pendaftaran: 'A250076',
           nik: '3201234567890123', // ← UPDATE DENGAN NIK ASLI
           // ...
       },
       // ...
   ];
   ```

2. **Jalankan di production VPS:**
   ```bash
   ssh root@72.61.141.50
   cd /path/to/pp-alimam
   npx tsx scripts/restore-3-pendaftar.ts
   ```

3. **Verifikasi:**
   ```bash
   npx tsx scripts/check-production-data.ts
   ```

---

## 🆘 BANTUAN LEBIH LANJUT

Jika masih ada masalah, kirim screenshot/error message ke tim IT atau:

1. Cek log di VPS: `tail -f /var/log/coolify/pp-alimam/*.log`
2. Docker logs: `docker logs pp-alimam-app --tail 50`
3. PostgreSQL logs: `docker logs [postgres-container] --tail 50`

---

**Last Updated:** 2026-02-25  
**Script:** `scripts/check-production-data.ts`
