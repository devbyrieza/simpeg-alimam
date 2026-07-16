# Pre-Launch Manual QA Checklist
**Target:** Localhost (or VPS IP)
**Date:** Feb 8, 2026

Since auto-verification was skipped, please manually verify these critical flows:

## 1. Pendaftaran Flow (Calon Santri)
- [ ] **Register**: Go to `/daftar`, create account.
- [ ] **Login**: Login using NIK & No. Pendaftaran.
- [ ] **Data Pribadi**: Fill in all fields in "Data Pribadi" tab.
- [ ] **Pembayaran**:
    - Select manual transfer.
    - Upload dummy proof of payment.
    - Status should change to "Menunggu Verifikasi".

## 2. Admin Keuangan Flow
- [ ] **Login**: `admin.keuangan@alimam.com` / `password123`
- [ ] **Navigate**: Go to "Verifikasi Pembayaran".
- [ ] **Action**: Find the new registrant. Click "Verifikasi" / "Terima".
- [ ] **Verify**: Status registrant should become "Lunas" / "Verified".

## 3. Pendaftar Flow (Post-Payment)
- [ ] **Refresh**: User dashboard should now unlock "Kelengkapan Berkas".
- [ ] **Fill Data**: Fill all forms in "Data Lengkap" (Wali, Alamat, etc.).
- [ ] **Upload Docs**: Upload KK, Akta, dll.
- [ ] **Finalize**: Submit data.

## 4. Admin Berkas Flow
- [ ] **Login**: `admin.berkas@alimam.com` / `password123`
- [ ] **Navigate**: Go to "Verifikasi Dokumen".
- [ ] **Action**: View documents. Valid / Invalid each one.
- [ ] **Finalize**: Verify the student.

## 5. Penguji Flow (Ujian)
- [ ] **Login**: `penguji@alimam.com` / `password123`
- [ ] **Input Nilai**: Find student, input test scores.

## 6. Super Admin Flow
- [ ] **Login**: `admin@alimam.com` / `password123`
- [ ] **Check Stats**: Dashboard should show correct counts.
- [ ] **Export**: Try exporting data to Excel/CSV.
- [ ] **Settings**: Try changing "Tahun Ajaran" active status (be careful, switch back).

---
**If all above pass, the system is 100% ready for the domain.**
