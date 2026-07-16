
# Konfigurasi Penyimpanan File (Persistent Storage)

Aplikasi ini menggunakan penyimpanan file lokal untuk bukti pembayaran dan dokumen pendaftaran.
Secara default, file disimpan di dalam container Docker di folder `/app/storage_data`.

## Masalah: File Hilang Setelah Deploy
Jika Anda tidak mengonfigurasi **Persistent Storage** (Volume) di Coolify/Docker, setiap kali Anda melakukan deployment ulang (update aplikasi), container lama akan dihapus beserta semua file yang ada di dalamnya.

## Solusi: Tambahkan Volume di Coolify

Untuk memastikan file aman dan tidak hilang saat deploy, Anda perlu menambahkan konfigurasi Volume.

### Langkah-langkah di Coolify:

1. Login ke Dashboard Coolify.
2. Buka project aplikasi **pp-alimam**.
3. Masuk ke menu **Storage** (atau "Service Configuration" -> "Storage").
4. Klik **Add Storage** atau **Edit Storage**.
5. Tambahkan volume baru dengan konfigurasi berikut:
   - **Volume Name:** `pp-alimam-storage` (atau biarkan default/auto-generated)
   - **Destination Path (in container):** `/app/storage_data`
6. **Simpan** (Save).
7. **Redeploy** aplikasi Anda (klik tombol "Redeploy" atau "Deploy").

### Verifikasi
Setelah redeploy:
1. File yang diupload **SETELAH** konfigurasi ini akan tersimpan aman.
2. File yang diupload **SEBELUM** konfigurasi ini (dan sebelum deploy terakhir) sayangnya **sudah terhapus** oleh sistem Docker saat container di-reset.

## Catatan Penting
- Pastikan path di container persis: `/app/storage_data`
- Jangan ubah path ini kecuali Anda juga mengubah kode di `src/lib/storage/local.ts`.
