import { PrismaClient } from "@prisma/client";

/**
 * ─── DATABASE CONNECTION & WORKER SYSTEM ───
 * File ini menangani koneksi ke Database (Prisma) 
 * dan menjalankan "Pekerja Latar Belakang" (Internal Cron Worker).
 */

// ─── 1. PRISMA SINGLETON PATTERN ───
/**
 * Singleton Pattern memastikan kita tidak membuka terlalu banyak koneksi ke database,
 * yang bisa menyebabkan error "Too many connections" pada server.
 */
const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    console.error("CRITICAL: DATABASE_URL is missing in Production!");
  }

  return new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── 2. INTERNAL CRON WORKER (WHATSAPP QUEUE) ───
/**
 * Sistem ini bertindak sebagai 'Robot' yang bangun setiap 1 menit 
 * untuk mengecek apakah ada pesan WhatsApp yang harus dikirim.
 * Jadi kita tidak perlu setting Cron Job manual di server.
 */
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  if (!(globalThis as any).__CRON_STARTED__) {
    // Pastikan robot tidak jalan saat proses 'build' agar tidak mengganggu deployment
    if (!process.argv.includes("build") && !process.env.NEXT_PHASE?.includes("build")) {
      (globalThis as any).__CRON_STARTED__ = true;
      console.log("🚀 WhatsApp Background Worker: ACTIVE (In-Process)");

      // Robot mulai bekerja 10 detik setelah server nyala
      setTimeout(() => {
        setInterval(async () => {
          try {
            const { processWhatsappQueue } = await import("./whatsapp-queue");
            await processWhatsappQueue();
          } catch (err) {
            console.error("❌ Background Worker Error:", err);
          }
        }, 60000); // Eksekusi setiap 60 detik (1 menit)
      }, 10000);
    }
  }
}
