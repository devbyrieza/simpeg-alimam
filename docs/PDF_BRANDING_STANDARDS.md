# Standard Branding Institusi (PDF & Cetak)

Dokumen ini berisi spesifikasi teknis yang telah "dikunci" untuk seluruh surat dan dokumen resmi yang diterbitkan oleh sistem PPDB Al Andalus Al Imam.

## 1. Kop Surat (Header)

Kop surat harus selalu mengikuti struktur berikut:
- **Logo**: Menggunakan `kop-surat.png` (Droplet) di sisi kiri.
- **Garis Vertikal**: Ketebalan `0.2 pt`, warna abu-abu gelap.
- **Padding Teks**: `textX` berada pada posisi `48 pt` dari tepi kiri dokumen.
- **Double Line Bawah**: 
  - Garis atas tebal (`1.2 pt`)
  - Garis bawah tipis (`0.3 pt`)

### Spesifikasi Teks Kop:
- **Baris 1 (Subtitle)**: `Pesantren Al Imam Managed by Andalus` (Font: 8.5pt Normal)
- **Baris 2 (Utama)**: `PANITIA PENERIMAAN SANTRI BARU` (Font: 17pt Bold)
- **Baris 3 (TA)**: `Tahun Ajaran 2026-2027` (Font: 11pt Normal)
- **Baris 4 (Alamat)**: Alamat lengkap institusi (Font: 7pt Small)

## 2. Pengesahan (Stempel & Tanda Tangan)

Seluruh dokumen resmi harus ditandatangani oleh Mudir dan dibubuhi stempel resmi.

- **Posisi X**: Sisi kanan dokumen (`margin_right: 80 pt`).
- **Elemen**:
  - Teks Jabatan: `Mudir Pondok Pesantren`
  - Stempel: Berada di sisi kiri tanda tangan.
  - Tanda Tangan: Berada di sisi kanan stempel.
  - Nama Terang: `Mudir Al Imam` (Font: Bold)

## 3. Aset Digital

Asset berikut disimpan di folder `/public/images/`:
- `kop-surat.png` (Logo Droplet)
- `stempel-pesantren.png` (Stempel Resmi)
- `ttd-mudir.png` (Tanda Tangan Mudir)

---
> [!IMPORTANT]
> Segala perubahan pada koordinat atau aset di atas harus melalui persetujuan pimpinan institusi dan diperbarui pada file konfigurasi `src/config/pdf-branding.ts`.
