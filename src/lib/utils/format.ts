/**
 * Format nama dan gelar sesuai standar:
 * - Nama depan Title Case
 * - Gelar dipisah koma dan spasi (, )
 * - Titik di akhir gelar dihilangkan (M.Ag. -> M.Ag)
 * - Gelar huruf tunggal setelah titik dikapitalisasi (B.a -> B.A, M.m -> M.M)
 */
export function formatNamaGelar(input: string | null | undefined): string {
  if (!input) return "";

  // Pisahkan berdasarkan koma
  const parts = input.split(",").map((p) => p.trim());

  // Bagian pertama adalah Nama Lengkap
  const nama = parts[0]
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Bagian selanjutnya adalah gelar
  const gelar = parts.slice(1).map((g) => {
    // 1. Hapus titik di akhir gelar jika ada
    let cleaned = g.replace(/\.$/, "");

    // 2. Perbaiki huruf kecil setelah titik tunggal di akhir (B.a -> B.A, M.m -> M.M)
    cleaned = cleaned.replace(/\.([a-z])$/, (match, p1) => "." + p1.toUpperCase());

    return cleaned;
  });

  if (gelar.length > 0) {
    return `${nama}, ${gelar.join(", ")}`;
  }

  return nama;
}
